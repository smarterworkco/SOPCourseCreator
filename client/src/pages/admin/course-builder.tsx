import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/components/layout/admin-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  GripVertical,
  Edit3,
  RefreshCw,
  CheckCircle,
  Clock
} from 'lucide-react';
import type { Course, Module, Question, CourseWithModules } from '@shared/schema';



export default function CourseBuilder() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingTitle, setEditingTitle] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courseData, isLoading } = useQuery<CourseWithModules>({
    queryKey: ['/api/courses', params.id],
    enabled: !!params.id,
  });

  const updateCourseMutation = useMutation({
    mutationFn: async (updates: { title?: string; status?: string; passScore?: number }) => {
      const response = await apiRequest('PATCH', `/api/courses/${params.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses', params.id] });
      toast({
        title: "Course updated",
        description: "Changes saved successfully.",
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

  const updateModuleMutation = useMutation({
    mutationFn: async ({ moduleId, updates }: { moduleId: string; updates: Partial<Module> }) => {
      const response = await apiRequest('PATCH', `/api/modules/${moduleId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses', params.id] });
      toast({
        title: "Module updated",
        description: "Changes saved successfully.",
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <LoadingSpinner size="lg" className="mx-auto" />
        </div>
      </AdminLayout>
    );
  }

  if (!courseData) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Course not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The course you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/admin/courses')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const { course, modules } = courseData as CourseWithModules;

  const handleTitleSave = () => {
    if (editingTitle.trim() && editingTitle !== course.title) {
      updateCourseMutation.mutate({ title: editingTitle.trim() });
    }
    setEditingTitle('');
  };

  const handlePublishToggle = () => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    updateCourseMutation.mutate({ status: newStatus });
  };

  const handleModuleUpdate = (moduleId: string, updates: Partial<Module>) => {
    updateModuleMutation.mutate({ moduleId, updates });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/admin/courses')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                {editingTitle ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={handleTitleSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTitleSave();
                        if (e.key === 'Escape') setEditingTitle('');
                      }}
                      className="text-xl font-bold"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleTitleSave}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {course.title}
                    </h1>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTitle(course.title)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
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
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant={course.status === 'published' ? 'secondary' : 'default'}
              onClick={handlePublishToggle}
              disabled={updateCourseMutation.isPending}
            >
              {updateCourseMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : course.status === 'published' ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules ({modules?.length || 0})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Course Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  {modules?.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        No modules found. This course may still be generating.
                      </p>
                      <Button variant="outline" onClick={() => setActiveTab('modules')}>
                        View Modules
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {modules?.map((module, index) => (
                        <div key={module.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{module.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {module.questions?.length || 0} questions • {module.learningObjectives?.length || 0} objectives
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Modules</span>
                      <span className="font-semibold">{modules?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Questions</span>
                      <span className="font-semibold">
                        {modules?.reduce((total, module) => total + (module.questions?.length || 0), 0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Est. Duration</span>
                      <span className="font-semibold">{course.estMins || 5} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Pass Score</span>
                      <span className="font-semibold">{course.passScore}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            {modules?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Course is generating
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please wait while AI generates the course modules and content.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {modules?.map((module, index) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {module.questions?.length || 0} questions
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <GripVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Learning Objectives */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Learning Objectives</Label>
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <ul className="space-y-1 text-sm text-blue-900 dark:text-blue-100">
                            {module.learningObjectives?.map((objective, objIndex) => (
                              <li key={objIndex} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{objective}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Module Content */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Content</Label>
                        <div 
                          className="prose prose-sm max-w-none bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                          dangerouslySetInnerHTML={{ __html: module.contentHtml }}
                        />
                      </div>

                      {/* Questions Preview */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Quiz Questions ({module.questions?.length || 0})
                        </Label>
                        <div className="space-y-3">
                          {module.questions?.map((question, qIndex) => (
                            <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium text-sm">Question {qIndex + 1}</h5>
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                              </div>
                              <div 
                                className="text-sm text-gray-700 dark:text-gray-300 mb-2"
                                dangerouslySetInnerHTML={{ __html: question.stemHtml }}
                              />
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {question.options?.map((option, optIndex) => (
                                  <div 
                                    key={optIndex}
                                    className={`p-2 rounded ${
                                      optIndex === question.correctIndex
                                        ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    }`}
                                  >
                                    {option}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pass Score (%)</Label>
                    <Input
                      type="number"
                      min="50"
                      max="100"
                      value={course.passScore}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 50 && value <= 100) {
                          updateCourseMutation.mutate({ passScore: value });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Duration (minutes)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={course.estMins || 5}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
