import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Text, Line, Ring } from '@react-three/drei';
import * as THREE from 'three';

interface OrbitalMechanicsModelProps {
  showOrbits?: boolean;
  showLabels?: boolean;
  timeScale?: number;
  showTrajectories?: boolean;
  showGravity?: boolean;
  showVelocity?: boolean;
  showPlanets?: boolean;
  showSun?: boolean;
  numPlanets?: number;
}

interface Planet {
  id: number;
  name: string;
  position: [number, number, number];
  velocity: [number, number, number];
  mass: number;
  radius: number;
  color: string;
  orbitRadius: number;
  orbitPeriod: number;
  inclination: number;
}

export function OrbitalMechanicsModel({
  showOrbits = true,
  showLabels = true,
  timeScale = 1,
  showTrajectories = true,
  showGravity = true,
  showVelocity = true,
  showPlanets = true,
  showSun = true,
  numPlanets = 4
}: OrbitalMechanicsModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [animationTime, setAnimationTime] = useState(0);
  const [hoveredPlanet, setHoveredPlanet] = useState<number | null>(null);

  // Generate planets
  const planets = useMemo(() => {
    const plts: Planet[] = [];
    const sunMass = 1000;
    const G = 6.67430e-11; // Gravitational constant (simplified)
    
    for (let i = 0; i < numPlanets; i++) {
      const orbitRadius = 2 + i * 1.5;
      const mass = 1 + Math.random() * 5;
      const orbitalVelocity = Math.sqrt((G * sunMass) / orbitRadius);
      const inclination = (Math.random() - 0.5) * Math.PI / 6; // Small inclination
      
      plts.push({
        id: i,
        name: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'][i],
        position: [orbitRadius, 0, 0],
        velocity: [0, orbitalVelocity, 0],
        mass,
        radius: 0.1 + (mass / 10),
        color: ['#8B4513', '#FFD700', '#4169E1', '#DC143C', '#FFA500', '#F4A460', '#87CEEB', '#1E90FF'][i],
        orbitRadius,
        orbitPeriod: 2 * Math.PI * orbitRadius / orbitalVelocity,
        inclination
      });
    }
    return plts;
  }, [numPlanets]);

  // Calculate planet positions based on time
  const getPlanetPositions = (time: number) => {
    return planets.map(planet => {
      const angle = (time * timeScale) / planet.orbitPeriod;
      const x = planet.orbitRadius * Math.cos(angle);
      const y = planet.orbitRadius * Math.sin(angle) * Math.sin(planet.inclination);
      const z = planet.orbitRadius * Math.sin(angle) * Math.cos(planet.inclination);
      
      return {
        ...planet,
        position: [x, y, z] as [number, number, number],
        velocity: [
          -planet.orbitRadius * Math.sin(angle) * (2 * Math.PI / planet.orbitPeriod),
          planet.orbitRadius * Math.cos(angle) * Math.sin(planet.inclination) * (2 * Math.PI / planet.orbitPeriod),
          planet.orbitRadius * Math.cos(angle) * Math.cos(planet.inclination) * (2 * Math.PI / planet.orbitPeriod)
        ] as [number, number, number]
      };
    });
  };

  // Generate orbit paths
  const orbitPaths = useMemo(() => {
    if (!showOrbits) return [];
    
    const paths: Array<{
      points: THREE.Vector3[];
      color: string;
      inclination: number;
    }> = [];
    
    for (const planet of planets) {
      const points: THREE.Vector3[] = [];
      const numPoints = 100;
      
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const x = planet.orbitRadius * Math.cos(angle);
        const y = planet.orbitRadius * Math.sin(angle) * Math.sin(planet.inclination);
        const z = planet.orbitRadius * Math.sin(angle) * Math.cos(planet.inclination);
        points.push(new THREE.Vector3(x, y, z));
      }
      
      paths.push({
        points,
        color: planet.color,
        inclination: planet.inclination
      });
    }
    
    return paths;
  }, [planets, showOrbits]);

  // Generate gravity field lines
  const gravityFieldLines = useMemo(() => {
    if (!showGravity) return [];
    
    const lines: Array<{
      points: THREE.Vector3[];
      color: string;
      intensity: number;
    }> = [];
    
    const numLines = 12;
    const lineLength = 6;
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const radius = 0.5;
      const startX = Math.cos(angle) * radius;
      const startZ = Math.sin(angle) * radius;
      
      const points: THREE.Vector3[] = [];
      for (let step = 0; step < lineLength; step++) {
        const t = step / lineLength;
        const x = startX * (1 + t * 3);
        const y = 0;
        const z = startZ * (1 + t * 3);
        points.push(new THREE.Vector3(x, y, z));
      }
      
      lines.push({
        points,
        color: '#FFD700',
        intensity: 0.4
      });
    }
    
    return lines;
  }, [showGravity]);

  // Animation loop
  useFrame((state, delta) => {
    setAnimationTime(prev => prev + delta);
    
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  const currentPlanets = getPlanetPositions(animationTime);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Sun */}
      {showSun && (
        <group>
          <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
            <meshStandardMaterial 
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.3}
            />
          </Sphere>
          
          {/* Sun glow */}
          <Sphere args={[1.2, 32, 32]} position={[0, 0, 0]}>
            <meshStandardMaterial 
              color="#FFD700"
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
            />
          </Sphere>
          
          {showLabels && (
            <Text
              position={[0, 1.2, 0]}
              fontSize={0.4}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              Sun
            </Text>
          )}
        </group>
      )}

      {/* Orbit paths */}
      {showOrbits && orbitPaths.map((path, index) => (
        <Line
          key={`orbit-${index}`}
          points={path.points}
          color={path.color}
          lineWidth={1}
          opacity={0.3}
          transparent
        />
      ))}

      {/* Gravity field lines */}
      {showGravity && gravityFieldLines.map((line, index) => (
        <Line
          key={`gravity-${index}`}
          points={line.points}
          color={line.color}
          lineWidth={1}
          opacity={line.intensity}
          transparent
        />
      ))}

      {/* Planets */}
      {showPlanets && currentPlanets.map((planet) => (
        <group key={planet.id}>
          <Sphere
            position={planet.position}
            args={[planet.radius, 16, 16]}
            onPointerOver={() => setHoveredPlanet(planet.id)}
            onPointerOut={() => setHoveredPlanet(null)}
          >
            <meshStandardMaterial 
              color={planet.color}
              emissive={hoveredPlanet === planet.id ? planet.color : '#000000'}
              emissiveIntensity={hoveredPlanet === planet.id ? 0.3 : 0}
            />
          </Sphere>

          {/* Velocity vector */}
          {showVelocity && (
            <Line
              points={[
                new THREE.Vector3(...planet.position),
                new THREE.Vector3(
                  planet.position[0] + planet.velocity[0] * 0.5,
                  planet.position[1] + planet.velocity[1] * 0.5,
                  planet.position[2] + planet.velocity[2] * 0.5
                )
              ]}
              color="#00FF00"
              lineWidth={2}
              opacity={0.8}
              transparent
            />
          )}

          {/* Planet labels */}
          {showLabels && hoveredPlanet === planet.id && (
            <Text
              position={[
                planet.position[0] + 0.5,
                planet.position[1] + 0.5,
                planet.position[2]
              ]}
              fontSize={0.3}
              color="white"
              anchorX="left"
              anchorY="middle"
            >
              {planet.name}
            </Text>
          )}

          {/* Trajectory trail */}
          {showTrajectories && (
            <group>
              {/* Simple trail effect */}
              <Sphere
                position={planet.position}
                args={[planet.radius * 0.5, 8, 8]}
              >
                <meshStandardMaterial 
                  color={planet.color}
                  transparent
                  opacity={0.3}
                />
              </Sphere>
            </group>
          )}
        </group>
      ))}

      {/* Scale indicator */}
      {showLabels && (
        <group position={[0, -4, 0]}>
          <Text
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Solar System Scale Model
          </Text>
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.3}
            color="gray"
            anchorX="center"
            anchorY="middle"
          >
            Time Scale: {timeScale}x
          </Text>
        </group>
      )}
    </group>
  );
}

