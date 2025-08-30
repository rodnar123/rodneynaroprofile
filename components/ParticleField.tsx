import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const ParticleField: React.FC = () => {
  const count = 500;
  const mesh = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 2 * 7.3;
      positions[i * 3] = (Math.sin(angle * 2.1) * 0.5 + Math.cos(angle * 3.7) * 0.5) * 50;
      positions[i * 3 + 1] = (Math.sin(angle * 1.7) * 0.5 + Math.cos(angle * 2.9) * 0.5) * 50;
      positions[i * 3 + 2] = (Math.sin(angle * 3.1) * 0.5 + Math.cos(angle * 1.3) * 0.5) * 50;
      colors[i * 3] = 0.5 + Math.sin(t * Math.PI * 2) * 0.5;
      colors[i * 3 + 1] = 0.5 + Math.sin(t * Math.PI * 2 + 2) * 0.5;
      colors[i * 3 + 2] = 0.5 + Math.sin(t * Math.PI * 2 + 4) * 0.5;
    }
    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.05;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.075;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors />
    </points>
  );
};

export default ParticleField;
