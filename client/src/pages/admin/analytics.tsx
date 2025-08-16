import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/layout/admin-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Download,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/overview'],
  });

  // Mock data for charts and detailed analytics
  const coursePerformance = [
    { name: 'Customer Service SOP', enrollments: 32, completions: 30, avgScore: 86 },
    { name: 'Safety Protocols', enrollments: 28, completions: 24, avgScore: 92 },
    { name: 'Sales Process', enrollments: 19, completions: 15, avgScore: 78 },
    { name: 'Quality Assurance', enrollments: 15, completions: 13, avgScore: 89 }
  ];

  const recentActivity = [
    { user: 'Sarah completed "Safety Protocols"', time: '2 minutes ago', type: 'completion' },
    { user: 'Mike started "Customer Service SOP"', time: '15 minutes ago', type: 'start' },
    { user: 'Emma earned certificate for "Sales Process"', time: '1 hour ago', type: 'certificate' },
    { user: 'John failed quiz in "Quality Assurance"', time: '2 hours ago', type: 'failure' },
    { user: 'Lisa completed "Customer Service SOP"', time: '3 hours ago', type: 'completion' }
  ];

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">Track performance and identify improvement opportunities</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">94</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">↗ +12% from last month</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.completionRate || 87}%</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">↗ +3% from last month</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">86%</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">↘ -2% from last month</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Certificates</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">82</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">↗ +18% from last month</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Course Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Course Performance</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Chart Placeholder */}
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Completion Rate Chart</p>
                  <p className="text-sm">87% average completion rate</p>
                </div>
              </div>
              
              {/* Course List */}
              <div className="space-y-4">
                {coursePerformance.map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{course.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{course.enrollments} learners enrolled</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-emerald-600">
                          {Math.round((course.completions / course.enrollments) * 100)}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-amber-600">{course.avgScore}%</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Avg Score</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Overview Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Courses</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{analytics?.totalCourses || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Active Learners</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{analytics?.activeLearners || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Certificates Issued</span>
                  <span className="font-semibold text-gray-900 dark:text-white">82</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Avg. Completion Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{analytics?.avgCompletionTime || 6.2} min</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'completion' ? 'bg-emerald-100' :
                        activity.type === 'certificate' ? 'bg-purple-100' :
                        activity.type === 'failure' ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        {activity.type === 'completion' ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : activity.type === 'certificate' ? (
                          <Award className="h-4 w-4 text-purple-600" />
                        ) : activity.type === 'failure' ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">{activity.user}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-primary hover:text-primary/80">
                  View all activity
                </Button>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Completion Report (CSV)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Progress Summary (PDF)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