// Information panel component for the UI overlay
export function OrbitalMechanicsInfoPanel({ 
  timeScale, 
  hoveredPlanet,
  planets 
}: { 
  timeScale: number; 
  hoveredPlanet: number | null;
  planets: Planet[];
}) {
  const selectedPlanet = hoveredPlanet !== null ? planets[hoveredPlanet] : null;

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 text-white border border-gray-700/50 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">
          Orbital Mechanics Simulation
        </h3>
        <p className="text-sm text-gray-300 mb-3">
          Explore planetary motion and gravitational forces in our solar system
        </p>
        <div className="text-xs text-gray-400">
          Kepler's Laws • Gravitational Forces • Orbital Periods • Velocity Vectors
        </div>
        {selectedPlanet && (
          <div className="mt-3 p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
            <div className="text-blue-300 text-sm">{selectedPlanet.name}</div>
            <div className="text-blue-200 text-xs">
              Orbit: {selectedPlanet.orbitRadius.toFixed(1)} AU • 
              Period: {(selectedPlanet.orbitPeriod / (2 * Math.PI)).toFixed(1)} years
            </div>
          </div>
        )}
        <div className="mt-2 text-xs text-gray-400">
          Time Scale: {timeScale}x • Planets: {planets.length}
        </div>
      </div>
    </div>
  );
}