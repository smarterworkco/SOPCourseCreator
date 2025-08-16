import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminLayout from '@/components/layout/admin-layout';
import { useToast } from '@/hooks/use-toast';
import { 
  UserPlus, 
  Search, 
  Mail, 
  Users, 
  Award,
  Clock,
  Send
} from 'lucide-react';

export default function Learners() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  const { toast } = useToast();

  // Mock data - replace with real API calls
  const learners = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      status: 'active',
      coursesEnrolled: 3,
      coursesCompleted: 2,
      lastActivity: '2 hours ago',
      avatar: 'SJ'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@company.com',
      status: 'active',
      coursesEnrolled: 2,
      coursesCompleted: 1,
      lastActivity: '1 day ago',
      avatar: 'MC'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      email: 'emma@company.com',
      status: 'pending',
      coursesEnrolled: 0,
      coursesCompleted: 0,
      lastActivity: 'Never',
      avatar: 'EW'
    }
  ];

  const filteredLearners = learners.filter(learner =>
    learner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInviteLearner = () => {
    if (!inviteEmail.trim()) return;
    
    // TODO: Implement actual invite functionality
    toast({
      title: "Invitation sent",
      description: `Invitation sent to ${inviteEmail}`,
    });
    
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learners</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your team members and track their progress</p>
          </div>
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="primary-gradient">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Learner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Learner</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="learner@company.com"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInviteLearner} className="primary-gradient">
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Learners</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{learners.length}</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Learners</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {learners.filter(l => l.status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Completion</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">78%</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Invites</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {learners.filter(l => l.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search learners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Learners List */}
        <Card>
          <CardHeader>
            <CardTitle>All Learners</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLearners.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {learners.length === 0 ? 'No learners yet' : 'No learners found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {learners.length === 0 
                    ? 'Invite your first learner to get started.'
                    : 'Try adjusting your search criteria.'
                  }
                </p>
                {learners.length === 0 && (
                  <Button onClick={() => setIsInviteOpen(true)} className="primary-gradient">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Your First Learner
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLearners.map((learner) => (
                  <div key={learner.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {learner.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{learner.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{learner.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{learner.coursesCompleted}/{learner.coursesEnrolled}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {learner.lastActivity}
                        </div>
                      </div>
                      
                      <Badge variant={learner.status === 'active' ? 'default' : 'secondary'}>
                        {learner.status === 'active' ? 'Active' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
