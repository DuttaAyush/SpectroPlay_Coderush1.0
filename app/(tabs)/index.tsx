import React, { useState, useEffect, useRef } from 'react';
import { HomeScreen } from '../../components/HomeScreen';
import { SimulatePage } from '../../components/SimulatePage';
import { SimulationScreen } from '../../components/SimulationScreen';
import { TeacherDashboard } from '../../components/TeacherDashboard';
import { ProfileScreen } from '../../components/ProfileScreen';
import { BottomNavigation } from '../../components/BottomNavigation';
import { AuthScreen } from '../../components/AuthScreen';
import { supabase } from '../../utils/supabase/client';

// Import necessary Three.js dependencies for 3D Viewer integration
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TubeGeometry } from 'three/src/geometries/TubeGeometry.js';

// A React wrapper component for the ThreeDViewer class
class ThreeDViewer {
  private canvas: HTMLCanvasElement;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private activeObjects: THREE.Object3D[] = [];
  private onObjectClick: (name: string) => void = () => {};
  private lastClicked: THREE.Mesh | null = null;
  private originalColor = new THREE.Color();
  private highlightColor = new THREE.Color(0x58a6ff);

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.init();
  }

  private init() {
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    // Mobile-specific optimizations
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.controls.enableDamping = false;
    } else {
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.controls.enableDamping = true;
    }

    this.camera.position.z = 50;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 200;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);

    this.canvas.addEventListener('click', this.onClick.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));

    // Touch support
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });

    this.animate();
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.activeObjects.forEach(obj => {
      if (obj.userData.update) obj.userData.update();
    });
    this.renderer.render(this.scene, this.camera);
  }

  private onResize() {
    const container = this.canvas.parentElement;
    if (!container) return;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  private onClick(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.activeObjects, true);

    if (this.lastClicked) {
      const material = this.lastClicked.material as THREE.MeshStandardMaterial;
      if (material.emissive) {
        material.emissive.set(this.originalColor);
      }
      this.lastClicked = null;
    }

    if (intersects.length > 0) {
      const firstIntersect = intersects[0].object;
      if (firstIntersect instanceof THREE.Mesh && firstIntersect.name) {
        const material = firstIntersect.material as THREE.MeshStandardMaterial;
        if (material.emissive) {
          this.lastClicked = firstIntersect;
          this.originalColor.copy(material.emissive);
          material.emissive.set(this.highlightColor);
        }
        this.onObjectClick(firstIntersect.name);
      }
    }
  }

  private onTouchStart(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

    this.onClick(new MouseEvent('click', {
      clientX: touch.clientX,
      clientY: touch.clientY
    }));
  }

  private onTouchMove(event: TouchEvent) {
    event.preventDefault();
  }

  public setOnClickCallback(callback: (name: string) => void) {
    this.onObjectClick = callback;
  }

  public cleanup() {
    while (this.scene.children.length > 0) {
      const obj = this.scene.children[0];
      this.scene.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(material => material.dispose());
        } else {
          (obj.material as THREE.Material).dispose();
        }
      }
    }
    this.activeObjects = [];
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);
  }

  public loadSolarSystem() {
    this.cleanup();
    this.camera.position.set(0, 40, 120);
    this.controls.update();

    const createPlanet = (name: string, radius: number, color: number, distance: number, speed: number) => {
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color });
      const planet = new THREE.Mesh(geometry, material);
      planet.name = name;

      const pivot = new THREE.Object3D();
      this.scene.add(pivot);
      pivot.add(planet);

      planet.position.x = distance;

      pivot.userData.update = () => {
        pivot.rotation.y += speed * 0.01;
      };
      this.activeObjects.push(pivot);

      return planet;
    };

    const sunGeo = new THREE.SphereGeometry(10, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfdb813 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.name = "Sun";
    this.scene.add(sun);
    this.activeObjects.push(sun);

    this.activeObjects.push(createPlanet("Mercury", 2, 0x8c8c8c, 20, 4.7));
    this.activeObjects.push(createPlanet("Venus", 3, 0xd8a162, 30, 3.5));
    this.activeObjects.push(createPlanet("Earth", 3.2, 0x4f70a5, 45, 2.9));
    this.activeObjects.push(createPlanet("Mars", 2.5, 0xc1440e, 60, 2.4));
    this.activeObjects.push(createPlanet("Jupiter", 7, 0xdeaf8c, 85, 1.3));
    this.activeObjects.push(createPlanet("Saturn", 6, 0xe3d9b4, 110, 0.9));
    this.activeObjects.push(createPlanet("Uranus", 4, 0xace5ee, 135, 0.6));
    this.activeObjects.push(createPlanet("Neptune", 4, 0x3e54e8, 155, 0.5));

    this.onResize();
  }

  // Additional models (DNA, Neon Atom) would be added similarly...

}

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string>('student');

  // 3D Viewer canvas reference and instance
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeDViewerRef = useRef<ThreeDViewer | null>(null);

  // Handler to receive object name clicks from 3D viewer
  const on3DObjectClick = (name: string) => {
    alert(`You clicked on ${name}.`);
    // You may integrate AI chat fetching here as in original code logic
  };

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

  useEffect(() => {
    if (activeTab === 'simulate' && selectedModule === 'solar-system') {
      // Initialize 3D viewer on the canvas if canvas available
      if (canvasRef.current) {
        if (!threeDViewerRef.current) {
          threeDViewerRef.current = new ThreeDViewer(canvasRef.current);
          threeDViewerRef.current.setOnClickCallback(on3DObjectClick);
          threeDViewerRef.current.loadSolarSystem();
        }
      }
    } else {
      // Clean up 3D viewer if user leaves simulation or changes module
      if (threeDViewerRef.current) {
        threeDViewerRef.current.cleanup();
        threeDViewerRef.current = null;
      }
    }
  }, [activeTab, selectedModule]);

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

  // Render main content including 3D canvas during simulation with solar system module
  const renderContent = () => {
    if (selectedModule) {
      if (selectedModule === 'solar-system') {
        return (
          <div className="relative flex flex-col flex-1 bg-gray-800">
            <button
              onClick={activeTab === 'home' ? handleBackToHome : handleBackToSimulate}
              className="absolute top-2 left-2 z-10 px-4 py-2 bg-blue-600 rounded text-white"
            >
              Back
            </button>
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100vh', display: 'block' }}
              id="3d-canvas"
            />
          </div>
        );
      }
      return (
        <SimulationScreen
          moduleId={selectedModule}
          onBack={activeTab === 'home' ? handleBackToHome : handleBackToSimulate}
        />
      );
    }

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

  // Available tabs for bottom navigation
  const availableTabs = ['home', 'simulate', 'dashboard', 'profile'];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col max-w-md mx-auto relative">
      {/* Status Bar Simulation */}
      <div className="bg-gray-900 text-white p-2 text-center text-xs">
        9:41 AM • InsightXR
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col" style={{ paddingBottom: selectedModule ? '0' : '70px' }}>
        {renderContent()}
      </div>

      {/* Bottom Navigation - Hide when in simulation with module selected */}
      {!selectedModule && (
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          availableTabs={availableTabs}
        />
      )}
    </div>
  );
}
