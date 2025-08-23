import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

interface ElectromagnetismModelProps {
  showElectricField?: boolean;
  showMagneticField?: boolean;
  animate?: boolean;
  showCharges?: boolean;
  showFieldLines?: boolean;
  showVectors?: boolean;
  showLabels?: boolean;
  numCharges?: number;
  fieldStrength?: number;
}

interface Charge {
  id: number;
  position: [number, number, number];
  charge: number; // positive or negative
  magnitude: number;
  color: string;
}

interface FieldLine {
  points: THREE.Vector3[];
  color: string;
  intensity: number;
}

export function ElectromagnetismModel({
  showElectricField = true,
  showMagneticField = false,
  animate = true,
  showCharges = true,
  showFieldLines = true,
  showVectors = true,
  showLabels = true,
  numCharges = 4,
  fieldStrength = 1
}: ElectromagnetismModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [animationTime, setAnimationTime] = useState(0);
  const [hoveredCharge, setHoveredCharge] = useState<number | null>(null);

  // Generate charges
  const charges = useMemo(() => {
    const chgs: Charge[] = [];
    const radius = 3;
    
    for (let i = 0; i < numCharges; i++) {
      const angle = (i / numCharges) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const charge = i % 2 === 0 ? 1 : -1; // Alternating positive/negative
      
      chgs.push({
        id: i,
        position: [x, 0, z],
        charge,
        magnitude: Math.abs(charge) * fieldStrength,
        color: charge > 0 ? '#ff6b6b' : '#4ecdc4'
      });
    }
    return chgs;
  }, [numCharges, fieldStrength]);

  // Generate electric field lines
  const electricFieldLines = useMemo(() => {
    if (!showElectricField || !showFieldLines) return [];
    
    const lines: FieldLine[] = [];
    const numLines = 20;
    const lineLength = 8;
    const stepSize = 0.2;
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const radius = 4;
      const startX = Math.cos(angle) * radius;
      const startZ = Math.sin(angle) * radius;
      
      const points: THREE.Vector3[] = [];
      let currentX = startX;
      let currentY = 0;
      let currentZ = startZ;
      
      for (let step = 0; step < lineLength / stepSize; step++) {
        points.push(new THREE.Vector3(currentX, currentY, currentZ));
        
        // Calculate electric field at current point
        let fieldX = 0;
        let fieldY = 0;
        let fieldZ = 0;
        
        for (const charge of charges) {
          const dx = currentX - charge.position[0];
          const dy = currentY - charge.position[1];
          const dz = currentZ - charge.position[2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance > 0.1) {
            const force = charge.charge / (distance * distance);
            fieldX += (dx / distance) * force;
            fieldY += (dy / distance) * force;
            fieldZ += (dz / distance) * force;
          }
        }
        
        const fieldMagnitude = Math.sqrt(fieldX * fieldX + fieldY * fieldY + fieldZ * fieldZ);
        if (fieldMagnitude > 0) {
          currentX += (fieldX / fieldMagnitude) * stepSize;
          currentY += (fieldY / fieldMagnitude) * stepSize;
          currentZ += (fieldZ / fieldMagnitude) * stepSize;
        }
      }
      
      lines.push({
        points,
        color: '#ff6b6b',
        intensity: 0.6
      });
    }
    
    return lines;
  }, [showElectricField, showFieldLines, charges]);

  // Generate magnetic field lines
  const magneticFieldLines = useMemo(() => {
    if (!showMagneticField || !showFieldLines) return [];
    
    const lines: FieldLine[] = [];
    const numLines = 16;
    const lineLength = 6;
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const radius = 3;
      const startX = Math.cos(angle) * radius;
      const startZ = Math.sin(angle) * radius;
      
      const points: THREE.Vector3[] = [];
      for (let step = 0; step < lineLength; step++) {
        const t = step / lineLength;
        const x = startX * Math.cos(t * Math.PI * 2);
        const y = startX * Math.sin(t * Math.PI * 2);
        const z = startZ;
        points.push(new THREE.Vector3(x, y, z));
      }
      
      lines.push({
        points,
        color: '#4ecdc4',
        intensity: 0.8
      });
    }
    
    return lines;
  }, [showMagneticField, showFieldLines]);

  // Generate field vectors
  const fieldVectors = useMemo(() => {
    if (!showVectors) return [];
    
    const vectors: Array<{
      position: [number, number, number];
      direction: [number, number, number];
      magnitude: number;
      color: string;
    }> = [];
    
    const gridSize = 8;
    const spacing = 1;
    
    for (let x = -gridSize; x <= gridSize; x += spacing) {
      for (let y = -gridSize; y <= gridSize; y += spacing) {
        for (let z = -gridSize; z <= gridSize; z += spacing) {
          if (Math.abs(x) + Math.abs(y) + Math.abs(z) > gridSize) continue;
          
          let fieldX = 0;
          let fieldY = 0;
          let fieldZ = 0;
          
          for (const charge of charges) {
            const dx = x - charge.position[0];
            const dy = y - charge.position[1];
            const dz = z - charge.position[2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance > 0.5) {
              const force = charge.charge / (distance * distance);
              fieldX += (dx / distance) * force;
              fieldY += (dy / distance) * force;
              fieldZ += (dz / distance) * force;
            }
          }
          
          const magnitude = Math.sqrt(fieldX * fieldX + fieldY * fieldY + fieldZ * fieldZ);
          if (magnitude > 0.1) {
            vectors.push({
              position: [x, y, z],
              direction: [fieldX / magnitude, fieldY / magnitude, fieldZ / magnitude],
              magnitude: Math.min(magnitude, 2),
              color: magnitude > 1 ? '#ff6b6b' : '#4ecdc4'
            });
          }
        }
      }
    }
    
    return vectors;
  }, [showVectors, charges]);

  // Animation loop
  useFrame((state, delta) => {
    if (!animate) return;
    
    setAnimationTime(prev => prev + delta);
    
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Field lines */}
      {electricFieldLines.map((line, index) => (
        <Line
          key={`electric-line-${index}`}
          points={line.points}
          color={line.color}
          lineWidth={2}
          opacity={line.intensity}
          transparent
        />
      ))}
      
      {magneticFieldLines.map((line, index) => (
        <Line
          key={`magnetic-line-${index}`}
          points={line.points}
          color={line.color}
          lineWidth={2}
          opacity={line.intensity}
          transparent
        />
      ))}

      {/* Field vectors */}
      {showVectors && fieldVectors.map((vector, index) => {
        const start = new THREE.Vector3(...vector.position);
        const end = new THREE.Vector3(
          vector.position[0] + vector.direction[0] * 0.5 * vector.magnitude,
          vector.position[1] + vector.direction[1] * 0.5 * vector.magnitude,
          vector.position[2] + vector.direction[2] * 0.5 * vector.magnitude
        );
        
        return (
          <Line
            key={`vector-${index}`}
            points={[start, end]}
            color={vector.color}
            lineWidth={2}
            opacity={0.8}
            transparent
          />
        );
      })}

      {/* Charges */}
      {showCharges && charges.map((charge) => (
        <group key={charge.id}>
          <Sphere
            position={charge.position}
            args={[0.3, 16, 16]}
            onPointerOver={() => setHoveredCharge(charge.id)}
            onPointerOut={() => setHoveredCharge(null)}
          >
            <meshStandardMaterial 
              color={charge.color}
              emissive={hoveredCharge === charge.id ? charge.color : '#000000'}
              emissiveIntensity={hoveredCharge === charge.id ? 0.5 : 0}
            />
          </Sphere>

          {/* Charge indicator */}
          <Text
            position={[charge.position[0], charge.position[1] + 0.5, charge.position[2]]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {charge.charge > 0 ? '+' : '-'}
          </Text>

          {/* Charge labels */}
          {showLabels && hoveredCharge === charge.id && (
            <Text
              position={[charge.position[0] + 0.8, charge.position[1], charge.position[2]]}
              fontSize={0.3}
              color="white"
              anchorX="left"
              anchorY="middle"
            >
              Charge {charge.charge > 0 ? 'Positive' : 'Negative'}
            </Text>
          )}
        </group>
      ))}

      {/* Magnetic field source (wire) */}
      {showMagneticField && (
        <Cylinder
          position={[0, 0, 0]}
          args={[0.1, 0.1, 8, 8]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial color="#f39c12" />
        </Cylinder>
      )}

      {/* Field type indicator */}
      {showLabels && (
        <Text
          position={[0, -4, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {showElectricField ? 'Electric' : 'Magnetic'} Field
        </Text>
      )}
    </group>
  );
}

// Information panel component for the UI overlay
export function ElectromagnetismInfoPanel({ 
  showElectricField, 
  showMagneticField,
  hoveredCharge 
}: { 
  showElectricField: boolean; 
  showMagneticField: boolean;
  hoveredCharge: number | null;
}) {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 text-white border border-gray-700/50 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">
          {showElectricField ? 'Electric' : 'Magnetic'} Field Visualization
        </h3>
        <p className="text-sm text-gray-300 mb-3">
          {showElectricField 
            ? 'Visualize electric field lines and forces between charges'
            : 'Observe magnetic field patterns around current-carrying conductors'
          }
        </p>
        <div className="text-xs text-gray-400">
          {showElectricField 
            ? 'Coulomb\'s Law • Field Lines • Vector Fields • Charge Interactions'
            : 'Right-Hand Rule • Field Lines • Magnetic Flux • Current Flow'
          }
        </div>
        {hoveredCharge !== null && (
          <div className="mt-3 p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
            <div className="text-blue-300 text-sm">Charge {hoveredCharge + 1}</div>
            <div className="text-blue-200 text-xs">Hover to see details</div>
          </div>
        )}
      </div>
    </div>
  );
}