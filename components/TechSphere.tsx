import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Trail, MeshDistortMaterial, Edges, Text } from '@react-three/drei';

interface TechSphereProps {
  position: [number, number, number];
  color: string;
  scale?: number;
  tech?: string;
}

const TechSphere: React.FC<TechSphereProps> = ({ position, color, scale = 1, tech }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      const targetScale = clicked ? scale * 1.5 : hovered ? scale * 1.2 : scale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={position}>
      <Trail width={2} length={6} color={new THREE.Color(color)} attenuation={(t) => t * t}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => setClicked(!clicked)}
        >
          <dodecahedronGeometry args={[0.5, 0]} />
          <MeshDistortMaterial
            color={color}
            speed={2}
            distort={0.3}
            radius={1}
            emissive={color}
            emissiveIntensity={hovered ? 0.8 : 0.3}
            metalness={0.8}
            roughness={0.2}
          />
          <Edges color={hovered ? '#ffffff' : color} />
        </mesh>
      </Trail>
      {tech && hovered && (
        <Text
          position={[0, 1, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {tech}
        </Text>
      )}
    </group>
  );
};

export default TechSphere;
