import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Settings, Info, ChevronLeft, ChevronRight, Eye, Send, X, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { ThreeScene } from './ThreeScene';
import { DNAModel } from './3d-models/DNAModel';
import { ElectromagnetismModel } from './3d-models/ElectromagnetismModel';
import { OrbitalMechanicsModel } from './3d-models/OrbitalMechanicsModel';
import { CellDivisionModel } from './3d-models/CellDivisionModel';
import { EducationalChatbot } from '../utils/chatbot';
import { ErrorBoundary } from './ErrorBoundary';

interface SimulationScreenProps {
  moduleId: string;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isError?: boolean;
}

export function SimulationScreen({ moduleId, onBack }: SimulationScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [chatbot, setChatbot] = useState<EducationalChatbot | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const addChatMessage = useCallback((content: string, sender: 'user' | 'ai', isError = false) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
      isError,
    };
    setChatMessages(prev => [...prev, newMessage]);
  }, []);

  // Initialize Educational Chatbot
  useEffect(() => {
    const initChatbot = () => {
      try {
        const moduleTitle = moduleData[moduleId]?.title || 'DNA Replication';
        const newChatbot = new EducationalChatbot(moduleTitle);
        setChatbot(newChatbot);
        
        // Add welcome message
        addChatMessage(newChatbot.getWelcomeMessage(), 'ai');
      } catch (error) {
        console.error('Failed to initialize chatbot:', error);
        addChatMessage('Welcome to the simulation! I\'m here to help you learn. Ask me anything about this topic!', 'ai');
      }
    };

    initChatbot();
  }, [moduleId]);

  const askAI = useCallback(async (prompt: string, clickedElement?: string) => {
    if (!chatbot) return;
    
    setIsChatLoading(true);
    try {
      const response = await chatbot.sendMessage(prompt, clickedElement);
      addChatMessage(response.text, 'ai', response.isError);
    } catch (error) {
      console.error('Error asking chatbot:', error);
      addChatMessage('Sorry, I encountered an error. Please try again.', 'ai', true);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatbot, addChatMessage]);

  const handleObjectClick = useCallback((objectName: string) => {
    setSelectedObject(objectName);
    addChatMessage(`You clicked on ${objectName}.`, 'user');
    askAI(`Tell me about ${objectName} in the context of ${moduleData[moduleId]?.title}.`, objectName);
  }, [moduleId, addChatMessage, askAI]);

  const handleChatSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const message = chatInput.trim();
    if (!message || isChatLoading) return;

    addChatMessage(message, 'user');
    setChatInput('');
    await askAI(message);
  }, [chatInput, isChatLoading, addChatMessage, askAI]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const moduleData = {
    'dna-replication': {
      title: 'DNA Replication',
      subtitle: 'Molecular Biology Simulation',
      description: 'Explore the molecular process of DNA replication with accurate base pairing and enzyme interactions.',
      phases: ['Structure', 'Unwinding', 'Replication', 'Completion'],
      controls: ['Rotate & Zoom', 'Phase Navigation', 'Animation Control', 'Interactive Chat'],
      chatPlaceholder: 'Ask about DNA structure, replication process, or click on 3D elements...',
      detailedInfo: [
        {
          title: 'DNA Structure',
          content: 'DNA consists of two antiparallel strands forming a double helix. Each strand is composed of nucleotides containing adenine (A), thymine (T), guanine (G), or cytosine (C). The bases pair specifically: A with T, and G with C.',
          keyPoints: ['Double helix structure', 'Antiparallel strands', 'Complementary base pairing', 'Hydrogen bonds between bases']
        },
        {
          title: 'Helicase Unwinding',
          content: 'DNA helicase enzymes break hydrogen bonds between base pairs, unwinding the double helix to create replication forks. This process requires energy from ATP hydrolysis.',
          keyPoints: ['Helicase enzyme action', 'Breaking hydrogen bonds', 'Formation of replication fork', 'ATP energy requirement']
        },
        {
          title: 'DNA Synthesis',
          content: 'DNA polymerase synthesizes new strands by adding complementary nucleotides. The leading strand is synthesized continuously, while the lagging strand is made in fragments called Okazaki fragments.',
          keyPoints: ['DNA polymerase function', 'Leading vs lagging strand', 'Okazaki fragments', 'Proofreading activity']
        },
        {
          title: 'Completion',
          content: 'DNA ligase joins Okazaki fragments on the lagging strand. The result is two identical DNA molecules, each containing one original and one newly synthesized strand (semi-conservative replication).',
          keyPoints: ['DNA ligase activity', 'Fragment joining', 'Semi-conservative nature', 'Identical daughter molecules']
        }
      ]
    },
    'cell-division': {
      title: 'Cell Division',
      subtitle: 'Mitosis Process Simulation', 
      description: 'Follow chromosomes through all stages of mitosis from interphase to cytokinesis.',
      phases: ['Interphase', 'Prophase', 'Metaphase', 'Anaphase', 'Telophase', 'Cytokinesis'],
      controls: ['3D Navigation', 'Phase Control', 'Timeline', 'Interactive Chat'],
      chatPlaceholder: 'Ask about mitosis stages, chromosome behavior, or cell cycle regulation...',
      detailedInfo: [
        {
          title: 'Interphase',
          content: 'The cell grows and replicates its DNA. During S phase, each chromosome is duplicated, creating sister chromatids joined at the centromere. The cell also duplicates its centrosome.',
          keyPoints: ['Cell growth', 'DNA replication', 'Sister chromatid formation', 'Centrosome duplication']
        },
        {
          title: 'Prophase',
          content: 'Chromosomes condense and become visible under a microscope. The nuclear envelope begins to break down, and the mitotic spindle starts forming from the centrosomes.',
          keyPoints: ['Chromosome condensation', 'Nuclear envelope breakdown', 'Spindle formation', 'Centrosome separation']
        },
        {
          title: 'Metaphase',
          content: 'Chromosomes align at the cell equator (metaphase plate). Each chromosome is attached to spindle fibers from both poles, ensuring proper distribution to daughter cells.',
          keyPoints: ['Chromosome alignment', 'Metaphase plate formation', 'Bipolar attachment', 'Spindle checkpoint']
        },
        {
          title: 'Anaphase',
          content: 'Sister chromatids separate and move to opposite poles of the cell. This ensures each daughter cell receives an identical set of chromosomes.',
          keyPoints: ['Chromatid separation', 'Chromosome movement', 'Equal distribution', 'Spindle elongation']
        },
        {
          title: 'Telophase',
          content: 'Chromosomes begin to decondense, and nuclear envelopes reform around each set of chromosomes. The spindle apparatus disassembles.',
          keyPoints: ['Chromosome decondensation', 'Nuclear envelope reformation', 'Spindle disassembly', 'Two nuclei formation']
        },
        {
          title: 'Cytokinesis',
          content: 'The cytoplasm divides, creating two separate daughter cells. In animal cells, a contractile ring pinches the cell in two. Each daughter cell is genetically identical to the parent.',
          keyPoints: ['Cytoplasm division', 'Contractile ring', 'Cell separation', 'Identical daughter cells']
        }
      ]
    },
    'electromagnetism': {
      title: 'Electromagnetism',
      subtitle: 'Field Visualization System',
      description: 'Visualize electric and magnetic fields with interactive charges and current elements.',
      phases: ['Electric Field', 'Magnetic Field', 'Combined Fields', 'Field Interactions'],
      controls: ['Field Toggle', '3D Rotation', 'Charge Manipulation', 'Interactive Chat'],
      chatPlaceholder: 'Ask about electromagnetic fields, Maxwell\'s equations, or field interactions...',
      detailedInfo: [
        {
          title: 'Electric Fields',
          content: 'Electric fields are created by electric charges and represent the force that would be exerted on a positive test charge at any point in space.',
          keyPoints: ['Charge-based fields', 'Force representation', 'Field lines', 'Coulomb\'s law']
        },
        {
          title: 'Magnetic Fields',
          content: 'Magnetic fields are created by moving charges (currents) and magnetic dipoles. They exert forces on moving charges and other magnetic materials.',
          keyPoints: ['Current-based fields', 'Moving charge interaction', 'Magnetic dipoles', 'Lorentz force']
        },
        {
          title: 'Combined Fields',
          content: 'Electromagnetic fields combine electric and magnetic components that propagate as waves, carrying energy and momentum through space.',
          keyPoints: ['Wave propagation', 'Energy transport', 'Field coupling', 'Maxwell\'s equations']
        },
        {
          title: 'Field Interactions',
          content: 'Electromagnetic fields interact with matter through various mechanisms including induction, polarization, and resonance.',
          keyPoints: ['Electromagnetic induction', 'Material polarization', 'Resonance phenomena', 'Energy transfer']
        }
      ]
    },
    'orbital-mechanics': {
      title: 'Orbital Mechanics',
      subtitle: 'Celestial Motion Simulation',
      description: 'Explore the principles governing planetary motion and orbital dynamics.',
      phases: ['Solar System', 'Orbital Elements', 'Gravitational Forces', 'Kepler\'s Laws'],
      controls: ['3D Navigation', 'Time Control', 'Body Selection', 'Interactive Chat'],
      chatPlaceholder: 'Ask about orbital mechanics, Kepler\'s laws, or celestial motion...',
      detailedInfo: [
        {
          title: 'Solar System',
          content: 'The solar system consists of the Sun and all objects orbiting it, including planets, moons, asteroids, and comets.',
          keyPoints: ['Central star', 'Planetary orbits', 'Gravitational hierarchy', 'System dynamics']
        },
        {
          title: 'Orbital Elements',
          content: 'Orbital elements describe the shape, size, and orientation of an orbit, including eccentricity, semi-major axis, and inclination.',
          keyPoints: ['Eccentricity', 'Semi-major axis', 'Inclination', 'Orbital parameters']
        },
        {
          title: 'Gravitational Forces',
          content: 'Gravitational forces between celestial bodies follow Newton\'s law of universal gravitation, creating the orbital motions we observe.',
          keyPoints: ['Inverse square law', 'Mass dependence', 'Distance effects', 'Force balance']
        },
        {
          title: 'Kepler\'s Laws',
          content: 'Kepler\'s three laws describe the motion of planets around the Sun, providing the foundation for understanding orbital mechanics.',
          keyPoints: ['Elliptical orbits', 'Equal area law', 'Period-distance relationship', 'Harmonic law']
        }
      ]
    }
  };

  const module = moduleData[moduleId as keyof typeof moduleData] || moduleData['dna-replication'];

  const nextPhase = () => {
    if (currentPhase < module.phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const prevPhase = () => {
    if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  const render3DModel = () => {
    switch (moduleId) {
      case 'dna-replication':
        return <DNAModel currentPhase={currentPhase} isPlaying={isPlaying} onObjectClick={handleObjectClick} />;
      case 'cell-division':
        return <CellDivisionModel currentPhase={currentPhase} isPlaying={isPlaying} onObjectClick={handleObjectClick} />;
      case 'electromagnetism':
        return <ElectromagnetismModel currentPhase={currentPhase} isPlaying={isPlaying} onObjectClick={handleObjectClick} />;
      case 'orbital-mechanics':
        return <OrbitalMechanicsModel currentPhase={currentPhase} isPlaying={isPlaying} onObjectClick={handleObjectClick} />;
      default:
        return <DNAModel currentPhase={currentPhase} isPlaying={isPlaying} onObjectClick={handleObjectClick} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-700/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-700/90 text-white transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg"
            >
              <ArrowLeft size={18} />
              <span>← Back to Modules</span>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">{module.title}</h1>
              <p className="text-sm text-gray-400">{module.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-xl transition-all duration-200 ${
                showChat 
                  ? 'bg-blue-600/90 hover:bg-blue-700/90 text-white' 
                  : 'bg-gray-800/90 hover:bg-gray-700/90 text-white'
              }`}
            >
              <Bot size={20} />
            </Button>
            <Button
              onClick={() => setShowControls(!showControls)}
              className="p-3 rounded-xl bg-gray-800/90 hover:bg-gray-700/90 text-white transition-all duration-200"
            >
              <Settings size={20} />
            </Button>
            <Button
              onClick={() => setFullScreenMode(!fullScreenMode)}
              className="p-3 rounded-xl bg-gray-800/90 hover:bg-gray-700/90 text-white transition-all duration-200"
            >
              <Eye size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full pt-20">
        {/* 3D Scene */}
        <div className={`relative ${showChat ? 'w-2/3' : 'w-full'} h-full transition-all duration-300`}>
          <ThreeScene>
            {render3DModel()}
          </ThreeScene>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-1/3 h-full bg-gray-900/95 backdrop-blur-md border-l border-gray-700/50 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <Bot size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Assistant</h3>
                    <p className="text-sm text-gray-400">Ask me about {module.title}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowChat(false)}
                  className="p-2 rounded-lg bg-gray-800/90 hover:bg-gray-700/90 text-gray-400 hover:text-white transition-all"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div 
              ref={chatHistoryRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <Bot size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Welcome to {module.title}!</p>
                  <p className="text-sm">Ask me anything about this topic, or click on 3D elements to learn more.</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-blue-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-blue-600/90 text-white'
                          : message.isError
                          ? 'bg-red-600/20 text-red-300 border border-red-500/30'
                          : 'bg-gray-800/90 text-gray-100'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-blue-400" />
                  </div>
                  <div className="bg-gray-800/90 p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-700/50">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={module.chatPlaceholder}
                  disabled={isChatLoading}
                  className="flex-1 px-4 py-3 bg-gray-800/90 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent disabled:opacity-50"
                />
                <Button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-4 py-3 bg-blue-600/90 hover:bg-blue-700/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
                >
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Phase Indicator - Top Right (only when controls are hidden and not in full screen) */}
      {!showControls && !fullScreenMode && (
        <div className="absolute top-20 right-4 z-30 max-w-[140px]">
          <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-3 border border-gray-700/30 shadow-xl">
            <div className="text-center">
              <div className="text-xs text-gray-400 font-medium mb-1">
                Phase {currentPhase + 1}/{module.phases.length}
              </div>
              <div className="text-white text-sm font-semibold mb-3 leading-tight">
                {module.phases[currentPhase]}
              </div>
              <div className="flex justify-center gap-1.5">
                {module.phases.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentPhase(index);
                      const targetScroll = (index / module.phases.length) * (scrollContainerRef.current?.scrollHeight || 0);
                      scrollContainerRef.current?.scrollTo({ top: targetScroll, behavior: 'smooth' });
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                      index === currentPhase 
                        ? 'bg-blue-400 scale-110 shadow-lg shadow-blue-400/50' 
                        : 'bg-gray-600 hover:bg-gray-500 hover:scale-105'
                    }`}
                    aria-label={`Go to phase ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Controls Panel - Bottom (hide in full screen mode) */}
      {showControls && !fullScreenMode && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gray-900/98 backdrop-blur-md border-t border-gray-700/50 shadow-xl">
          <div className="p-4 space-y-4">
            {/* Primary Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-8 py-3 rounded-2xl flex items-center gap-3 font-semibold transition-all duration-200 active:scale-95 shadow-lg ${
                  isPlaying 
                    ? 'bg-red-600/90 hover:bg-red-700/90 text-white shadow-red-600/30' 
                    : 'bg-blue-600/90 hover:bg-blue-700/90 text-white shadow-blue-600/30'
                }`}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                <span>{isPlaying ? 'Pause' : 'Play'} Animation</span>
              </Button>
              
              <Button
                onClick={() => {
                  setCurrentPhase(0);
                  setIsPlaying(false);
                  scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-2xl bg-gray-700/90 hover:bg-gray-600/90 text-white flex items-center gap-2 font-semibold transition-all duration-200 active:scale-95 shadow-lg shadow-gray-700/30"
              >
                <RotateCcw size={18} />
                <span>Reset</span>
              </Button>

              <Button
                onClick={onBack}
                className="px-6 py-3 rounded-2xl bg-purple-600/90 hover:bg-purple-700/90 text-white flex items-center gap-2 font-semibold transition-all duration-200 active:scale-95 shadow-lg shadow-purple-600/30"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </Button>
            </div>

            {/* Phase Navigation */}
            <div className="flex items-center justify-between bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
              <Button
                onClick={prevPhase}
                disabled={currentPhase === 0}
                className="px-4 py-2.5 rounded-xl bg-gray-700/90 hover:bg-gray-600/90 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-200 active:scale-95 shadow-md flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                <span className="text-sm">Previous</span>
              </Button>
              
              <div className="text-center flex-1 mx-6">
                <div className="text-xs text-gray-400 font-medium mb-1">Current Phase</div>
                <div className="text-white font-semibold leading-tight">
                  {module.phases[currentPhase]}
                </div>
                <div className="text-xs text-gray-500 mt-1 leading-tight">
                  {currentPhase + 1} of {module.phases.length}
                </div>
              </div>
              
              <Button
                onClick={nextPhase}
                disabled={currentPhase === module.phases.length - 1}
                className="px-4 py-2.5 rounded-xl bg-gray-700/90 hover:bg-gray-600/90 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-200 active:scale-95 shadow-md flex items-center gap-2"
              >
                <span className="text-sm">Next</span>
                <ChevronRight size={18} />
              </Button>
            </div>

            {/* Module Description */}
            <div className="text-center bg-gray-800/40 rounded-xl p-3 border border-gray-700/30">
              <p className="text-gray-300 text-sm leading-relaxed mb-2">
                {module.description}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {module.controls.map((control, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-lg border border-gray-600/50"
                  >
                    {control}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Back Button - Always visible */}
      <div className="absolute top-20 left-4 z-30">
        <Button
          onClick={onBack}
          className="p-3 bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-sm rounded-xl border border-blue-500/50 text-white transition-all shadow-lg"
          aria-label="Go back to modules"
        >
          <ArrowLeft size={20} />
        </Button>
      </div>

      {/* Full Screen Exit Button */}
      {fullScreenMode && (
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={() => setFullScreenMode(false)}
            className="p-3 bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-700/50 text-white hover:bg-gray-800/90 transition-all"
            aria-label="Exit full screen"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}