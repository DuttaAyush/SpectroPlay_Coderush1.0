import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

interface CellDivisionModelProps {
  phase?: 'interphase' | 'prophase' | 'metaphase' | 'anaphase' | 'telophase' | 'cytokinesis';
  autoAnimate?: boolean;
  showLabels?: boolean;
  showSpindle?: boolean;
  showChromosomes?: boolean;
  showCellMembrane?: boolean;
  showNucleus?: boolean;
}

interface Chromosome {
  id: number;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  isReplicated: boolean;
  sisterChromatids: [number, number, number][];
}

export function CellDivisionModel({
  phase = 'metaphase',
  autoAnimate = true,
  showLabels = true,
  showSpindle = true,
  showChromosomes = true,
  showCellMembrane = true,
  showNucleus = true
}: CellDivisionModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [animationTime, setAnimationTime] = useState(0);
  const [hoveredChromosome, setHoveredChromosome] = useState<number | null>(null);

  // Generate chromosomes
  const chromosomes = useMemo(() => {
    const chroms: Chromosome[] = [];
    const numChromosomes = 8;
    const cellRadius = 3;
    
    for (let i = 0; i < numChromosomes; i++) {
      const angle = (i / numChromosomes) * Math.PI * 2;
      const radius = cellRadius * 0.6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const isReplicated = phase !== 'interphase' && phase !== 'prophase';
      const sisterChromatids = isReplicated ? [
        [x - 0.2, 0, z],
        [x + 0.2, 0, z]
      ] : [[x, 0, z]];
      
      chroms.push({
        id: i,
        position: [x, 0, z],
        rotation: [0, angle, 0],
        color: `hsl(${(i / numChromosomes) * 360}, 70%, 60%)`,
        isReplicated,
        sisterChromatids
      });
    }
    return chroms;
  }, [phase]);

  // Animation loop
  useFrame((state, delta) => {
    if (!autoAnimate) return;
    
    setAnimationTime(prev => prev + delta);
    
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  // Calculate phase-specific positions
  const getPhasePositions = (chromosome: Chromosome) => {
    const time = animationTime;
    const cellRadius = 3;
    
    switch (phase) {
      case 'interphase':
        return {
          position: chromosome.position,
          rotation: chromosome.rotation,
          scale: 1
        };
      
      case 'prophase':
        const prophaseOffset = Math.sin(time + chromosome.id) * 0.3;
        return {
          position: [
            chromosome.position[0] + prophaseOffset,
            chromosome.position[1],
            chromosome.position[2]
          ] as [number, number, number],
          rotation: [0, chromosome.rotation[1] + time, 0] as [number, number, number],
          scale: 1.2
        };
      
      case 'metaphase':
        const metaphaseAngle = (chromosome.id / chromosomes.length) * Math.PI * 2;
        const metaphaseRadius = cellRadius * 0.8;
        return {
          position: [
            Math.cos(metaphaseAngle) * metaphaseRadius,
            0,
            Math.sin(metaphaseAngle) * metaphaseRadius
          ] as [number, number, number],
          rotation: [0, metaphaseAngle, 0] as [number, number, number],
          scale: 1.5
        };
      
      case 'anaphase':
        const anaphaseOffset = Math.sin(time * 2) * 2;
        const anaphaseAngle = (chromosome.id / chromosomes.length) * Math.PI * 2;
        return {
          position: [
            Math.cos(anaphaseAngle) * (cellRadius * 0.4 + anaphaseOffset),
            Math.sin(time + chromosome.id) * 0.5,
            Math.sin(anaphaseAngle) * (cellRadius * 0.4 + anaphaseOffset)
          ] as [number, number, number],
          rotation: [0, anaphaseAngle, 0] as [number, number, number],
          scale: 1.3
        };
      
      case 'telophase':
        const telophaseAngle = (chromosome.id / chromosomes.length) * Math.PI * 2;
        const telophaseRadius = cellRadius * 0.3;
        return {
          position: [
            Math.cos(telophaseAngle) * telophaseRadius,
            0,
            Math.sin(telophaseAngle) * telophaseRadius
          ] as [number, number, number],
          rotation: [0, telophaseAngle, 0] as [number, number, number],
          scale: 1.1
        };
      
      case 'cytokinesis':
        const cytokinesisOffset = Math.sin(time + chromosome.id) * 0.2;
        return {
          position: [
            chromosome.position[0] + cytokinesisOffset,
            chromosome.position[1],
            chromosome.position[2]
          ] as [number, number, number],
          rotation: [0, chromosome.rotation[1], 0] as [number, number, number],
          scale: 1
        };
      
      default:
        return {
          position: chromosome.position,
          rotation: chromosome.rotation,
          scale: 1
        };
    }
  };

  // Generate spindle fibers
  const spindleFibers = useMemo(() => {
    if (!showSpindle || phase === 'interphase' || phase === 'prophase') return [];
    
    const fibers = [];
    const numFibers = 12;
    const spindleLength = 6;
    
    for (let i = 0; i < numFibers; i++) {
      const angle = (i / numFibers) * Math.PI * 2;
      const radius = 0.5;
      
      fibers.push([
        new THREE.Vector3(
          Math.cos(angle) * radius,
          -spindleLength / 2,
          Math.sin(angle) * radius
        ),
        new THREE.Vector3(
          Math.cos(angle) * radius,
          spindleLength / 2,
          Math.sin(angle) * radius
        )
      ]);
    }
    
    return fibers;
  }, [showSpindle, phase]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Cell membrane */}
      {showCellMembrane && (
        <Sphere args={[3, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#4a90e2" 
            transparent 
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </Sphere>
      )}

      {/* Nucleus (only in interphase) */}
      {showNucleus && phase === 'interphase' && (
        <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#e74c3c" 
            transparent 
            opacity={0.3}
          />
        </Sphere>
      )}

      {/* Spindle fibers */}
      {showSpindle && spindleFibers.map((fiber, index) => (
        <Line
          key={`spindle-${index}`}
          points={fiber}
          color="#f39c12"
          lineWidth={2}
          opacity={0.6}
          transparent
        />
      ))}

      {/* Chromosomes */}
      {showChromosomes && chromosomes.map((chromosome) => {
        const phaseData = getPhasePositions(chromosome);
        
        return (
          <group key={chromosome.id}>
            {chromosome.sisterChromatids.map((position, chromatidIndex) => {
              const adjustedPosition = [
                position[0] + phaseData.position[0],
                position[1] + phaseData.position[1],
                position[2] + phaseData.position[2]
              ] as [number, number, number];
              
              return (
                <group key={`chromatid-${chromatidIndex}`}>
                  {/* Chromosome body */}
                  <Cylinder
                    position={adjustedPosition}
                    args={[0.1, 0.1, 0.8, 8]}
                    rotation={phaseData.rotation}
                    scale={phaseData.scale}
                    onPointerOver={() => setHoveredChromosome(chromosome.id)}
                    onPointerOut={() => setHoveredChromosome(null)}
                  >
                    <meshStandardMaterial 
                      color={chromosome.color}
                      emissive={hoveredChromosome === chromosome.id ? chromosome.color : '#000000'}
                      emissiveIntensity={hoveredChromosome === chromosome.id ? 0.3 : 0}
                    />
                  </Cylinder>

                  {/* Centromere */}
                  <Sphere
                    position={adjustedPosition}
                    args={[0.15, 8, 8]}
                    scale={phaseData.scale}
                  >
                    <meshStandardMaterial color="#2c3e50" />
                  </Sphere>
                </group>
              );
            })}

            {/* Chromosome labels */}
            {showLabels && hoveredChromosome === chromosome.id && (
              <Text
                position={[
                  phaseData.position[0] + 0.5,
                  phaseData.position[1] + 0.5,
                  phaseData.position[2]
                ]}
                fontSize={0.3}
                color="white"
                anchorX="left"
                anchorY="middle"
              >
                Chromosome {chromosome.id + 1}
              </Text>
            )}
          </group>
        );
      })}

      {/* Phase indicator */}
      {showLabels && (
        <Text
          position={[0, -4, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {phase.charAt(0).toUpperCase() + phase.slice(1)}
        </Text>
      )}
    </group>
  );
}

// Information panel component for the UI overlay
export function CellDivisionInfoPanel({ 
  phase, 
  hoveredChromosome 
}: { 
  phase: string; 
  hoveredChromosome: number | null;
}) {
  const phaseDescriptions = {
    interphase: 'Cell grows and DNA replicates',
    prophase: 'Chromosomes condense and become visible',
    metaphase: 'Chromosomes align at the cell equator',
    anaphase: 'Sister chromatids separate and move to poles',
    telophase: 'Nuclear membranes reform around chromosomes',
    cytokinesis: 'Cell membrane pinches to form two cells'
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 text-white border border-gray-700/50 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">
          Cell Division - {phase.charAt(0).toUpperCase() + phase.slice(1)}
        </h3>
        <p className="text-sm text-gray-300 mb-3">
          {phaseDescriptions[phase as keyof typeof phaseDescriptions]}
        </p>
        <div className="text-xs text-gray-400">
          Mitosis • Chromosome behavior • Spindle fibers • Cell cycle
        </div>
        {hoveredChromosome !== null && (
          <div className="mt-3 p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
            <div className="text-blue-300 text-sm">Chromosome {hoveredChromosome + 1}</div>
            <div className="text-blue-200 text-xs">Hover to see details</div>
          </div>
        )}
      </div>
    </div>
  );
}