import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateCourseFromSOP, improveModuleContent, regenerateQuiz } from "./services/openai";
import { 
  insertUserSchema, insertOrgSchema, insertCourseSchema, insertEnrollmentSchema,
  insertModuleSchema, insertQuestionSchema, insertAttemptSchema, insertBadgeSchema,
  insertUploadSchema
} from "@shared/schema";
import { z } from "zod";

// Session middleware for simple auth
interface AuthSession {
  userId?: string;
  orgId?: string;
  roles?: string[];
}

declare module "express-session" {
  interface SessionData {
    auth: AuthSession;
  }
}

// Simple session setup (in production, use proper session store)
import session from "express-session";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.auth?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
    const userRoles = req.session.auth?.roles || [];
    if (!roles.some(role => userRoles.includes(role))) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // Create new user and organization for first login
        const org = await storage.createOrg({
          name: `${email.split('@')[0]}'s Organization`,
          ownerUid: '', // Will be set after user creation
          planTier: 'starter'
        });

        user = await storage.createUser({
          email,
          displayName: email.split('@')[0],
          orgId: org.id,
          roles: ['owner', 'admin']
        });

        // Update org with owner ID
        await storage.updateOrg(org.id, { ownerUid: user.id });
      }

      req.session.auth = {
        userId: user.id,
        orgId: user.orgId || undefined,
        roles: user.roles
      };

      res.json({ user, success: true });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.auth?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.auth.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      const org = user.orgId ? await storage.getOrg(user.orgId) : null;
      res.json({ user, org });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  // Course generation routes
  app.post("/api/courses/generate", requireAuth, requireRole(['owner', 'admin']), async (req, res) => {
    try {
      const schema = z.object({
        title: z.string().min(1),
        content: z.string().min(100),
        moduleCount: z.string().default("3-5"),
        difficulty: z.string().default("intermediate"),
        passScore: z.number().min(50).max(100).default(80)
      });

      const { title, content, moduleCount, difficulty, passScore } = schema.parse(req.body);
      const { userId, orgId } = req.session.auth!;

      if (!orgId) {
        return res.status(400).json({ message: "No organization associated with user" });
      }

      // Create upload record
      const upload = await storage.createUpload({
        orgId,
        source: 'paste',
        content,
        processed: false
      });

      // Generate course using OpenAI
      const generatedCourse = await generateCourseFromSOP(content, moduleCount, difficulty, passScore);

      // Create course record
      const course = await storage.createCourse({
        orgId,
        title: title || generatedCourse.title,
        status: 'draft',
        passScore,
        estMins: generatedCourse.estimatedMinutes,
        createdBy: userId!
      });

      // Create modules and questions
      for (let i = 0; i < generatedCourse.modules.length; i++) {
        const moduleData = generatedCourse.modules[i];
        
        const module = await storage.createModule({
          courseId: course.id,
          index: i,
          title: moduleData.title,
          contentHtml: moduleData.contentHtml,
          learningObjectives: moduleData.learningObjectives
        });

        // Create questions for this module
        for (let j = 0; j < moduleData.questions.length; j++) {
          const questionData = moduleData.questions[j];
          await storage.createQuestion({
            moduleId: module.id,
            index: j,
            stemHtml: questionData.stemHtml,
            options: questionData.options,
            correctIndex: questionData.correctIndex,
            rationaleHtml: questionData.rationaleHtml
          });
        }
      }

      // Mark upload as processed
      await storage.updateUpload(upload.id, { processed: true });

      res.json({ course, success: true });
    } catch (error) {
      console.error("Course generation error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate course" });
    }
  });

  // Course management routes
  app.get("/api/courses", requireAuth, async (req, res) => {
    try {
      const { orgId } = req.session.auth!;
      if (!orgId) {
        return res.status(400).json({ message: "No organization associated with user" });
      }

      const courses = await storage.getCoursesByOrg(orgId);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", requireAuth, async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Verify user has access to this course's organization
      const { orgId, roles } = req.session.auth!;
      if (course.orgId !== orgId && !roles?.includes('admin')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const modules = await storage.getModulesByCourse(course.id);
      const modulesWithQuestions = await Promise.all(
        modules.map(async (module) => {
          const questions = await storage.getQuestionsByModule(module.id);
          return { ...module, questions };
        })
      );

      res.json({ course, modules: modulesWithQuestions });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.patch("/api/courses/:id", requireAuth, requireRole(['owner', 'admin']), async (req, res) => {
    try {
      const updates = z.object({
        title: z.string().optional(),
        status: z.enum(['draft', 'published']).optional(),
        passScore: z.number().min(50).max(100).optional()
      }).parse(req.body);

      const finalUpdates: any = { ...updates };
      if (updates.status === 'published') {
        finalUpdates.publishedAt = new Date();
      }

      const course = await storage.updateCourse(req.params.id, finalUpdates);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // Module management routes
  app.patch("/api/modules/:id", requireAuth, requireRole(['owner', 'admin']), async (req, res) => {
    try {
      const updates = z.object({
        title: z.string().optional(),
        contentHtml: z.string().optional(),
        learningObjectives: z.array(z.string()).optional()
      }).parse(req.body);

      const module = await storage.updateModule(req.params.id, updates);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      res.json(module);
    } catch (error) {
      res.status(500).json({ message: "Failed to update module" });
    }
  });

  app.post("/api/modules/:id/improve", requireAuth, requireRole(['owner', 'admin']), async (req, res) => {
    try {
      const { feedback } = z.object({ feedback: z.string().optional() }).parse(req.body);
      
      const module = await storage.getModulesByCourse(''); // This needs the module ID lookup
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      // Use OpenAI to improve content
      const improved = await improveModuleContent(module[0].contentHtml, feedback);
      
      const updatedModule = await storage.updateModule(req.params.id, {
        contentHtml: improved.contentHtml,
        learningObjectives: improved.learningObjectives
      });

      res.json(updatedModule);
    } catch (error) {
      res.status(500).json({ message: "Failed to improve module" });
    }
  });

  // Enrollment routes
  app.post("/api/enrollments", requireAuth, async (req, res) => {
    try {
      const { courseId } = insertEnrollmentSchema.omit({ orgId: true, userId: true }).parse(req.body);
      const { userId, orgId } = req.session.auth!;

      if (!orgId) {
        return res.status(400).json({ message: "No organization associated with user" });
      }

      // Check if already enrolled
      const existing = await storage.getEnrollment(userId!, courseId);
      if (existing) {
        return res.json(existing);
      }

      const enrollment = await storage.createEnrollment({
        orgId: orgId!,
        courseId,
        userId: userId!,
        status: 'in_progress'
      });

      res.json(enrollment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  app.get("/api/enrollments/my", requireAuth, async (req, res) => {
    try {
      const { userId } = req.session.auth!;
      const enrollments = await storage.getEnrollmentsByUser(userId!);
      
      // Get course details for each enrollment
      const enrollmentsWithCourses = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await storage.getCourse(enrollment.courseId);
          return { ...enrollment, course };
        })
      );

      res.json(enrollmentsWithCourses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Quiz and attempt routes
  app.post("/api/attempts", requireAuth, async (req, res) => {
    try {
      const attemptData = insertAttemptSchema.parse(req.body);
      const { userId } = req.session.auth!;

      const attempt = await storage.createAttempt({
        ...attemptData,
        userId: userId!
      });

      res.json(attempt);
    } catch (error) {
      res.status(500).json({ message: "Failed to record attempt" });
    }
  });

  app.get("/api/attempts/:courseId", requireAuth, async (req, res) => {
    try {
      const { userId } = req.session.auth!;
      const attempts = await storage.getAttemptsByUser(userId!, req.params.courseId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attempts" });
    }
  });

  // Badge and certificate routes
  app.post("/api/badges", requireAuth, async (req, res) => {
    try {
      const badgeData = insertBadgeSchema.parse(req.body);
      const { userId } = req.session.auth!;

      const badge = await storage.createBadge({
        ...badgeData,
        userId: userId!
      });

      res.json(badge);
    } catch (error) {
      res.status(500).json({ message: "Failed to create badge" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/overview", requireAuth, requireRole(['owner', 'admin']), async (req, res) => {
    try {
      const { orgId } = req.session.auth!;
      if (!orgId) {
        return res.status(400).json({ message: "No organization associated with user" });
      }

      const courses = await storage.getCoursesByOrg(orgId);
      const totalCourses = courses.length;
      const activeCourses = courses.filter(c => c.status === 'published').length;

      // Mock analytics data for now
      res.json({
        totalCourses,
        activeCourses,
        activeLearners: 0, // Would need to count unique enrolled users
        completionRate: 87,
        certificatesIssued: 0,
        avgCompletionTime: 6.2
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
