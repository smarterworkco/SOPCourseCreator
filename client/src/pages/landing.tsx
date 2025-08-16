import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { 
  GraduationCap, 
  Bot, 
  Smartphone, 
  TrendingUp, 
  Award, 
  Users, 
  Edit3, 
  Play, 
  Check, 
  Twitter, 
  Linkedin, 
  Github 
} from 'lucide-react';

export default function Landing() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation('/admin');
    } else {
      setLocation('/auth');
    }
  };

  const features = [
    {
      icon: <Bot className="h-6 w-6 text-primary" />,
      title: "AI-Powered Generation",
      description: "Upload any SOP and our AI automatically creates 3-7 learning modules with objectives and quizzes."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-purple-600" />,
      title: "Mobile-First Learning",
      description: "Optimized for mobile devices so learners can complete training anywhere, anytime."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
      title: "Progress Tracking",
      description: "Real-time analytics on completion rates, quiz performance, and learner engagement."
    },
    {
      icon: <Award className="h-6 w-6 text-amber-600" />,
      title: "Completion Certificates",
      description: "Automatic PDF certificate generation with custom branding for course completions."
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: "Team Management",
      description: "Invite learners, assign courses, and manage organizational roles and permissions."
    },
    {
      icon: <Edit3 className="h-6 w-6 text-red-600" />,
      title: "Course Builder",
      description: "Edit AI-generated content, customize quizzes, and fine-tune modules before publishing."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      description: "Perfect for small teams",
      features: [
        "Up to 3 courses",
        "25 active learners", 
        "Basic analytics",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "$79",
      description: "Great for growing teams",
      features: [
        "Up to 20 courses",
        "250 active learners",
        "Advanced analytics",
        "Custom branding",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Scale",
      price: "$199",
      description: "For large organizations",
      features: [
        "Unlimited courses",
        "Unlimited learners",
        "Advanced reporting",
        "API access",
        "Dedicated support"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary flex items-center">
                  <GraduationCap className="mr-2 h-8 w-8" />
                  SOPify
                </h1>
              </div>
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <a href="#features" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">Features</a>
                <a href="#pricing" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">Pricing</a>
                <a href="#demo" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">Demo</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Button onClick={() => setLocation('/admin')} className="primary-gradient">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => setLocation('/auth')}
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted} className="primary-gradient">
                    Start Free Trial
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="hero-title font-bold text-gray-900 dark:text-white mb-6">
              Turn SOPs into{' '}
              <span className="text-primary">Micro-Courses</span>
              {' '}in Minutes
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Upload your Standard Operating Procedures and our AI instantly converts them into engaging 5-minute training modules with quizzes, progress tracking, and completion certificates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={handleGetStarted} 
                className="primary-gradient text-lg px-8 py-3 shadow-lg"
              >
                Start 14-Day Free Trial
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="text-lg px-8 py-3"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              No credit card required • Setup in 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need for micro-learning
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From SOP upload to learner completion, we've built every component you need for effective training.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the plan that fits your team size and training needs. All plans include 14-day free trial.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      {plan.description}
                    </p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-emerald-500 mr-3" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'primary-gradient' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={handleGetStarted}
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400">
              All plans include 14-day free trial • No setup fees • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <GraduationCap className="mr-2 h-8 w-8" />
                SOPify
              </h3>
              <p className="text-gray-300 mb-6 max-w-md">
                Transform your Standard Operating Procedures into engaging micro-courses with AI-powered generation, interactive quizzes, and progress tracking.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Demo</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 SOPify. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
