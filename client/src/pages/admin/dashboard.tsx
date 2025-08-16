import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layout/admin-layout';
import CourseCreationModal from '@/components/course/course-creation-modal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useState } from 'react';
import { Link } from 'wouter';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Plus, 
  UserPlus, 
  CheckCircle,
  Clock,
  Award
} from 'lucide-react';

export default function AdminDashboard() {
  const [showCourseModal, setShowCourseModal] = useState(false);

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses'],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics/overview'],
  });

  if (coursesLoading || analyticsLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <LoadingSpinner size="lg" className="mx-auto" />
        </div>
      </AdminLayout>
    );
  }

  const recentCourses = Array.isArray(courses) ? courses.slice(0, 5) : [];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your training programs.</p>
          </div>
          <Button onClick={() => setShowCourseModal(true)} className="primary-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.totalCourses ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.activeCourses ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.completionRate ?? 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Learners</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.activeLearners ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Courses */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Courses</CardTitle>
                  <CardDescription>Your latest course creations</CardDescription>
                </div>
                <Link href="/admin/courses">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first course to get started with micro-learning.
                  </p>
                  <Button onClick={() => setShowCourseModal(true)} className="primary-gradient">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Course
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentCourses.map((course: any) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{course.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{course.estMins || 5} min read</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                          {course.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                        <Link href={`/admin/courses/${course.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setShowCourseModal(true)} 
                  className="w-full justify-start primary-gradient"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Course
                </Button>
                <Link href="/admin/learners">
                  <Button variant="outline" className="w-full justify-start">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Learners
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Additional Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>Key metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Certificates Issued</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{analytics?.certificatesIssued ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Avg. Completion Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{analytics?.avgCompletionTime ?? 0} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{analytics?.completionRate ?? 0}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <CourseCreationModal 
          open={showCourseModal} 
          onOpenChange={setShowCourseModal}
        />
      </div>
    </AdminLayout>
  );
}
