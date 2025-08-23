import { useState } from 'react';
import { Search, Play, Eye, Zap, Globe, Dna, Target, Filter, Star, Clock, Users } from 'lucide-react';
import { Button } from './ui/button';
import { ThreeScene } from './ThreeScene';
import { DNAModel } from './3d-models/DNAModel';
import { CellDivisionModel } from './3d-models/CellDivisionModel';
import { ElectromagnetismModel } from './3d-models/ElectromagnetismModel';
import { OrbitalMechanicsModel } from './3d-models/OrbitalMechanicsModel';

interface SimulatePageProps {
  onModuleSelect: (moduleId: string) => void;
}

export function SimulatePage({ onModuleSelect }: SimulatePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [previewModule, setPreviewModule] = useState<string | null>(null);

  const modules = [
    {
      id: 'dna-replication',
      title: 'DNA Replication',
      category: 'Biology',
      difficulty: 'Intermediate',
      duration: '15 min',
      rating: 4.8,
      students: 1247,
      description: 'Explore the fascinating process of DNA replication through immersive 3D visualization. Watch as the double helix unwinds and new strands are synthesized.',
      icon: Dna,
      color: 'from-green-500 to-emerald-600',
      tags: ['Molecular Biology', 'Genetics', 'DNA', 'Enzymes'],
      objectives: [
        'Understand complementary base pairing',
        'Observe enzyme functions in replication',
        'See replication fork formation',
        'Learn about leading and lagging strands'
      ],
      features: ['3D Molecule Manipulation', 'Real-time Animation', 'Interactive Controls', 'Zoom & Rotate']
    },
    {
      id: 'cell-division',
      title: 'Cell Division',
      category: 'Biology',
      difficulty: 'Advanced',
      duration: '20 min',
      rating: 4.9,
      students: 892,
      description: 'Journey through mitosis and witness cell division in stunning detail. Follow chromosomes through all phases of mitosis.',
      icon: Target,
      color: 'from-blue-500 to-cyan-600',
      tags: ['Cell Biology', 'Mitosis', 'Chromosomes', 'Cell Cycle'],
      objectives: [
        'Identify all phases of mitosis',
        'Track chromosome behavior',
        'Understand spindle fiber function',
        'Observe cytokinesis process'
      ],
      features: ['Phase-by-Phase Animation', 'Chromosome Tracking', 'Interactive Timeline', 'Pause & Resume']
    },
    {
      id: 'electromagnetism',
      title: 'Electromagnetism',
      category: 'Physics',
      difficulty: 'Intermediate',
      duration: '18 min',
      rating: 4.7,
      students: 1456,
      description: 'Visualize invisible electromagnetic fields and forces in 3D space. Manipulate charges and observe field line behavior.',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      tags: ['Physics', 'Fields', 'Forces', 'Electricity'],
      objectives: [
        'Visualize electric field patterns',
        'Understand magnetic field behavior',
        'Explore charge interactions',
        'Learn electromagnetic induction'
      ],
      features: ['Interactive Charges', 'Real-time Field Lines', 'Force Visualization', 'Vector Display']
    },
    {
      id: 'orbital-mechanics',
      title: 'Orbital Mechanics',
      category: 'Physics',
      difficulty: 'Advanced',
      duration: '25 min',
      rating: 4.6,
      students: 743,
      description: 'Experience planetary motion and gravitational forces in our solar system. Observe Kepler\'s laws in action.',
      icon: Globe,
      color: 'from-purple-500 to-indigo-600',
      tags: ['Astronomy', 'Gravity', 'Planets', 'Orbits'],
      objectives: [
        'Understand Kepler\'s three laws',
        'Observe gravitational effects',
        'Explore orbital velocity',
        'Study planetary interactions'
      ],
      features: ['Realistic Physics', 'Time Control', 'Multi-body Simulation', 'Scale Adjustments']
    }
  ];

  const categories = ['All', 'Biology', 'Physics', 'Chemistry'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || module.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || module.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/10 border border-green-400/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20';
      case 'Advanced': return 'text-red-400 bg-red-400/10 border border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border border-gray-400/20';
    }
  };

  const renderPreviewModel = (moduleId: string) => {
    switch (moduleId) {
      case 'dna-replication':
        return <DNAModel animate={true} showReplication={false} showLabels={false} />;
      case 'cell-division':
        return <CellDivisionModel phase="metaphase" autoAnimate={true} showLabels={false} />;
      case 'electromagnetism':
        return <ElectromagnetismModel showElectricField={true} showMagneticField={false} animate={true} showLabels={false} />;
      case 'orbital-mechanics':
        return <OrbitalMechanicsModel showOrbits={true} showLabels={false} timeScale={0.5} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-gray-900 text-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-white">3D Simulations</h1>
              <p className="text-gray-400 text-sm">Interactive STEM learning experiences</p>
            </div>
            <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-500/30">
              <Eye className="text-blue-400" size={20} />
            </div>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search simulations, topics, or concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-fit">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="w-px bg-gray-700 mx-2" />
            <div className="flex gap-2 min-w-fit">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedDifficulty === difficulty
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/60 rounded-xl p-3 text-center border border-gray-700/50">
            <div className="text-blue-400 text-lg font-bold">{filteredModules.length}</div>
            <div className="text-gray-400 text-xs">Available</div>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-3 text-center border border-gray-700/50">
            <div className="text-green-400 text-lg font-bold">HD</div>
            <div className="text-gray-400 text-xs">Quality</div>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-3 text-center border border-gray-700/50">
            <div className="text-purple-400 text-lg font-bold">AR</div>
            <div className="text-gray-400 text-xs">Ready</div>
          </div>
        </div>

        {/* 3D Preview Section */}
        {previewModule && (
          <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">3D Preview</h3>
                <button
                  onClick={() => setPreviewModule(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="h-64 relative">
              <ThreeScene>
                {renderPreviewModel(previewModule)}
              </ThreeScene>
            </div>
            <div className="p-4">
              <div className="flex gap-3">
                <Button
                  onClick={() => onModuleSelect(previewModule)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-medium transition-all"
                >
                  <Play size={16} />
                  Start Simulation
                </Button>
                <Button
                  onClick={() => setPreviewModule(null)}
                  variant="outline"
                  className="px-6 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 rounded-xl transition-all"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modules Grid */}
        <div className="space-y-4">
          {filteredModules.map((module) => (
            <div
              key={module.id}
              className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl"
            >
              {/* Module Header */}
              <div className={`h-24 bg-gradient-to-br ${module.color} p-4 relative overflow-hidden`}>
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/20">
                      <module.icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold leading-tight mb-1">{module.title}</h3>
                      <div className="flex items-center gap-3 text-white/80 text-xs">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          <span>{module.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={12} />
                          <span>{module.students}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{module.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                    {module.difficulty}
                  </div>
                </div>
                
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full transform translate-x-4 -translate-y-4"></div>
              </div>

              {/* Module Content */}
              <div className="p-4 space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {module.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {module.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-md border border-gray-600/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Learning Objectives */}
                <div>
                  <h4 className="text-white text-sm font-medium mb-2">Learning Objectives:</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {module.objectives.slice(0, 3).map((objective, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                        <p className="text-gray-400 text-xs">{objective}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => onModuleSelect(module.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-medium transition-all"
                  >
                    <Play size={16} />
                    Start Now
                  </Button>
                  
                  <Button
                    onClick={() => setPreviewModule(previewModule === module.id ? null : module.id)}
                    variant="outline"
                    className={`px-4 rounded-xl transition-all ${
                      previewModule === module.id
                        ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                        : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <Eye size={16} />
                  </Button>
                </div>

                {/* Features */}
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {module.features.map((feature, index) => (
                      <span
                        key={index}
                        className="text-green-400 text-xs flex items-center gap-1"
                      >
                        <div className="w-1 h-1 bg-green-400 rounded-full" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
              <Filter className="mx-auto text-gray-400 mb-4" size={48} />
              <div className="text-gray-400 mb-2 text-lg">No simulations found</div>
              <div className="text-gray-500 text-sm">Try adjusting your search or filter criteria</div>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}