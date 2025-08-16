import { 
  type User, type InsertUser, type Org, type InsertOrg,
  type Course, type InsertCourse, type Module, type InsertModule,
  type Question, type InsertQuestion, type Enrollment, type InsertEnrollment,
  type Attempt, type InsertAttempt, type Badge, type InsertBadge,
  type Upload, type InsertUpload
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Organizations
  getOrg(id: string): Promise<Org | undefined>;
  createOrg(org: InsertOrg): Promise<Org>;
  updateOrg(id: string, updates: Partial<Org>): Promise<Org | undefined>;

  // Courses
  getCourse(id: string): Promise<Course | undefined>;
  getCoursesByOrg(orgId: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, updates: Partial<Course>): Promise<Course | undefined>;

  // Modules
  getModulesByCourse(courseId: string): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: string, updates: Partial<Module>): Promise<Module | undefined>;
  deleteModule(id: string): Promise<void>;

  // Questions
  getQuestionsByModule(moduleId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, updates: Partial<Question>): Promise<Question | undefined>;
  deleteQuestion(id: string): Promise<void>;

  // Enrollments
  getEnrollmentsByUser(userId: string): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]>;
  getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: string, updates: Partial<Enrollment>): Promise<Enrollment | undefined>;

  // Attempts
  getAttemptsByUser(userId: string, courseId: string): Promise<Attempt[]>;
  createAttempt(attempt: InsertAttempt): Promise<Attempt>;

  // Badges
  getBadgesByUser(userId: string): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;

  // Uploads
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: string): Promise<Upload | undefined>;
  updateUpload(id: string, updates: Partial<Upload>): Promise<Upload | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private orgs: Map<string, Org> = new Map();
  private courses: Map<string, Course> = new Map();
  private modules: Map<string, Module> = new Map();
  private questions: Map<string, Question> = new Map();
  private enrollments: Map<string, Enrollment> = new Map();
  private attempts: Map<string, Attempt> = new Map();
  private badges: Map<string, Badge> = new Map();
  private uploads: Map<string, Upload> = new Map();

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      orgId: insertUser.orgId ?? null,
      roles: insertUser.roles ?? ['learner']
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Organizations
  async getOrg(id: string): Promise<Org | undefined> {
    return this.orgs.get(id);
  }

  async createOrg(insertOrg: InsertOrg): Promise<Org> {
    const id = randomUUID();
    const org: Org = { 
      ...insertOrg, 
      id, 
      createdAt: new Date(),
      planTier: insertOrg.planTier ?? 'starter'
    };
    this.orgs.set(id, org);
    return org;
  }

  async updateOrg(id: string, updates: Partial<Org>): Promise<Org | undefined> {
    const org = this.orgs.get(id);
    if (!org) return undefined;
    const updatedOrg = { ...org, ...updates };
    this.orgs.set(id, updatedOrg);
    return updatedOrg;
  }

  // Courses
  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCoursesByOrg(orgId: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.orgId === orgId);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = { 
      ...insertCourse, 
      id, 
      createdAt: new Date(),
      status: insertCourse.status ?? 'draft',
      passScore: insertCourse.passScore ?? 80,
      publishedAt: insertCourse.publishedAt ?? null
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    const updatedCourse = { ...course, ...updates };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  // Modules
  async getModulesByCourse(courseId: string): Promise<Module[]> {
    return Array.from(this.modules.values())
      .filter(module => module.courseId === courseId)
      .sort((a, b) => a.index - b.index);
  }

  async createModule(insertModule: InsertModule): Promise<Module> {
    const id = randomUUID();
    const module: Module = { ...insertModule, id };
    this.modules.set(id, module);
    return module;
  }

  async updateModule(id: string, updates: Partial<Module>): Promise<Module | undefined> {
    const module = this.modules.get(id);
    if (!module) return undefined;
    const updatedModule = { ...module, ...updates };
    this.modules.set(id, updatedModule);
    return updatedModule;
  }

  async deleteModule(id: string): Promise<void> {
    this.modules.delete(id);
  }

  // Questions
  async getQuestionsByModule(moduleId: string): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(question => question.moduleId === moduleId)
      .sort((a, b) => a.index - b.index);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const question: Question = { ...insertQuestion, id };
    this.questions.set(id, question);
    return question;
  }

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question | undefined> {
    const question = this.questions.get(id);
    if (!question) return undefined;
    const updatedQuestion = { ...question, ...updates };
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async deleteQuestion(id: string): Promise<void> {
    this.questions.delete(id);
  }

  // Enrollments
  async getEnrollmentsByUser(userId: string): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(enrollment => enrollment.userId === userId);
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(enrollment => enrollment.courseId === courseId);
  }

  async getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined> {
    return Array.from(this.enrollments.values())
      .find(enrollment => enrollment.userId === userId && enrollment.courseId === courseId);
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = randomUUID();
    const enrollment: Enrollment = { 
      ...insertEnrollment, 
      id, 
      startedAt: new Date(),
      status: insertEnrollment.status ?? 'in_progress',
      progress: insertEnrollment.progress ?? null,
      completedAt: insertEnrollment.completedAt ?? null
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async updateEnrollment(id: string, updates: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const enrollment = this.enrollments.get(id);
    if (!enrollment) return undefined;
    const updatedEnrollment = { ...enrollment, ...updates };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  // Attempts
  async getAttemptsByUser(userId: string, courseId: string): Promise<Attempt[]> {
    return Array.from(this.attempts.values())
      .filter(attempt => attempt.userId === userId && attempt.courseId === courseId);
  }

  async createAttempt(insertAttempt: InsertAttempt): Promise<Attempt> {
    const id = randomUUID();
    const attempt: Attempt = { ...insertAttempt, id, createdAt: new Date() };
    this.attempts.set(id, attempt);
    return attempt;
  }

  // Badges
  async getBadgesByUser(userId: string): Promise<Badge[]> {
    return Array.from(this.badges.values()).filter(badge => badge.userId === userId);
  }

  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = randomUUID();
    const badge: Badge = { 
      ...insertBadge, 
      id, 
      awardedAt: new Date(),
      certificateUrl: insertBadge.certificateUrl ?? null
    };
    this.badges.set(id, badge);
    return badge;
  }

  // Uploads
  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const id = randomUUID();
    const upload: Upload = { 
      ...insertUpload, 
      id, 
      createdAt: new Date(),
      processed: insertUpload.processed ?? false,
      error: insertUpload.error ?? null
    };
    this.uploads.set(id, upload);
    return upload;
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    return this.uploads.get(id);
  }

  async updateUpload(id: string, updates: Partial<Upload>): Promise<Upload | undefined> {
    const upload = this.uploads.get(id);
    if (!upload) return undefined;
    const updatedUpload = { ...upload, ...updates };
    this.uploads.set(id, updatedUpload);
    return updatedUpload;
  }
}

export const storage = new MemStorage();
