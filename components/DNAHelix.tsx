import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

const DNAHelix: React.FC = () => {
  const helixRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (helixRef.current) {
      helixRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const spheres = [];
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 4;
    const y = (i - 10) * 0.2;
    const x1 = Math.cos(angle) * 0.5;
    const z1 = Math.sin(angle) * 0.5;
    const x2 = Math.cos(angle + Math.PI) * 0.5;
    const z2 = Math.sin(angle + Math.PI) * 0.5;
    spheres.push(
      <Sphere key={`sphere1-${i}`} position={[x1, y, z1]} args={[0.08, 16, 16]}>
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
      </Sphere>,
      <Sphere key={`sphere2-${i}`} position={[x2, y, z2]} args={[0.08, 16, 16]}>
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
      </Sphere>
    );
  }

  return <group ref={helixRef}>{spheres}</group>;
};

export default DNAHelix;
