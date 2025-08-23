import React, { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';

interface ThreeSceneProps {
  children: React.ReactNode;
  camera?: {
    position?: [number, number, number];
    fov?: number;
  };
  controls?: boolean;
  background?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableRotate?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-white text-lg font-medium">Loading 3D Model...</p>
        <p className="text-gray-400 text-sm mt-1">Preparing immersive experience...</p>
      </div>
    </div>
  );
}

export function ThreeScene({ 
  children, 
  camera = { position: [0, 0, 8], fov: 75 }, 
  controls = true,
  background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  enableZoom = true,
  enablePan = true,
  enableRotate = true,
  autoRotate = false,
  autoRotateSpeed = 1
}: ThreeSceneProps) {
  const controlsRef = useRef<any>(null);

  const handleContextLost = (event: any) => {
    console.warn('WebGL context lost, attempting to restore...');
    event.preventDefault();
  };

  const handleContextRestored = () => {
    console.log('WebGL context restored successfully');
  };

  const handleError = (error: any) => {
    console.error('Three.js error:', error);
  };

  // Handle WebGL context loss
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const handleContextLost = (event: any) => {
        console.warn('WebGL context lost, attempting to restore...');
        event.preventDefault();
      };

      const handleContextRestored = () => {
        console.log('WebGL context restored successfully');
      };

      canvas.addEventListener('webglcontextlost', handleContextLost);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);

      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    }
  }, []);

  // Memoize GL context options to prevent unnecessary re-renders
  const glOptions = useMemo(() => ({
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance" as const,
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false
  }), []);

  const cameraOptions = useMemo(() => ({
    position: camera.position, 
    fov: camera.fov,
    near: 0.1,
    far: 1000
  }), [camera.position, camera.fov]);

  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      style={{ background }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          gl={glOptions}
          camera={cameraOptions}
          onError={handleError}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Environment */}
          <Environment preset="city" />

          {/* Camera Controls */}
          {controls && (
            <OrbitControls
              ref={controlsRef}
              enableZoom={enableZoom}
              enablePan={enablePan}
              enableRotate={enableRotate}
              autoRotate={autoRotate}
              autoRotateSpeed={autoRotateSpeed}
              minDistance={2}
              maxDistance={20}
              dampingFactor={0.05}
              enableDamping={true}
            />
          )}

          {/* 3D Content */}
          {children}
        </Canvas>
      </Suspense>
      
      {/* Interactive overlay for touch controls */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full" style={{ 
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.1) 100%)' 
        }} />
      </div>

      {/* Controls Info */}
      {controls && (
        <div className="absolute bottom-4 right-4 bg-gray-800/95 backdrop-blur-sm rounded-xl p-3 border border-gray-700/50 text-white text-xs">
          <div className="font-medium mb-2">Controls</div>
          <div className="space-y-1 text-gray-300">
            <div>🖱️ Drag: Rotate</div>
            <div>🔍 Scroll: Zoom</div>
            <div>🖱️ Right drag: Pan</div>
          </div>
        </div>
      )}
    </div>
  );
}