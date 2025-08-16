import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";

// Pages
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import AdminDashboard from "@/pages/admin/dashboard";
import Courses from "@/pages/admin/courses";
import CourseBuilder from "@/pages/admin/course-builder";
import Learners from "@/pages/admin/learners";
import Analytics from "@/pages/admin/analytics";
import CourseList from "@/pages/learn/course-list";
import CourseView from "@/pages/learn/course-view";
import Quiz from "@/pages/learn/quiz";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/courses" component={Courses} />
      <Route path="/admin/courses/:id/edit" component={CourseBuilder} />
      <Route path="/admin/learners" component={Learners} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/learn" component={CourseList} />
      <Route path="/learn/:courseId" component={CourseView} />
      <Route path="/learn/:courseId/quiz/:moduleId" component={Quiz} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
