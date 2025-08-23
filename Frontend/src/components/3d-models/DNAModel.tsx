import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Cylinder, Line } from '@react-three/drei';
import * as THREE from 'three';

interface DNAModelProps {
  currentPhase?: number;
  isPlaying?: boolean;
  onObjectClick?: (objectName: string) => void;
  animate?: boolean;
  showReplication?: boolean;
  autoRotate?: boolean;
  showLabels?: boolean;
  showBases?: boolean;
  showBackbone?: boolean;
  showHydrogenBonds?: boolean;
}

interface BasePair {
  id: number;
  position: [number, number, number];
  base1: string;
  base2: string;
  angle: number;
  colors: {
    A: string;
    T: string;
    G: string;
    C: string;
  };
}

export function DNAModel({ 
  currentPhase = 0,
  isPlaying = false,
  onObjectClick,
  animate = true, 
  showReplication = false,
  autoRotate = true,
  showLabels = true,
  showBases = true,
  showBackbone = true,
  showHydrogenBonds = true
}: DNAModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [rotation, setRotation] = useState(0);
  const [helixOffset, setHelixOffset] = useState(0);
  const [hoveredBase, setHoveredBase] = useState<number | null>(null);

  // Generate base pairs
  const basePairs = useMemo(() => {
    const pairs: BasePair[] = [];
    const numPairs = 24;
    const radius = 2;
    const height = 0.3;
    
    for (let i = 0; i < numPairs; i++) {
      const angle = (i / numPairs) * Math.PI * 4; // Double helix
      const y = (i - numPairs / 2) * height;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const bases = ['A', 'T', 'G', 'C'];
      const base1 = bases[i % 4];
      const base2 = base1 === 'A' ? 'T' : base1 === 'T' ? 'A' : base1 === 'G' ? 'C' : 'G';
      
      pairs.push({
        id: i,
        position: [x, y, z],
        base1,
        base2,
        angle,
        colors: {
          A: '#ff6b6b',
          T: '#4ecdc4',
          G: '#45b7d1',
          C: '#96ceb4'
        }
      });
    }
    return pairs;
  }, []);

  // Animation loop
  useFrame((state, delta) => {
    if (!animate || !isPlaying) return;
    
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
    
    if (showReplication) {
      setHelixOffset(prev => prev + delta * 0.5);
    }
  });

  // Generate backbone strands
  const backboneStrands = useMemo(() => {
    if (!showBackbone) return [];
    
    const strands = [];
    const numPoints = basePairs.length;
    const radius = 2;
    
    for (let strand = 0; strand < 2; strand++) {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 4 + (strand * Math.PI);
        const y = (i - numPoints / 2) * 0.3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        points.push(new THREE.Vector3(x, y, z));
      }
      strands.push(points);
    }
    
    return strands;
  }, [basePairs, showBackbone]);

  // Generate hydrogen bonds
  const hydrogenBonds = useMemo(() => {
    if (!showHydrogenBonds) return [];
    
    const bonds = [];
    for (const pair of basePairs) {
      const [x, y, z] = pair.position;
      const leftAngle = pair.angle;
      const rightAngle = pair.angle + Math.PI;
      const radius = 2;
      
      const leftX = Math.cos(leftAngle) * radius;
      const leftZ = Math.sin(leftAngle) * radius;
      const rightX = Math.cos(rightAngle) * radius;
      const rightZ = Math.sin(rightAngle) * radius;
      
      bonds.push([
        new THREE.Vector3(leftX, y, leftZ),
        new THREE.Vector3(rightX, y, rightZ)
      ]);
    }
    
    return bonds;
  }, [basePairs, showHydrogenBonds]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Backbone strands */}
      {showBackbone && backboneStrands.map((strand, strandIndex) => (
        <Line
          key={`strand-${strandIndex}`}
          points={strand}
          color={strandIndex === 0 ? "#8B4513" : "#654321"}
          lineWidth={3}
        />
      ))}

      {/* Hydrogen bonds */}
      {showHydrogenBonds && hydrogenBonds.map((bond, index) => (
        <Line
          key={`bond-${index}`}
          points={bond}
          color="#C0C0C0"
          lineWidth={1}
          opacity={0.6}
          transparent
        />
      ))}

      {/* Base pairs */}
      {showBases && basePairs.map((pair) => {
        const [x, y, z] = pair.position;
        const leftAngle = pair.angle;
        const rightAngle = pair.angle + Math.PI;
        const radius = 2;
        
        const leftX = Math.cos(leftAngle) * radius;
        const leftZ = Math.sin(leftAngle) * radius;
        const rightX = Math.cos(rightAngle) * radius;
        const rightZ = Math.sin(rightAngle) * radius;
        
        const replicationOffset = showReplication ? 
          Math.sin(helixOffset + pair.id * 0.3) * 0.5 : 0;
        
        return (
          <group key={pair.id}>
            {/* Left base */}
            <Sphere
              position={[leftX + replicationOffset, y, leftZ]}
              args={[0.15, 16, 16]}
              onPointerOver={() => setHoveredBase(pair.id)}
              onPointerOut={() => setHoveredBase(null)}
              onClick={() => onObjectClick?.(`${pair.base1} (Adenine)`)}
            >
              <meshStandardMaterial 
                color={pair.colors[pair.base1 as keyof typeof pair.colors]}
                emissive={hoveredBase === pair.id ? pair.colors[pair.base1 as keyof typeof pair.colors] : '#000000'}
                emissiveIntensity={hoveredBase === pair.id ? 0.3 : 0}
              />
            </Sphere>

            {/* Right base */}
            <Sphere
              position={[rightX - replicationOffset, y, rightZ]}
              args={[0.15, 16, 16]}
              onPointerOver={() => setHoveredBase(pair.id)}
              onPointerOut={() => setHoveredBase(null)}
              onClick={() => onObjectClick?.(`${pair.base2} (Thymine)`)}
            >
              <meshStandardMaterial 
                color={pair.colors[pair.base2 as keyof typeof pair.colors]}
                emissive={hoveredBase === pair.id ? pair.colors[pair.base2 as keyof typeof pair.colors] : '#000000'}
                emissiveIntensity={hoveredBase === pair.id ? 0.3 : 0}
              />
            </Sphere>

            {/* Base labels */}
            {showLabels && hoveredBase === pair.id && (
              <>
                <Text
                  position={[leftX + replicationOffset + 0.3, y, leftZ]}
                  fontSize={0.2}
                  color="white"
                  anchorX="left"
                  anchorY="middle"
                >
                  {pair.base1}
                </Text>
                <Text
                  position={[rightX - replicationOffset - 0.3, y, rightZ]}
                  fontSize={0.2}
                  color="white"
                  anchorX="right"
                  anchorY="middle"
                >
                  {pair.base2}
                </Text>
              </>
            )}
          </group>
        );
      })}

      {/* Replication fork indicator */}
      {showReplication && (
        <group position={[0, 0, 0]}>
          <Cylinder
            position={[0, 0, 0]}
            args={[0.1, 0.1, 8, 8]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.5} />
          </Cylinder>
        </group>
      )}
    </group>
  );
}

// Information panel component for the UI overlay
export function DNAInfoPanel({ 
  showReplication, 
  hoveredBase 
}: { 
  showReplication: boolean; 
  hoveredBase: number | null;
}) {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 text-white border border-gray-700/50 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">
          {showReplication ? 'DNA Replication Process' : 'DNA Double Helix Structure'}
        </h3>
        <p className="text-sm text-gray-300 mb-3">
          {showReplication 
            ? 'Watch the DNA strands unwind and separate for replication'
            : 'Antiparallel strands with complementary base pairing'
          }
        </p>
        <div className="text-xs text-gray-400">
          5' → 3' direction • Hydrogen bonds • Sugar-phosphate backbone
        </div>
        {hoveredBase !== null && (
          <div className="mt-3 p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
            <div className="text-blue-300 text-sm">Base Pair {hoveredBase + 1}</div>
            <div className="text-blue-200 text-xs">Hover to see details</div>
          </div>
        )}
      </div>
    </div>
  );
}