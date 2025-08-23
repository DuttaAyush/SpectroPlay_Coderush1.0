import React, { useEffect, useState } from 'react';

interface WebGLDetectorProps {
  children: React.ReactNode;
}

export function WebGLDetector({ children }: WebGLDetectorProps) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
          setWebglSupported(false);
          return;
        }

        // Check for basic WebGL capabilities
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          console.log('WebGL Renderer:', renderer);
        }

        setWebglSupported(true);
      } catch (error) {
        console.error('WebGL check failed:', error);
        setWebglSupported(false);
      }
    };

    checkWebGL();
  }, []);

  if (webglSupported === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Checking WebGL support...</p>
        </div>
      </div>
    );
  }

  if (!webglSupported) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">WebGL Not Supported</h2>
          <p className="text-gray-400 mb-4">
            Your browser doesn't support WebGL, which is required for 3D simulations. The chatbot and other features will still work.
          </p>
          <div className="text-left text-sm text-gray-500 space-y-2">
            <p><strong>To enable 3D features, try:</strong></p>
            <ul className="space-y-1">
              <li>• Using Chrome, Firefox, or Edge</li>
              <li>• Enabling hardware acceleration in your browser</li>
              <li>• Updating your graphics drivers</li>
              <li>• Disabling browser extensions that might interfere</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

