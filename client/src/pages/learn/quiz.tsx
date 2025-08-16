import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import LearnerLayout from '@/components/layout/learner-layout';
import QuizInterface from '@/components/quiz/quiz-interface';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import type { Course, Module, Question, CourseWithModules } from '@shared/schema';

export default function Quiz() {
  const params = useParams<{ courseId: string; moduleId: string }>();
  const [, setLocation] = useLocation();

  const { data: courseData, isLoading } = useQuery<CourseWithModules>({
    queryKey: ['/api/courses', params.courseId],
    enabled: !!params.courseId,
  });

  if (isLoading) {
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
  const currentModule = modules?.find(m => m.id === params.moduleId);

  if (!currentModule) {
    return (
      <LearnerLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Module not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The module you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation(`/learn/${params.courseId}`)} variant="outline">
            Back to Course
          </Button>
        </div>
      </LearnerLayout>
    );
  }

  const moduleIndex = modules?.findIndex(m => m.id === params.moduleId) || 0;
  const progressPercentage = Math.round(((moduleIndex + 1) / (modules?.length || 1)) * 100);

  return (
    <LearnerLayout 
      showBackButton 
      backTo={`/learn/${params.courseId}`}
      title={`${course.title} - ${currentModule.title}`}
      progress={progressPercentage}
    >
      <QuizInterface
        course={course}
        module={currentModule}
        moduleIndex={moduleIndex}
        totalModules={modules?.length || 1}
        onComplete={() => setLocation(`/learn/${params.courseId}`)}
      />
    </LearnerLayout>
  );
}
