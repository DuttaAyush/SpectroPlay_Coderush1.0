import { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { SimulatePage } from './components/SimulatePage';
import { SimulationScreen } from './components/SimulationScreen';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { AuthScreen } from './components/AuthScreen';
import { Toaster } from './components/ui/sonner';
import { supabase } from './utils/supabase/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string>('student');

  useEffect(() => {
    checkAuthState();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        setUserRole(session.user.user_metadata?.role || 'student');
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserRole('student');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsAuthenticated(true);
        setUserRole(session.user.user_metadata?.role || 'student');
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    // Auth state will be updated by the listener
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setActiveTab('home');
      setSelectedModule(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
    setActiveTab('simulate');
  };

  const handleBackToSimulate = () => {
    setSelectedModule(null);
    setActiveTab('simulate');
  };

  const handleBackToHome = () => {
    setSelectedModule(null);
    setActiveTab('home');
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Loading InsightXR...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const renderContent = () => {
    // If a module is selected, show the simulation screen
    if (selectedModule) {
      return (
        <SimulationScreen 
          moduleId={selectedModule} 
          onBack={activeTab === 'home' ? handleBackToHome : handleBackToSimulate} 
        />
      );
    }

    // Otherwise, show the appropriate tab content
    switch (activeTab) {
      case 'home':
        return <HomeScreen onModuleSelect={handleModuleSelect} />;
      case 'simulate':
        return <SimulatePage onModuleSelect={handleModuleSelect} />;
      case 'dashboard':
        return <TeacherDashboard />;
      case 'profile':
        return <ProfileScreen onLogout={handleLogout} />;
      default:
        return <HomeScreen onModuleSelect={handleModuleSelect} />;
    }
  };

  // Dashboard available for all users
  const availableTabs = ['home', 'simulate', 'dashboard', 'profile'];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col max-w-md mx-auto relative">
      {/* Status Bar Simulation - Hide when in simulation mode */}
      {!selectedModule && (
        <div className="bg-gray-900 text-white p-2 text-center text-xs">
          9:41 AM • InsightXR
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col" style={{ paddingBottom: selectedModule ? '0' : '70px' }}>
        {renderContent()}
      </div>

      {/* Bottom Navigation - Hide when in simulation */}
      {!selectedModule && (
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          availableTabs={availableTabs}
        />
      )}
      
      {/* Toast Notifications */}
      <Toaster 
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: '#1f2937',
            border: '1px solid #374151',
            color: '#f3f4f6'
          }
        }}
      />
    </div>
  );
}