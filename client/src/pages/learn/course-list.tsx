import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import LearnerLayout from '@/components/layout/learner-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Play, 
  CheckCircle, 
  Search,
  Award,
  Users,
  Plus
} from 'lucide-react';
import type { Course, Enrollment } from '@shared/schema';

interface EnrollmentWithCourse extends Enrollment {
  course: Course;
}

export default function CourseList() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: enrollments, isLoading } = useQuery<EnrollmentWithCourse[]>({
    queryKey: ['/api/enrollments/my'],
  });

  const { data: allCourses } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
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

  // Get available courses (published courses not enrolled in)
  const enrolledCourseIds = new Set(enrollments?.map(e => e.courseId) || []);
  const availableCourses = allCourses?.filter(course => 
    course.status === 'published' && !enrolledCourseIds.has(course.id)
  ) || [];

  // Filter enrollments based on search
  const filteredEnrollments = enrollments?.filter(enrollment =>
    enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Filter available courses based on search
  const filteredAvailableCourses = availableCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressPercentage = (enrollment: EnrollmentWithCourse) => {
    if (enrollment.status === 'completed') return 100;
    if (!enrollment.progress) return 0;
    
    // Calculate progress based on current module
    const progress = enrollment.progress as any;
    return Math.round((progress.moduleIndex || 0) * 25); // Assuming 4 modules on average
  };

  const handleEnroll = (courseId: string) => {
    enrollMutation.mutate(courseId);
  };

  if (isLoading) {
    return (
      <LearnerLayout>
        <div className="p-6">
          <LoadingSpinner size="lg" className="mx-auto" />
        </div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Learning</h1>
          <p className="text-gray-600 dark:text-gray-400">Continue your training journey</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* My Courses */}
        {filteredEnrollments.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEnrollments.map((enrollment) => {
                const progress = getProgressPercentage(enrollment);
                return (
                  <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <Badge variant={enrollment.status === 'completed' ? 'default' : 'secondary'}>
                          {enrollment.status === 'completed' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </>
                          ) : (
                            'In Progress'
                          )}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">{enrollment.course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{enrollment.course.estMins || 5} min</span>
                      </div>
                      
                      {enrollment.status !== 'completed' && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                      
                      <Link href={`/learn/${enrollment.courseId}`}>
                        <Button className="w-full primary-gradient" size="sm">
                          {enrollment.status === 'completed' ? (
                            <>
                              <Award className="h-4 w-4 mr-2" />
                              View Certificate
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Continue Learning
                            </>
                          )}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Courses */}
        {filteredAvailableCourses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAvailableCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-3">
                      <BookOpen className="h-6 w-6 text-secondary" />
                    </div>
                    <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{course.estMins || 5} min</span>
                      <span className="mx-2">•</span>
                      <Users className="h-4 w-4 mr-1" />
                      <span>New</span>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredEnrollments.length === 0 && filteredAvailableCourses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {enrollments?.length === 0 && availableCourses.length === 0 
                  ? 'No courses available yet' 
                  : 'No courses found'
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {enrollments?.length === 0 && availableCourses.length === 0
                  ? 'Check back later for new training courses.'
                  : 'Try adjusting your search criteria.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </LearnerLayout>
  );
}
