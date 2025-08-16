import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/layout/admin-layout';
import CourseCreationModal from '@/components/course/course-creation-modal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Eye,
  Clock,
  Users,
  MoreVertical,
  Filter
} from 'lucide-react';
import type { Course } from '@shared/schema';

export default function Courses() {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'draft' | 'published' }) => {
      const response = await apiRequest('PATCH', `/api/courses/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({
        title: "Course updated",
        description: "Course status has been changed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    }
  });

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleToggleStatus = (course: Course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    publishMutation.mutate({ id: course.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <LoadingSpinner size="lg" className="mx-auto" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your training courses and content</p>
          </div>
          <Button onClick={() => setShowCourseModal(true)} className="primary-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {courses?.length === 0 ? 'No courses yet' : 'No courses found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {courses?.length === 0 
                  ? 'Create your first course to get started with micro-learning.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {courses?.length === 0 && (
                <Button onClick={() => setShowCourseModal(true)} className="primary-gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                      {course.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.estMins || 5} min</span>
                    <span className="mx-2">•</span>
                    <Users className="h-4 w-4 mr-1" />
                    <span>0 learners</span> {/* TODO: Add enrollment count */}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/courses/${course.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant={course.status === 'published' ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handleToggleStatus(course)}
                      disabled={publishMutation.isPending}
                      className="flex-1"
                    >
                      {publishMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : course.status === 'published' ? (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Unpublish
                        </>
                      ) : (
                        'Publish'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CourseCreationModal 
          open={showCourseModal} 
          onOpenChange={setShowCourseModal}
        />
      </div>
    </AdminLayout>
  );
}
