import { Settings, Award, BookOpen, Clock, Target, ChevronRight, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface ProfileScreenProps {
  onLogout?: () => void;
}

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const achievements = [
    { title: 'DNA Explorer', description: 'Completed DNA Replication module', icon: Award, color: 'bg-yellow-500' },
    { title: 'Cell Master', description: 'Perfect score in Cell Division', icon: Target, color: 'bg-green-500' },
    { title: 'Physics Pioneer', description: 'Started Electromagnetism', icon: BookOpen, color: 'bg-blue-500' }
  ];

  const stats = [
    { label: 'Modules Completed', value: '3/8' },
    { label: 'Total Study Time', value: '24h 32m' },
    { label: 'Average Score', value: '87%' },
    { label: 'Streak', value: '12 days' }
  ];

  return (
    <div className="flex-1 bg-gray-900 text-white p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white">Profile</h1>
        <button className="bg-gray-800 p-2 rounded-lg">
          <Settings className="text-gray-400" size={20} />
        </button>
      </div>

      {/* User Info */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">SC</span>
          </div>
          <div>
            <h2 className="text-white">Sarah Chen</h2>
            <p className="text-gray-400 text-sm">Grade 10 • Mumbai High School</p>
            <p className="text-blue-400 text-sm">Advanced Learner</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-white">{stat.value}</p>
              <p className="text-gray-400 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-6">
        <h2 className="text-white mb-4">Recent Achievements</h2>
        <div className="space-y-3">
          {achievements.map((achievement, index) => {
            const IconComponent = achievement.icon;
            return (
              <div key={index} className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
                <div className={`${achievement.color} p-2 rounded-lg`}>
                  <IconComponent className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-sm">{achievement.title}</h3>
                  <p className="text-gray-400 text-xs">{achievement.description}</p>
                </div>
                <ChevronRight className="text-gray-500" size={16} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Progress */}
      <div className="mb-6">
        <h2 className="text-white mb-4">Learning Progress</h2>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="space-y-4">
            {[
              { subject: 'Biology', completed: 6, total: 10, progress: 60 },
              { subject: 'Physics', completed: 2, total: 8, progress: 25 },
              { subject: 'Chemistry', completed: 0, total: 6, progress: 0 }
            ].map((subject, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm">{subject.subject}</span>
                  <span className="text-gray-400 text-sm">{subject.completed}/{subject.total}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Button */}
      {onLogout && (
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </Button>
      )}
    </div>
  );
}