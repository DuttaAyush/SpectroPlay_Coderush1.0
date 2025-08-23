import { useState } from 'react';
import { Play, Eye, Star, TrendingUp, Users, BookOpen, Target, Zap, Award, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { ThreeScene } from './ThreeScene';
import { DNAModel } from './3d-models/DNAModel';

interface HomeScreenProps {
  onModuleSelect: (moduleId: string) => void;
}

export function HomeScreen({ onModuleSelect }: HomeScreenProps) {
  const [showWelcome3D, setShowWelcome3D] = useState(true);

  const featuredModule = {
    id: 'dna-replication',
    title: 'DNA Replication',
    description: 'Explore molecular biology with our most popular 3D simulation',
    rating: 4.8,
    students: 1247,
    duration: '15 min'
  };

  const stats = [
    { icon: BookOpen, label: 'Modules', value: '4', color: 'text-blue-400' },
    { icon: Users, label: 'Students', value: '4.3K', color: 'text-green-400' },
    { icon: Star, label: 'Rating', value: '4.8', color: 'text-yellow-400' },
    { icon: Award, label: 'Completed', value: '2.1K', color: 'text-purple-400' }
  ];

  const recentActivity = [
    { title: 'DNA Replication', users: '124 students active', status: 'trending' },
    { title: 'Cell Division', users: '89 students active', status: 'popular' },
    { title: 'Electromagnetism', users: '156 students active', status: 'trending' }
  ];

  const quickActions = [
    { id: 'dna-replication', title: 'Try DNA Model', icon: Target, color: 'from-green-500 to-emerald-600' },
    { id: 'cell-division', title: 'Cell Division', icon: Eye, color: 'from-blue-500 to-cyan-600' },
    { id: 'electromagnetism', title: 'Fields & Forces', icon: Zap, color: 'from-yellow-500 to-orange-600' }
  ];

  return (
    <div className="flex-1 bg-gray-900 text-white overflow-y-auto">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 overflow-hidden">
        <div className="p-6 relative z-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 text-white">Welcome to InsightXR</h1>
            <p className="text-blue-100 opacity-90 leading-relaxed">
              Experience STEM education through immersive 3D visualizations and interactive simulations
            </p>
          </div>

          {/* Welcome 3D Preview */}
          {showWelcome3D && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 mb-6 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Interactive 3D Preview</h3>
                  <button
                    onClick={() => setShowWelcome3D(false)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="h-48 relative">
                <ThreeScene>
                  <DNAModel animate={true} showReplication={false} showLabels={false} />
                </ThreeScene>
              </div>
              <div className="p-4">
                <Button
                  onClick={() => onModuleSelect('dna-replication')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl py-3 flex items-center justify-center gap-2 font-medium transition-all backdrop-blur-sm"
                >
                  <Play size={16} />
                  Explore DNA Structure
                </Button>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <stat.icon size={20} className={`mx-auto mb-1 ${stat.color}`} />
                <div className="text-white font-bold text-lg">{stat.value}</div>
                <div className="text-white/70 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full transform -translate-x-24 translate-y-24"></div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Featured Module */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl overflow-hidden border border-gray-600/50">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/20 p-3 rounded-xl border border-green-500/30">
                <Star className="text-green-400" size={24} />
              </div>
              <div>
                <h2 className="text-white font-semibold">Featured Simulation</h2>
                <p className="text-gray-300 text-sm">Most popular this week</p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 mb-4 border border-gray-700/50">
              <h3 className="text-white font-semibold mb-2">{featuredModule.title}</h3>
              <p className="text-gray-300 text-sm mb-3">{featuredModule.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span>{featuredModule.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{featuredModule.students}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{featuredModule.duration}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => onModuleSelect(featuredModule.id)}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-medium transition-all"
            >
              <Play size={18} />
              Start Featured Module
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-white font-semibold mb-4">Quick Start</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={action.id}
                onClick={() => onModuleSelect(action.id)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex items-center gap-4 transition-all duration-200 border border-gray-700 hover:border-gray-600 group"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <action.icon size={20} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium">{action.title}</h3>
                  <p className="text-gray-400 text-sm">Interactive 3D experience</p>
                </div>
                <Play size={16} className="text-gray-400 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Live Activity */}
        <div>
          <h2 className="text-white font-semibold mb-4">Live Activity</h2>
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            {recentActivity.map((activity, index) => (
              <div key={index} className={`p-4 flex items-center justify-between ${index < recentActivity.length - 1 ? 'border-b border-gray-700' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${activity.status === 'trending' ? 'bg-green-400' : 'bg-blue-400'} animate-pulse`} />
                  <div>
                    <div className="text-white font-medium">{activity.title}</div>
                    <div className="text-gray-400 text-sm">{activity.users}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <TrendingUp size={14} />
                  <span>{activity.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Progress */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/30">
              <Target className="text-purple-400" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Your Learning Journey</h3>
              <p className="text-gray-300 text-sm">Track your progress across all modules</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Overall Progress</span>
              <span className="text-purple-400 font-medium">68%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>2 modules completed</span>
              <span>2 modules remaining</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-white font-semibold mb-2">Ready to Explore?</h3>
          <p className="text-gray-300 text-sm mb-4">
            Dive into our interactive 3D simulations and discover STEM concepts like never before
          </p>
          <Button
            onClick={() => onModuleSelect('dna-replication')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-3 flex items-center justify-center gap-2 font-medium transition-all mx-auto"
          >
            <Eye size={18} />
            Browse All Simulations
          </Button>
        </div>


      </div>
    </div>
  );
}