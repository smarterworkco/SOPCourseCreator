import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CloudUpload, FileText, Sparkles } from 'lucide-react';

interface CourseCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CourseCreationModal({ open, onOpenChange }: CourseCreationModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moduleCount, setModuleCount] = useState('3-5');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [passScore, setPassScore] = useState(80);
  const [step, setStep] = useState<'upload' | 'generating' | 'complete'>('upload');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      moduleCount: string;
      difficulty: string;
      passScore: number;
    }) => {
      const response = await apiRequest('POST', '/api/courses/generate', data);
      return response.json();
    },
    onSuccess: () => {
      setStep('complete');
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({
        title: "Course generated successfully!",
        description: "Your SOP has been converted into a micro-course.",
      });
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 2000);
    },
    onError: (error) => {
      setStep('upload');
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setTitle('');
    setContent('');
    setModuleCount('3-5');
    setDifficulty('intermediate');
    setPassScore(80);
    setStep('upload');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a course title and SOP content.",
        variant: "destructive"
      });
      return;
    }

    if (content.trim().length < 100) {
      toast({
        title: "Content too short",
        description: "Please provide at least 100 characters of SOP content.",
        variant: "destructive"
      });
      return;
    }

    setStep('generating');
    generateMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      moduleCount,
      difficulty,
      passScore
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, "") + " Training");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 text-primary mr-2" />
            Create New Course
          </DialogTitle>
        </DialogHeader>

        {step === 'generating' ? (
          <div className="py-12 text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating your course...</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our AI is analyzing your SOP and creating interactive modules. This usually takes 30-60 seconds.
            </p>
          </div>
        ) : step === 'complete' ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Course created successfully!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting you to the course builder...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">1</div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900 dark:text-white">Upload SOP</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add your content</p>
                </div>
              </div>
              <div className="flex-1 mx-4 h-0.5 bg-primary/20"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center font-semibold">2</div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-500 dark:text-gray-400">AI Generation</p>
                  <p className="text-sm text-gray-400">Processing content</p>
                </div>
              </div>
              <div className="flex-1 mx-4 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center font-semibold">3</div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-500 dark:text-gray-400">Review & Publish</p>
                  <p className="text-sm text-gray-400">Final touches</p>
                </div>
              </div>
            </div>

            {/* Course Title */}
            <div className="space-y-2">
              <Label htmlFor="course-title">Course Title</Label>
              <Input
                id="course-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Customer Service SOP Training"
                required
              />
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <Label>Upload your SOP</Label>
              <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CloudUpload className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Upload your SOP</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Supports plain text files (max 10MB)
                  </p>
                  <div className="relative">
                    <Button type="button" variant="secondary">
                      <FileText className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Text Input Alternative */}
            <div className="border-t pt-6">
              <p className="text-center text-gray-500 dark:text-gray-400 mb-4">or</p>
              <div className="space-y-2">
                <Label htmlFor="sop-text">Paste your SOP content</Label>
                <Textarea
                  id="sop-text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your Standard Operating Procedure text here..."
                  className="min-h-[200px] resize-none"
                  required
                />
              </div>
            </div>

            {/* Generation Settings */}
            <Card className="bg-gray-50 dark:bg-gray-900">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Course Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Modules</Label>
                    <Select value={moduleCount} onValueChange={setModuleCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3-5">3-5 (Recommended)</SelectItem>
                        <SelectItem value="5-7">5-7 (Detailed)</SelectItem>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quiz Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pass Score (%)</Label>
                    <Select value={passScore.toString()} onValueChange={(value) => setPassScore(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="70">70%</SelectItem>
                        <SelectItem value="80">80% (Recommended)</SelectItem>
                        <SelectItem value="90">90%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="primary-gradient"
                disabled={!title.trim() || !content.trim() || content.trim().length < 100}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Course
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
