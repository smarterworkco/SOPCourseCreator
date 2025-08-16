import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner, PageSpinner } from '@/components/ui/loading-spinner';
import { 
  Home, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  CreditCard, 
  LogOut,
  GraduationCap
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, org, logout, isLoading } = useAuth();

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access the admin dashboard</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home, current: location === '/admin' },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen, current: location.startsWith('/admin/courses') },
    { name: 'Learners', href: '/admin/learners', icon: Users, current: location === '/admin/learners' },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: location === '/admin/analytics' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, current: location === '/admin/settings' },
    { name: 'Billing', href: '/admin/billing', icon: CreditCard, current: location === '/admin/billing' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <GraduationCap className="h-8 w-8 text-primary mr-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">SOPify</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="font-semibold text-gray-900 dark:text-white">{user.displayName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{org?.name}</p>
                </div>
              </div>
              <Badge variant={org?.planTier === 'pro' ? 'default' : 'secondary'} className="hidden sm:inline-flex">
                {org?.planTier || 'Starter'} Plan
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-4rem)]">
          <div className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <a className={`flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors ${
                    item.current
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}>
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
