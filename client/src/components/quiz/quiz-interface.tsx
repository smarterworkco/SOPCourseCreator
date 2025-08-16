import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Target,
  Award,
  RotateCcw
} from 'lucide-react';
import type { Course, Module, Question } from '@shared/schema';

interface QuizInterfaceProps {
  course: Course;
  module: Module & { questions: Question[] };
  moduleIndex: number;
  totalModules: number;
  onComplete: () => void;
}

interface QuizState {
  phase: 'content' | 'quiz' | 'results';
  currentQuestionIndex: number;
  answers: (number | null)[];
  submitted: boolean[];
  score: number;
  showFeedback: boolean;
  canProceed: boolean;
}

export default function QuizInterface({ 
  course, 
  module, 
  moduleIndex, 
  totalModules, 
  onComplete 
}: QuizInterfaceProps) {
  const [state, setState] = useState<QuizState>({
    phase: 'content',
    currentQuestionIndex: 0,
    answers: new Array(module.questions?.length || 0).fill(null),
    submitted: new Array(module.questions?.length || 0).fill(false),
    score: 0,
    showFeedback: false,
    canProceed: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const recordAttemptMutation = useMutation({
    mutationFn: async (data: {
      courseId: string;
      moduleId: string;
      questionId: string;
      selectedIndex: number;
      isCorrect: boolean;
    }) => {
      const response = await apiRequest('POST', '/api/attempts', data);
      return response.json();
    }
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: async (data: {
      enrollmentId: string;
      progress: any;
      status?: string;
    }) => {
      // This would need the enrollment ID - for now we'll skip this
      // In a real implementation, you'd fetch the enrollment first
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments/my'] });
    }
  });

  const awardBadgeMutation = useMutation({
    mutationFn: async (data: {
      courseId: string;
      name: string;
    }) => {
      const response = await apiRequest('POST', '/api/badges', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Badge earned!",
        description: "You've completed the course and earned a certificate.",
      });
    }
  });

  const questions = module.questions || [];
  const currentQuestion = questions[state.currentQuestionIndex];
  const isLastQuestion = state.currentQuestionIndex === questions.length - 1;
  const progressPercentage = ((state.currentQuestionIndex + 1) / questions.length) * 100;

  const handleStartQuiz = () => {
    setState(prev => ({ ...prev, phase: 'quiz' }));
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setState(prev => ({
      ...prev,
      answers: prev.answers.map((answer, index) => 
        index === prev.currentQuestionIndex ? answerIndex : answer
      )
    }));
  };

  const handleSubmitAnswer = async () => {
    const selectedAnswer = state.answers[state.currentQuestionIndex];
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    
    // Record the attempt
    await recordAttemptMutation.mutateAsync({
      courseId: course.id,
      moduleId: module.id,
      questionId: currentQuestion.id,
      selectedIndex: selectedAnswer,
      isCorrect
    });

    setState(prev => ({
      ...prev,
      submitted: prev.submitted.map((sub, index) => 
        index === prev.currentQuestionIndex ? true : sub
      ),
      showFeedback: true,
      score: isCorrect ? prev.score + 1 : prev.score
    }));
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Calculate final score and show results
      const finalScore = (state.score / questions.length) * 100;
      const passed = finalScore >= course.passScore;
      
      setState(prev => ({
        ...prev,
        phase: 'results',
        canProceed: passed
      }));

      // If this is the last module and they passed, award a badge
      if (passed && moduleIndex === totalModules - 1) {
        awardBadgeMutation.mutate({
          courseId: course.id,
          name: `${course.title} Completion`
        });
      }
    } else {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        showFeedback: false
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (state.currentQuestionIndex > 0) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
        showFeedback: prev.submitted[prev.currentQuestionIndex - 1]
      }));
    }
  };

  const handleRetryQuiz = () => {
    setState({
      phase: 'quiz',
      currentQuestionIndex: 0,
      answers: new Array(questions.length).fill(null),
      submitted: new Array(questions.length).fill(false),
      score: 0,
      showFeedback: false,
      canProceed: false
    });
  };

  const handleComplete = () => {
    onComplete();
  };

  if (state.phase === 'content') {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Module Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl mb-2">Module {moduleIndex + 1}: {module.title}</CardTitle>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>Questions: {questions.length}</span>
                  <span className="mx-2">•</span>
                  <span>Pass score: {course.passScore}%</span>
                </div>
              </div>
              <Badge variant="outline">
                {moduleIndex + 1} of {totalModules}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Learning Objectives */}
        {module.learningObjectives && module.learningObjectives.length > 0 && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Target className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Learning Objectives</h3>
              </div>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                {module.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Module Content */}
        <Card>
          <CardContent className="p-6">
            <div 
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: module.contentHtml }}
            />
          </CardContent>
        </Card>

        {/* Start Quiz Button */}
        <div className="text-center">
          <Button onClick={handleStartQuiz} size="lg" className="primary-gradient">
            Start Quiz ({questions.length} questions)
          </Button>
        </div>
      </div>
    );
  }

  if (state.phase === 'results') {
    const finalScore = (state.score / questions.length) * 100;
    const passed = finalScore >= course.passScore;

    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <Card className={`border-2 ${passed ? 'border-emerald-500' : 'border-red-500'}`}>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              passed ? 'bg-emerald-100' : 'bg-red-100'
            }`}>
              {passed ? (
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <CardTitle className={`text-2xl ${passed ? 'text-emerald-700' : 'text-red-700'}`}>
              {passed ? 'Congratulations!' : 'Not Quite There'}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              {passed 
                ? 'You have successfully completed this module.'
                : `You need ${course.passScore}% to pass. Keep trying!`
              }
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.score}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{questions.length - state.score}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Incorrect</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                  {Math.round(finalScore)}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              {!passed && (
                <Button onClick={handleRetryQuiz} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry Quiz
                </Button>
              )}
              <Button onClick={handleComplete} className="primary-gradient">
                {passed ? (
                  moduleIndex === totalModules - 1 ? (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      View Certificate
                    </>
                  ) : (
                    'Continue to Next Module'
                  )
                ) : (
                  'Back to Course'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz phase
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Quiz Header */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Module {moduleIndex + 1} Quiz</h3>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Question {state.currentQuestionIndex + 1} of {questions.length}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="bg-white/20" />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <div dangerouslySetInnerHTML={{ __html: currentQuestion.stemHtml }} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={state.answers[state.currentQuestionIndex]?.toString() || ''}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            disabled={state.submitted[state.currentQuestionIndex]}
          >
            {currentQuestion.options.map((option, index) => {
              const isSelected = state.answers[state.currentQuestionIndex] === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const isSubmitted = state.submitted[state.currentQuestionIndex];
              
              let optionClass = 'quiz-option';
              if (isSubmitted) {
                if (isSelected && isCorrect) optionClass += ' correct';
                else if (isSelected && !isCorrect) optionClass += ' incorrect';
                else if (!isSelected && isCorrect) optionClass += ' correct';
              } else if (isSelected) {
                optionClass += ' selected';
              }

              return (
                <div key={index} className={optionClass}>
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all"
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
                    <span className="flex-1">{option}</span>
                    {isSubmitted && isCorrect && (
                      <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          {/* Feedback */}
          {state.showFeedback && (
            <Card className={`${
              state.answers[state.currentQuestionIndex] === currentQuestion.correctIndex
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                : 'border-red-500 bg-red-50 dark:bg-red-950/20'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {state.answers[state.currentQuestionIndex] === currentQuestion.correctIndex ? (
                    <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`font-semibold mb-2 ${
                      state.answers[state.currentQuestionIndex] === currentQuestion.correctIndex
                        ? 'text-emerald-800 dark:text-emerald-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {state.answers[state.currentQuestionIndex] === currentQuestion.correctIndex 
                        ? 'Correct!' 
                        : 'Incorrect'
                      }
                    </h4>
                    <div 
                      className="text-sm text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.rationaleHtml }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={state.currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {state.submitted[state.currentQuestionIndex] ? (
              <Button onClick={handleNextQuestion} className="primary-gradient">
                {isLastQuestion ? 'View Results' : 'Next Question'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmitAnswer}
                disabled={state.answers[state.currentQuestionIndex] === null || recordAttemptMutation.isPending}
                className="primary-gradient"
              >
                {recordAttemptMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Submit Answer'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
