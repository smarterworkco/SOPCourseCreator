import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { PageSpinner } from '@/components/ui/loading-spinner';
import { 
  ArrowLeft,
  BookOpen,
  Trophy,
  User,
  LogOut,
  GraduationCap
} from 'lucide-react';

interface LearnerLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  backTo?: string;
  title?: string;
  progress?: number;
}

export default function LearnerLayout({ 
  children, 
  showBackButton = false, 
  backTo = '/learn',
  title,
  progress 
}: LearnerLayoutProps) {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access courses</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Header */}
      <header className="bg-primary text-primary-foreground p-4 sm:hidden">
        <div className="flex items-center justify-between mb-4">
          {showBackButton ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(backTo)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <div />
          )}
          <h3 className="font-semibold">{title || 'Learning'}</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
        
        {progress !== undefined && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="bg-primary-foreground/20" />
          </div>
        )}
      </header>

      {/* Desktop Header */}
      <header className="hidden sm:block bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center">
                <GraduationCap className="h-8 w-8 text-primary mr-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">SOPify</span>
              </Link>
              
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation(backTo)}
                  className="ml-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              
              {title && (
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white ml-4">
                  {title}
                </h1>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="flex items-center space-x-4">
                <Link href="/learn">
                  <a className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    <BookOpen className="h-4 w-4" />
                    <span>Courses</span>
                  </a>
                </Link>
                <Link href="/learn/certificates">
                  <a className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    <Trophy className="h-4 w-4" />
                    <span>Certificates</span>
                  </a>
                </Link>
              </nav>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="font-semibold text-gray-900 dark:text-white">{user.displayName}</p>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
