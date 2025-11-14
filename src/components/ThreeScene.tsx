import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';

function ParticleTrails() {
  const particlesRef = useRef<THREE.Points>(null);
  const audioSnapshot = useAppStore((state) => state.audioSnapshot);
  const selectedPalette = useAppStore((state) => state.selectedPalette);
  const brightness = useAppStore((state) => state.brightness);

  // Generate particle positions
  const particles = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Distribute particles in a sphere
      const radius = Math.random() * 15 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Random initial colors
      colors[i3] = Math.random();
      colors[i3 + 1] = Math.random();
      colors[i3 + 2] = Math.random();
    }

    return { positions, colors };
  }, []);

  // Animate particles based on audio
  useFrame((state) => {
    if (!particlesRef.current) return;

    const time = state.clock.getElapsedTime();
    const { amplitude, bass } = audioSnapshot;

    // Rotate particle system
    particlesRef.current.rotation.y = time * 0.05;
    particlesRef.current.rotation.x = Math.sin(time * 0.1) * 0.2;

    // Update particle positions based on audio
    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;
    const colors = particlesRef.current.geometry.attributes.color
      .array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      // Audio-reactive displacement
      const displacement = amplitude * bass * 2;
      const angle = time * 0.5 + i * 0.01;

      positions[i] += Math.sin(angle) * displacement * 0.02;
      positions[i + 1] += Math.cos(angle) * displacement * 0.02;
      positions[i + 2] += Math.sin(angle * 0.5) * displacement * 0.02;

      // Update colors based on selected palette
      if (selectedPalette.colors.length > 0) {
        const colorIndex = Math.floor(
          (i / positions.length) * selectedPalette.colors.length
        );
        const hex = selectedPalette.colors[colorIndex];
        const color = new THREE.Color(hex);

        const brightnessMultiplier = (brightness / 100) * (0.5 + amplitude * 0.5);
        colors[i] = color.r * brightnessMultiplier;
        colors[i + 1] = color.g * brightnessMultiplier;
        colors[i + 2] = color.b * brightnessMultiplier;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function PulsingSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);
  const audioSnapshot = useAppStore((state) => state.audioSnapshot);
  const selectedPalette = useAppStore((state) => state.selectedPalette);
  const brightness = useAppStore((state) => state.brightness);

  useFrame((state) => {
    if (!sphereRef.current) return;

    const time = state.clock.getElapsedTime();
    const { amplitude, bass, mid, treble } = audioSnapshot;

    // Pulse based on audio amplitude
    const basePulse = 1 + amplitude * 0.5;
    const bassImpact = bass * 0.3;
    const scale = basePulse + bassImpact;

    sphereRef.current.scale.setScalar(scale);

    // Rotate based on mid and treble
    sphereRef.current.rotation.y = time * 0.2 + mid * 2;
    sphereRef.current.rotation.x = time * 0.1 + treble * 2;

    // Update color based on palette
    if (sphereRef.current.material instanceof THREE.MeshStandardMaterial) {
      const primaryColor = new THREE.Color(selectedPalette.colors[0]);
      const brightnessMultiplier = (brightness / 100) * (0.3 + amplitude * 0.7);

      sphereRef.current.material.color.set(primaryColor);
      sphereRef.current.material.emissive.set(primaryColor);
      sphereRef.current.material.emissiveIntensity = brightnessMultiplier * 2;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]}>
      <meshStandardMaterial
        color={selectedPalette.colors[0]}
        emissive={selectedPalette.colors[0]}
        emissiveIntensity={1}
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.7}
      />
    </Sphere>
  );
}

export function ThreeScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <PulsingSphere />
        <ParticleTrails />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
