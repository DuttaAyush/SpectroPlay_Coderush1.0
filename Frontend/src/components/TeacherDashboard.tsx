import { useEffect, useState } from 'react';
import { Download, TrendingUp, Users, Clock, BookOpen, Award, Target, Star, Activity, Calendar, Settings, BarChart3, Plus, Mail, Search, MoreVertical, Trash2, UserCheck, UserX } from 'lucide-react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AnalyticsData {
  totalStudents: number;
  activeStudents: number;
  completedModules: number;
  averageProgress: number;
  averageTimePerSession: number;
  moduleEngagement: Array<{
    name: string;
    progress: number;
    students: number;
  }>;
}

interface Student {
  id: string;
  name: string;
  email: string;
  stats: {
    completedModules: number;
    totalTimeSpent: number;
    lastActivity: string;
  };
  currentModule?: {
    name: string;
    progress: number;
    score: number;
    status: string;
  };
}

export function TeacherDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('student');
  const [viewMode, setViewMode] = useState<'overview' | 'students' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'lastActivity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort students
  const filteredAndSortedStudents = students
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule = selectedModule === 'all' || 
                           student.currentModule?.name === selectedModule;
      return matchesSearch && matchesModule;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'progress':
          aValue = a.currentModule?.progress || 0;
          bValue = b.currentModule?.progress || 0;
          break;
        case 'lastActivity':
          aValue = new Date(a.stats.lastActivity).getTime();
          bValue = new Date(b.stats.lastActivity).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  useEffect(() => {
    checkUserRole();
    loadDashboardData();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserRole(session.user.user_metadata?.role || 'student');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const addStudent = async () => {
    if (!newStudentEmail || !newStudentName) {
      toast.error('Please fill in all fields');
      return;
    }

    setAddingStudent(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        // Try to add student via API with better error handling
        try {
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3b039bbc/students/invite`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: newStudentEmail,
              name: newStudentName
            })
          });

          if (response.ok) {
            toast.success('Student invitation sent successfully!');
            setNewStudentEmail('');
            setNewStudentName('');
            setIsAddStudentOpen(false);
            loadDashboardData(); // Refresh data
            return;
          } else {
            // Try to parse error response
            try {
              const errorData = await response.json();
              toast.error(errorData.message || `Failed to add student (${response.status})`);
            } catch (parseError) {
              toast.error(`Failed to add student (${response.status})`);
            }
            return;
          }
        } catch (fetchError) {
          console.warn('API call failed, falling back to demo mode:', fetchError);
          // Fall through to demo mode
        }
      }

      // Demo mode - add student locally (fallback for API failures)
      const newStudent: Student = {
        id: Date.now().toString(),
        name: newStudentName,
        email: newStudentEmail,
        stats: {
          completedModules: 0,
          totalTimeSpent: 0,
          lastActivity: new Date().toISOString()
        },
        currentModule: {
          name: 'DNA Replication',
          progress: 0,
          score: 0,
          status: 'not-started'
        }
      };

      setStudents(prev => [...prev, newStudent]);
      
      // Update analytics
      if (analytics) {
        setAnalytics({
          ...analytics,
          totalStudents: analytics.totalStudents + 1,
          activeStudents: analytics.activeStudents + 1
        });
      }

      toast.success('Student added successfully! (Demo Mode)');
      setNewStudentEmail('');
      setNewStudentName('');
      setIsAddStudentOpen(false);
    } catch (error) {
      console.error('Add student error:', error);
      toast.error('Failed to add student. Please try again.');
    } finally {
      setAddingStudent(false);
    }
  };

  const removeStudent = async (studentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        // Try to remove student via API with better error handling
        try {
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3b039bbc/students/${studentId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            toast.success('Student removed successfully');
            loadDashboardData(); // Refresh data
            return;
          } else {
            // Try to parse error response
            try {
              const errorData = await response.json();
              toast.error(errorData.message || `Failed to remove student (${response.status})`);
            } catch (parseError) {
              toast.error(`Failed to remove student (${response.status})`);
            }
            return;
          }
        } catch (fetchError) {
          console.warn('API call failed, falling back to demo mode:', fetchError);
          // Fall through to demo mode
        }
      }

      // Demo mode - remove student locally (fallback for API failures)
      setStudents(prev => prev.filter(s => s.id !== studentId));
      
      // Update analytics
      if (analytics) {
        setAnalytics({
          ...analytics,
          totalStudents: Math.max(0, analytics.totalStudents - 1),
          activeStudents: Math.max(0, analytics.activeStudents - 1)
        });
      }
      
      toast.success('Student removed successfully (Demo Mode)');
    } catch (error) {
      console.error('Remove student error:', error);
      toast.error('Failed to remove student. Please try again.');
    }
  };

  const loadDashboardData = async () => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        // Demo data for non-authenticated users - adapt based on role
        const currentUserRole = session?.user?.user_metadata?.role || userRole;
        
        if (currentUserRole === 'teacher') {
          setAnalytics({
            totalStudents: 21,
            activeStudents: 18,
            completedModules: 156,
            averageProgress: 82,
            averageTimePerSession: 24,
            moduleEngagement: [
              { name: 'DNA Replication', progress: 85, students: 24 },
              { name: 'Cell Division', progress: 72, students: 18 },
              { name: 'Electromagnetism', progress: 65, students: 15 },
              { name: 'Orbital Mechanics', progress: 58, students: 12 },
              { name: 'Atomic Structure', progress: 42, students: 8 }
            ]
          });
        } else {
          // Student dashboard data
          setAnalytics({
            totalStudents: 1, // Just the current student
            activeStudents: 1,
            completedModules: 3,
            averageProgress: 78,
            averageTimePerSession: 22,
            moduleEngagement: [
              { name: 'DNA Replication', progress: 95, students: 1 },
              { name: 'Cell Division', progress: 87, students: 1 },
              { name: 'Electromagnetism', progress: 62, students: 1 },
              { name: 'Orbital Mechanics', progress: 45, students: 1 }
            ]
          });
        }
        
        setStudents([
          {
            id: '1',
            name: 'Sarah Chen',
            email: 'sarah@example.com',
            stats: { completedModules: 3, totalTimeSpent: 7200, lastActivity: new Date().toISOString() },
            currentModule: { name: 'DNA Replication', progress: 94, score: 94, status: 'completed' }
          },
          {
            id: '2',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            stats: { completedModules: 2, totalTimeSpent: 5400, lastActivity: new Date().toISOString() },
            currentModule: { name: 'Cell Division', progress: 87, score: 87, status: 'in-progress' }
          },
          {
            id: '3',
            name: 'Emma Davis',
            email: 'emma@example.com',
            stats: { completedModules: 4, totalTimeSpent: 8100, lastActivity: new Date().toISOString() },
            currentModule: { name: 'Electromagnetism', progress: 91, score: 91, status: 'completed' }
          },
          {
            id: '4',
            name: 'Alex Kumar',
            email: 'alex@example.com',
            stats: { completedModules: 1, totalTimeSpent: 3600, lastActivity: new Date().toISOString() },
            currentModule: { name: 'Orbital Mechanics', progress: 78, score: 78, status: 'in-progress' }
          }
        ]);
        setLoading(false);
        return;
      }

      // Check if user is a teacher
      const userRole = session.user.user_metadata?.role;
      if (userRole !== 'teacher') {
        setError('Teacher access required. Please log in as a teacher to view this dashboard.');
        setLoading(false);
        return;
      }

      // Try to fetch analytics data with fallback
      let analyticsData = null;
      let studentsData = null;
      
      try {
        const analyticsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3b039bbc/analytics/dashboard`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (analyticsResponse.ok) {
          analyticsData = await analyticsResponse.json();
        } else {
          console.warn('Analytics API failed, using demo data');
        }
      } catch (error) {
        console.warn('Analytics API error, using demo data:', error);
      }

      // Try to fetch students data with fallback
      try {
        const studentsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3b039bbc/students`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (studentsResponse.ok) {
          const response = await studentsResponse.json();
          studentsData = response.students || [];
        } else {
          console.warn('Students API failed, using demo data');
        }
      } catch (error) {
        console.warn('Students API error, using demo data:', error);
      }

      // Use API data if available, otherwise fall back to demo data
      if (analyticsData) {
        setAnalytics(analyticsData);
      } else {
        // Use demo analytics data
        setAnalytics({
          totalStudents: 21,
          activeStudents: 18,
          completedModules: 156,
          averageProgress: 82,
          averageTimePerSession: 24,
          moduleEngagement: [
            { name: 'DNA Replication', progress: 85, students: 24 },
            { name: 'Cell Division', progress: 72, students: 18 },
            { name: 'Electromagnetism', progress: 65, students: 15 },
            { name: 'Orbital Mechanics', progress: 58, students: 12 },
            { name: 'Atomic Structure', progress: 42, students: 8 }
          ]
        });
      }

      if (studentsData) {
        setStudents(studentsData);
      } else {
        // Use demo students data
        setStudents([
          {
            id: '1',
            name: 'Sarah Chen',
            email: 'sarah@example.com',
            stats: { completedModules: 3, totalTimeSpent: 7200, lastActivity: new Date().toISOString() },
            currentModule: { name: 'DNA Replication', progress: 94, score: 94, status: 'completed' }
          },
          {
            id: '2',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            stats: { completedModules: 2, totalTimeSpent: 5400, lastActivity: new Date().toISOString() },
            currentModule: { name: 'Cell Division', progress: 87, score: 87, status: 'in-progress' }
          },
          {
            id: '3',
            name: 'Emma Davis',
            email: 'emma@example.com',
            stats: { completedModules: 4, totalTimeSpent: 8100, lastActivity: new Date().toISOString() },
            currentModule: { name: 'Electromagnetism', progress: 91, score: 91, status: 'completed' }
          },
          {
            id: '4',
            name: 'Alex Kumar',
            email: 'alex@example.com',
            stats: { completedModules: 1, totalTimeSpent: 3600, lastActivity: new Date().toISOString() },
            currentModule: { name: 'Orbital Mechanics', progress: 78, score: 78, status: 'in-progress' }
          }
        ]);
      }
    } catch (error) {
      console.error('Dashboard loading error:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-900 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-900 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    { 
      label: 'Average Progress', 
      value: `${analytics.averageProgress}%`, 
      change: '+5.2%', 
      icon: TrendingUp, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Completed Modules', 
      value: `${analytics.completedModules}`, 
      change: '+12', 
      icon: BookOpen, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Active Students', 
      value: `${analytics.activeStudents}`, 
      change: `+${analytics.activeStudents - Math.floor(analytics.totalStudents * 0.8)}`, 
      icon: Users, 
      color: 'bg-purple-500' 
    },
    { 
      label: 'Avg. Time/Session', 
      value: `${analytics.averageTimePerSession}min`, 
      change: '+3min', 
      icon: Clock, 
      color: 'bg-orange-500' 
    }
  ];

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      {/* Personal Progress */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30">
            <Target className="text-blue-400" size={24} />
          </div>
          <div>
            <h3 className="text-white font-semibold">Your Progress</h3>
            <p className="text-blue-200 text-sm">Keep up the great work!</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Overall Completion</span>
            <span className="text-blue-400 font-semibold">{analytics.averageProgress}%</span>
          </div>
          <Progress value={analytics.averageProgress} className="h-3" />
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-blue-400 text-xl font-bold">{analytics.completedModules}</div>
              <div className="text-gray-400 text-xs">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 text-xl font-bold">{analytics.averageTimePerSession}m</div>
              <div className="text-gray-400 text-xs">Avg Session</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 text-xl font-bold">A+</div>
              <div className="text-gray-400 text-xs">Grade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Progress */}
      <div>
        <h3 className="text-white font-semibold mb-4">Module Progress</h3>
        <div className="space-y-3">
          {analytics.moduleEngagement.map((module, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{module.name}</h4>
                <div className="flex items-center gap-2">
                  {module.progress === 100 && (
                    <Award className="text-yellow-400" size={16} />
                  )}
                  <span className="text-white font-semibold">{module.progress}%</span>
                </div>
              </div>
              <Progress value={module.progress} className="h-2" />
              <div className="mt-2 flex justify-between items-center text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  module.progress === 100 
                    ? 'bg-green-500/20 text-green-400' 
                    : module.progress > 50 
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {module.progress === 100 ? 'Completed' : module.progress > 50 ? 'In Progress' : 'Started'}
                </span>
                <span className="text-gray-400">
                  {module.progress === 100 ? '★ 5/5' : `${Math.floor(module.progress/20)}/5 sections`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-yellow-500/20 p-3 rounded-xl border border-yellow-500/30">
            <Award className="text-yellow-400" size={24} />
          </div>
          <div>
            <h3 className="text-white font-semibold">Recent Achievements</h3>
            <p className="text-gray-400 text-sm">Celebrate your milestones</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
            <Star className="text-yellow-400 fill-current" size={20} />
            <div>
              <p className="text-white text-sm font-medium">DNA Master</p>
              <p className="text-gray-400 text-xs">Completed DNA Replication with 95% score</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
            <Target className="text-blue-400" size={20} />
            <div>
              <p className="text-white text-sm font-medium">Perfect Streak</p>
              <p className="text-gray-400 text-xs">5 days of consistent learning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeacherOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <IconComponent className="text-white" size={18} />
                </div>
                <span className="text-green-400 text-xs font-medium">{stat.change}</span>
              </div>
              <p className="text-white text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Module Engagement */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Module Engagement</h3>
          <span className="text-gray-400 text-sm">This Week</span>
        </div>
        
        <div className="space-y-3">
          {analytics.moduleEngagement.slice(0, 4).map((module, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{module.name}</h4>
                <div className="text-right">
                  <span className="text-white font-semibold">{module.students}</span>
                  <span className="text-gray-400 text-sm ml-1">students</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Progress value={module.progress} className="h-2" />
                </div>
                <span className="text-gray-400 text-sm font-medium w-12 text-right">{module.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStudentsView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">Student Management</h3>
          <p className="text-gray-400 text-sm">{students.length} active students</p>
        </div>
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus size={16} />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Student Name
                </label>
                <Input
                  placeholder="Enter student's full name"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="student@example.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddStudentOpen(false);
                    setNewStudentEmail('');
                    setNewStudentName('');
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addStudent}
                  disabled={addingStudent || !newStudentEmail || !newStudentName}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  {addingStudent ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3">
          {/* Module Filter */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Modules</option>
            <option value="DNA Replication">DNA Replication</option>
            <option value="Cell Division">Cell Division</option>
            <option value="Electromagnetism">Electromagnetism</option>
            <option value="Orbital Mechanics">Orbital Mechanics</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'progress' | 'lastActivity')}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="progress">Sort by Progress</option>
            <option value="lastActivity">Sort by Last Activity</option>
          </select>

          {/* Sort Order */}
          <Button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            variant="outline"
            size="sm"
            className="px-3 py-2 border-gray-700 text-gray-300 hover:bg-gray-700"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </Button>

          {/* Results Count */}
          <div className="ml-auto text-sm text-gray-400">
            {filteredAndSortedStudents.length} of {students.length} students
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredAndSortedStudents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto text-gray-500 mb-3" size={48} />
            <p className="text-gray-400">
              {searchTerm ? 'No students found matching your search.' : 'No students added yet.'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsAddStudentOpen(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Your First Student
              </Button>
            )}
          </div>
        ) : (
          filteredAndSortedStudents.map((student, index) => (
            <div key={student.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{student.name}</p>
                      <p className="text-gray-400 text-sm">{student.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {student.currentModule?.score || 0}%
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      student.currentModule?.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : student.currentModule?.status === 'in-progress'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {student.currentModule?.status || 'not-started'}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-700" align="end">
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                        <UserCheck size={16} className="mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                        <Mail size={16} className="mr-2" />
                        Send Message
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <UserX size={16} className="mr-2" />
                            Remove Student
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Student</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Are you sure you want to remove {student.name} from your class? 
                              This action cannot be undone and will revoke their access to all modules.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeStudent(student.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Remove Student
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-blue-400 font-semibold">{student.stats.completedModules}</div>
                  <div className="text-gray-400 text-xs">Completed</div>
                </div>
                <div>
                  <div className="text-green-400 font-semibold">{Math.floor(student.stats.totalTimeSpent / 3600)}h</div>
                  <div className="text-gray-400 text-xs">Study Time</div>
                </div>
                <div>
                  <div className="text-purple-400 font-semibold">
                    {new Date(student.stats.lastActivity).toLocaleDateString()}
                  </div>
                  <div className="text-gray-400 text-xs">Last Active</div>
                </div>
              </div>

              {student.currentModule && (
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Current: {student.currentModule.name}</span>
                    <span className="text-white text-sm font-medium">{student.currentModule.progress}%</span>
                  </div>
                  <Progress value={student.currentModule.progress} className="h-2" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-400" size={20} />
            <span className="text-green-400 text-sm font-medium">Growth Rate</span>
          </div>
          <p className="text-white text-2xl font-bold">+24%</p>
          <p className="text-green-200 text-sm">vs last month</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-blue-400" size={20} />
            <span className="text-blue-400 text-sm font-medium">Engagement</span>
          </div>
          <p className="text-white text-2xl font-bold">87%</p>
          <p className="text-blue-200 text-sm">avg completion</p>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h4 className="text-white font-semibold mb-4">Learning Analytics</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Peak Learning Hours</span>
            <span className="text-white font-medium">2:00 PM - 4:00 PM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Most Popular Module</span>
            <span className="text-white font-medium">DNA Replication</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Average Session Length</span>
            <span className="text-white font-medium">{analytics.averageTimePerSession} minutes</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Retention Rate</span>
            <span className="text-white font-medium">94%</span>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h4 className="text-white font-semibold mb-4">Performance Trends</h4>
        <div className="space-y-3">
          {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, index) => (
            <div key={week} className="flex items-center gap-4">
              <span className="text-gray-400 text-sm w-16">{week}</span>
              <div className="flex-1">
                <Progress value={65 + (index * 8)} className="h-2" />
              </div>
              <span className="text-white text-sm font-medium">{65 + (index * 8)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-900 text-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-semibold">
              {userRole === 'teacher' ? 'Teacher Dashboard' : 'My Dashboard'}
            </h1>
            <p className="text-gray-400 text-sm">
              {userRole === 'teacher' 
                ? `${analytics.totalStudents} Students • ${analytics.activeStudents} Active`
                : 'Track your learning progress'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            {userRole === 'teacher' && (
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Download size={16} />
              </Button>
            )}
            <Button
              variant="outline" 
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Settings size={16} />
            </Button>
          </div>
        </div>

        {/* View Mode Tabs - Only for teachers */}
        {userRole === 'teacher' && (
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {userRole === 'student' ? renderStudentDashboard() : (
          <>
            {viewMode === 'overview' && renderTeacherOverview()}
            {viewMode === 'students' && renderStudentsView()}
            {viewMode === 'analytics' && renderAnalyticsView()}
          </>
        )}
      </div>
    </div>
  );
}