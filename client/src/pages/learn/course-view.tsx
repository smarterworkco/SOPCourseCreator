import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import LearnerLayout from '@/components/layout/learner-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Lock,
  Target,
  Award,
  BookOpen
} from 'lucide-react';
import type { Course, Module, Question, Enrollment, CourseWithModules } from '@shared/schema';

interface EnrollmentWithCourse extends Enrollment {
  course: Course;
}

export default function CourseView() {
  const params = useParams<{ courseId: string }>();
  const [, setLocation] = useLocation();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courseData, isLoading: courseLoading } = useQuery<CourseWithModules>({
    queryKey: ['/api/courses', params.courseId],
    enabled: !!params.courseId,
  });

  const { data: enrollments } = useQuery<EnrollmentWithCourse[]>({
    queryKey: ['/api/enrollments/my'],
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiRequest('POST', '/api/enrollments', { courseId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments/my'] });
      toast({
        title: "Enrolled successfully",
        description: "You can now start the course.",
      });
    },
    onError: (error) => {
      toast({
        title: "Enrollment failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    }
  });

  if (courseLoading) {
    return (
      <LearnerLayout>
        <div className="p-6">
          <LoadingSpinner size="lg" className="mx-auto" />
        </div>
      </LearnerLayout>
    );
  }

  if (!courseData) {
    return (
      <LearnerLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Course not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The course you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/learn')} variant="outline">
            Back to Courses
          </Button>
        </div>
      </LearnerLayout>
    );
  }

  const { course, modules } = courseData as CourseWithModules;
  const enrollment = enrollments?.find(e => e.courseId === params.courseId);
  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.status === 'completed';

  // Calculate progress
  const currentModuleIndex = enrollment?.progress ? (enrollment.progress as any).moduleIndex || 0 : 0;
  const progressPercentage = isCompleted ? 100 : Math.round((currentModuleIndex / (modules?.length || 1)) * 100);

  const handleEnroll = () => {
    if (params.courseId) {
      enrollMutation.mutate(params.courseId);
    }
  };

  const handleStartModule = (moduleIndex: number) => {
    if (!isEnrolled) {
      handleEnroll();
      return;
    }
    
    const moduleId = modules?.[moduleIndex]?.id;
    if (moduleId) {
      setLocation(`/learn/${params.courseId}/quiz/${moduleId}`);
    }
  };

  const isModuleUnlocked = (moduleIndex: number) => {
    if (!isEnrolled) return moduleIndex === 0;
    return moduleIndex <= currentModuleIndex;
  };

  const isModuleCompleted = (moduleIndex: number) => {
    if (!isEnrolled) return false;
    return moduleIndex < currentModuleIndex || isCompleted;
  };

  return (
    <LearnerLayout 
      showBackButton 
      title={course.title}
      progress={isEnrolled ? progressPercentage : undefined}
    >
      <div className="p-4 sm:p-6 space-y-6">
        {/* Course Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl mb-2">{course.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.estMins || 5} min
                  </span>
                  <span>Pass score: {course.passScore}%</span>
                  <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                    {course.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>
              
              {isCompleted && (
                <div className="flex items-center space-x-2 text-emerald-600">
                  <Award className="h-5 w-5" />
                  <span className="font-semibold">Completed</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          {isEnrolled && (
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Your Progress</span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Course Modules */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Course Modules</h2>
          
          {modules?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Course content is being prepared
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  The modules for this course are still being generated. Please check back shortly.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {modules?.map((module, index) => {
                const isUnlocked = isModuleUnlocked(index);
                const isModComplete = isModuleCompleted(index);
                const isCurrent = index === currentModuleIndex && !isCompleted;
                
                return (
                  <Card 
                    key={module.id} 
                    className={`transition-all ${
                      isCurrent ? 'ring-2 ring-primary' : ''
                    } ${!isUnlocked ? 'opacity-60' : ''}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          isModComplete 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : isUnlocked
                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                        }`}>
                          {isModComplete ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : !isUnlocked ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {module.title}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>{module.questions?.length || 0} questions</span>
                            </div>
                          </div>
                          
                          {/* Learning Objectives */}
                          {module.learningObjectives && module.learningObjectives.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center mb-2">
                                <Target className="h-4 w-4 text-blue-600 mr-2" />
                                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                  Learning Objectives
                                </span>
                              </div>
                              <ul className="text-sm text-gray-600 dark:text-gray-400 ml-6 space-y-1">
                                {module.learningObjectives.map((objective, objIndex) => (
                                  <li key={objIndex} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{objective}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Module Content Preview */}
                          <div 
                            className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 mb-4 line-clamp-3"
                            dangerouslySetInnerHTML={{ 
                              __html: module.contentHtml.substring(0, 200) + (module.contentHtml.length > 200 ? '...' : '')
                            }}
                          />
                          
                          <Button
                            onClick={() => handleStartModule(index)}
                            disabled={!isUnlocked || enrollMutation.isPending}
                            className={`${
                              isModComplete 
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : isCurrent
                                ? 'primary-gradient'
                                : ''
                            }`}
                          >
                            {enrollMutation.isPending ? (
                              <LoadingSpinner size="sm" />
                            ) : isModComplete ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Review Module
                              </>
                            ) : isCurrent ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Continue Learning
                              </>
                            ) : isUnlocked ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Start Module
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Locked
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Enrollment CTA */}
        {!isEnrolled && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ready to start learning?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Enroll in this course to track your progress and earn a certificate upon completion.
              </p>
              <Button 
                onClick={handleEnroll} 
                className="primary-gradient"
                disabled={enrollMutation.isPending}
              >
                {enrollMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Enroll Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </LearnerLayout>
  );
}
