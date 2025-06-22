"use client";

import React, { useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import * as THREE from 'three';
import { Canvas, useFrame,  } from '@react-three/fiber';
import { OrbitControls, Text, Environment, PerspectiveCamera, Float, MeshDistortMaterial, Sparkles, Stars, Cloud, Trail, Sphere,  MeshWobbleMaterial, shaderMaterial,  Edges } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Github, Linkedin, Facebook, ExternalLink, Mail,  MapPin, Code2, Sparkles as SparklesIcon, Layers, Terminal, Smartphone, Globe, Database, Cpu, Zap, Rocket, Shield, Star } from 'lucide-react';
import { extend } from '@react-three/fiber';

// Only register plugins on client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

// Custom shader material for holographic effect
const HolographicMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color(0.1, 0.3, 1) },
  // vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      float stripes = sin((vPosition.y - time) * 20.0);
      vec3 finalColor = mix(color, vec3(1.0, 0.0, 1.0), stripes * 0.5 + 0.5);
      gl_FragColor = vec4(finalColor, 0.7);
    }
  `
);

extend({ HolographicMaterial });

// Animated cursor component
function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    
    const moveCursor = (e: MouseEvent) => {
      if (cursor && cursorDot) {
        gsap.to(cursor, {
          x: e.clientX - 20,
          y: e.clientY - 20,
          duration: 0.5,
          ease: "power2.out"
        });
        gsap.to(cursorDot, {
          x: e.clientX - 5,
          y: e.clientY - 5,
          duration: 0.1
        });
      }
    };
    
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);
  
  if (!isClient) return null;
  
  return (
    <>
      <div ref={cursorRef} className="fixed w-10 h-10 border-2 border-blue-500 rounded-full pointer-events-none z-[100] mix-blend-difference hidden lg:block" />
      <div ref={cursorDotRef} className="fixed w-2.5 h-2.5 bg-blue-500 rounded-full pointer-events-none z-[100] hidden lg:block" />
    </>
  );
}

// Particle field background
function ParticleField() {
  const count = 500;
  const mesh = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    // Use deterministic values instead of Math.random()
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
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors />
    </points>
  );
}

// Enhanced 3D Floating Tech Sphere with trails
function TechSphere({
  position,
  color,
  scale = 1,
  tech
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  tech?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      
      // Scale animation
      const targetScale = clicked ? scale * 1.5 : hovered ? scale * 1.2 : scale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={position}>
      <Trail
        width={2}
        length={6}
        color={new THREE.Color(color)}
        attenuation={(t) => t * t}
      >
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
          <Edges color={hovered ? "#ffffff" : color} />
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
}

// DNA Helix animation
function DNAHelix() {
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
}

// Glitch text effect
function GlitchText({ children, className = "" }: { children: string; className?: string }) {
  const [glitched, setGlitched] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitched(true);
      setTimeout(() => setGlitched(false), 200);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={`relative ${className}`}>
      <span className={glitched ? "opacity-0" : ""}>{children}</span>
      {glitched && (
        <>
          <span className="absolute inset-0 text-blue-500 animate-glitch-1">{children}</span>
          <span className="absolute inset-0 text-red-500 animate-glitch-2">{children}</span>
        </>
      )}
    </div>
  );
}

// Loading screen
function LoadingScreen({ progress }: { progress: number }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: progress === 100 ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      style={{ pointerEvents: progress === 100 ? 'none' : 'all' }}
    >
      <div className="text-center">
        <div className="mb-8">
          <motion.div
            className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            RN
          </motion.div>
        </div>
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-4 text-gray-400">{progress}%</p>
      </div>
    </motion.div>
  );
}

// Profile Image Component with fallback


// Main Portfolio Component
export default function Portfolio3D() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const projectsRef = useRef(null);
  const [activeSection, setActiveSection] = useState('home');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0.3]);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Enhanced projects data
  const projects = [
    {
      id: 1,
      title: "Rodney Naro Portfolio",
      description: "Personal portfolio website built with modern web technologies",
      tech: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Three.js"],
      github: "https://github.com/rodnar123/rodneynaroportfolio",
      color: "#3b82f6",
      icon: Globe,
      stats: { stars: 42, forks: 12, issues: 3 }
    },
    {
      id: 2,
      title: "Expo React Native CRUD App",
      description: "Full-stack mobile application with CRUD operations",
      tech: ["TypeScript", "React Native", "Expo", "MongoDB", "Node.js"],
      github: "https://github.com/rodnar123/exporeactnativecrudapp",
      color: "#10b981",
      icon: Smartphone,
      stats: { stars: 28, forks: 8, issues: 1 }
    },
    {
      id: 3,
      title: "Lukim Sepik",
      description: "Location-based application for the Sepik region",
      tech: ["TypeScript", "React", "Mapbox", "Geolocation API", "PWA"],
      github: "https://github.com/rodnar123/Lukim_Sepik",
      color: "#f59e0b",
      icon: MapPin,
      stats: { stars: 35, forks: 15, issues: 5 }
    },
    {
      id: 4,
      title: "3ran Fintech",
      description: "Financial technology platform with modern architecture",
      tech: ["TypeScript", "React", "GraphQL", "Stripe API", "PostgreSQL"],
      github: "https://github.com/rodnar123/3ranFintect",
      color: "#8b5cf6",
      icon: Shield,
      stats: { stars: 56, forks: 23, issues: 7 }
    },
    {
      id: 5,
      title: "Room Scheduling System",
      description: "Intelligent room booking and scheduling application",
      tech: ["TypeScript", "React", "Socket.io", "Redis", "Docker"],
      github: "https://github.com/rodnar123/roomscheduling",
      color: "#ef4444",
      icon: Cpu,
      stats: { stars: 31, forks: 11, issues: 2 }
    },
    {
      id: 6,
      title: "3ran Landing Page",
      description: "Company landing page template using React",
      tech: ["JavaScript", "React", "GSAP", "Framer Motion", "SEO"],
      github: "https://github.com/rodnar123/3ranlandingpage",
      color: "#06b6d4",
      icon: Rocket,
      stats: { stars: 22, forks: 9, issues: 0 }
    }
  ];

  const techStack = [
    { name: "TypeScript", icon: Code2, level: 90, color: "#3178c6", description: "Type-safe JavaScript" },
    { name: "React/Next.js", icon: Layers, level: 95, color: "#61dafb", description: "Modern web frameworks" },
    { name: "React Native", icon: Smartphone, level: 85, color: "#61dafb", description: "Cross-platform mobile" },
    { name: "Node.js", icon: Terminal, level: 80, color: "#339933", description: "Backend runtime" },
    { name: "Tailwind CSS", icon: SparklesIcon, level: 90, color: "#06b6d4", description: "Utility-first CSS" },
    { name: "Three.js/WebGL", icon: Globe, level: 75, color: "#000000", description: "3D graphics" },
    { name: "PostgreSQL", icon: Database, level: 80, color: "#4169e1", description: "Relational database" }
  ];

  useEffect(() => {
    setMounted(true);
    
    // Simulate loading
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // GSAP animations - only run on client
    if (typeof window !== 'undefined' && containerRef.current) {
      const ctx = gsap.context(() => {
        // Text scramble effect
        gsap.to(".scramble-text", {
          duration: 2,
          text: "Freebie Techie! Coding as a search!",
          ease: "none",
          delay: 1
        });

        // Hero section animations
        gsap.from(".hero-title", {
          y: 100,
          opacity: 0,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.1,
          delay: 0.5
        });

        gsap.from(".hero-subtitle", {
          y: 50,
          opacity: 0,
          duration: 1,
          delay: 1,
          ease: "power3.out"
        });

        // Floating animation for 3D canvas
        gsap.to(".canvas-container", {
          y: -30,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut"
        });

        // Project cards animation with stagger
        ScrollTrigger.batch(".project-card", {
          onEnter: (elements) => {
            gsap.from(elements, {
              y: 100,
              opacity: 0,
              duration: 1,
              stagger: 0.15,
              ease: "power3.out",
              overwrite: true
            });
          },
          once: true,
          start: "top 85%"
        });

        // Tech stack animation with wave effect
        gsap.from(".tech-item", {
          scrollTrigger: {
            trigger: ".tech-section",
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          x: -100,
          opacity: 0,
          duration: 0.8,
          stagger: {
            each: 0.1,
            from: "start"
          },
          ease: "power3.out"
        });

        // Progress bars animation
        gsap.to(".progress-bar", {
          scrollTrigger: {
            trigger: ".tech-section",
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          width: (i, el) => el.getAttribute("data-width"),
          duration: 2,
          ease: "power2.out",
          stagger: 0.1
        });

        // Parallax effect on scroll
        gsap.to(".parallax-bg", {
          scrollTrigger: {
            scrub: true
          },
          y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
          ease: "none"
        });
      }, containerRef);

      return () => {
        ctx.revert();
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [mouseX, mouseY]);

  // Generate deterministic particle positions
  const particlePositions = useMemo(() => {
    return [...Array(100)].map((_, i) => ({
      left: `${(i * 7.3) % 100}%`,
      top: `${(i * 13.7) % 100}%`,
      duration: 5 + (i % 10),
      delay: i * 0.05
    }));
  }, []);

  return (
    <>
      {mounted && <LoadingScreen progress={loadingProgress} />}
      {mounted && <CustomCursor />}
      
      <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-x-hidden">
        {mounted && (
          <style jsx global>{`
            @keyframes glitch-1 {
              0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
              20% { clip-path: inset(0 100% 0 0); transform: translate(-2px); }
              40% { clip-path: inset(0 0 0 100%); transform: translate(2px); }
              60% { clip-path: inset(100% 0 0 0); transform: translate(-1px); }
              80% { clip-path: inset(0 0 100% 0); transform: translate(1px); }
            }
            
            @keyframes glitch-2 {
              0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
              20% { clip-path: inset(0 0 100% 0); transform: translate(2px); }
              40% { clip-path: inset(100% 0 0 0); transform: translate(-2px); }
              60% { clip-path: inset(0 100% 0 0); transform: translate(1px); }
              80% { clip-path: inset(0 0 0 100%); transform: translate(-1px); }
            }
            
            .animate-glitch-1 { animation: glitch-1 0.3s linear; }
            .animate-glitch-2 { animation: glitch-2 0.3s linear; }
          `}</style>
        )}

        {/* Enhanced Navigation */}
        <motion.nav 
          className="fixed top-0 w-full z-50 bg-gray-900/20 backdrop-blur-xl border-b border-gray-800/50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.a
                href="#home"
                className="flex items-center gap-2 text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.img
                  src="/images/profile.jpg" // Replace with your image path or URL
                  alt="Rodney Naro"
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  onError={(e) => {
                    e.currentTarget.src = '/images/fallback-profile.jpg'; // Fallback image path
                  }}
                />
                <GlitchText className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  RN
                </GlitchText>
              </motion.a>
            </motion.div>
            <div className="flex gap-8">
              {['Home', 'Projects', 'Skills', 'Contact'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="relative hover:text-blue-400 transition-colors font-medium"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                  onClick={() => setActiveSection(item.toLowerCase())}
                >
                  {item}
                  {activeSection === item.toLowerCase() && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600"
                      layoutId="navbar-indicator"
                    />
                  )}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.nav>

        {/* Hero Section with Enhanced 3D */}
        <section
          id="home"
          ref={heroRef}
          className="min-h-screen flex items-center justify-center relative px-2 sm:px-4"
        >
          {/* Animated background layers */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="parallax-bg absolute inset-0" data-speed="0.5">
              <div className="absolute top-10 left-2 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-10 right-2 w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
          </div>

          <div className="container mx-auto px-2 sm:px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
            <motion.div style={{ y, opacity }} className="space-y-6 w-full">
              <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
              >
          <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold flex items-center gap-3 flex-wrap">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Rodney Naro
            </span>
            <motion.img
              src="/images/profile.jpg"
              alt="Rodney Naro"
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-full object-cover border-2 md:border-3 border-blue-400 shadow-lg shadow-blue-400/50"
              whileHover={{
                scale: 1.1,
                rotate: 360,
                borderColor: "#a855f7"
              }}
              transition={{ duration: 0.5 }}
            />
          </h1>
              </motion.div>

              <p className="hero-subtitle text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300">
          <span className="scramble-text">{mounted ? "" : "Freebie Techie! Coding as a search!"}</span>
              </p>

              <motion.p
          className="text-gray-400 text-sm sm:text-base md:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
              >
          Full-Stack Developer specializing in TypeScript, React, and React Native.
          Building innovative solutions from PNG Unitech.
              </motion.p>

              <motion.div
          className="flex flex-wrap gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
              >
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group relative overflow-hidden"
            size="lg"
          >
            <span className="relative z-10 flex items-center">
              <Github className="mr-2 h-5 w-5" />
              <a href="https://github.com/rodnar123" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group relative overflow-hidden"
            size="lg"
          >
            <span className="relative z-10 flex items-center">
              <Linkedin className="mr-2 h-5 w-5" />
              <a href="https://www.linkedin.com/in/rodney-naro-74378062/" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group relative overflow-hidden"
            size="lg"
          >
            <span className="relative z-10 flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              <a href="https://www.facebook.com/rodney.naro.965" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
          className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pt-6 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
              >
          {[
            { label: "Projects", value: "6+", icon: Rocket },
            { label: "Technologies", value: "15+", icon: Cpu },
            { label: "Experience", value: "5 Years", icon: Zap }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="text-center p-3 sm:p-4 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50 flex flex-col items-center min-w-0"
              whileHover={{ scale: 1.05, borderColor: 'rgb(59 130 246 / 0.5)' }}
            >
              <stat.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mx-auto mb-2 text-blue-400" />
              <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
              </motion.div>
            </motion.div>

            {mounted && (
              <div className="canvas-container h-[220px] xs:h-[280px] sm:h-[320px] md:h-[400px] lg:h-[500px] xl:h-[600px] relative w-full">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.5} />

            <Suspense fallback={null}>
              <Environment preset="city" />
              <OrbitControls
                enableZoom={false}
                autoRotate
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 2}
              />

              {/* Background effects */}
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
              <Cloud opacity={0.1} speed={0.4} />

              {/* Particle field */}
              <ParticleField />

              {/* Tech spheres with labels */}
              <TechSphere position={[2.5, 1, 0]} color="#3178c6" tech="TypeScript" />
              <TechSphere position={[-2.5, -1, 0]} color="#61dafb" tech="React" />
              <TechSphere position={[0, 2.5, -1]} color="#06b6d4" tech="Tailwind" />
              <TechSphere position={[1.5, -2, 1]} color="#339933" tech="Node.js" />
              <TechSphere position={[-1.5, 0.5, 0.5]} color="#8b5cf6" tech="Three.js" scale={0.8} />
              <TechSphere position={[2, -0.5, -1.5]} color="#f59e0b" tech="GSAP" scale={0.7} />

              {/* Central DNA Helix */}
              <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
                <DNAHelix />
              </Float>

              {/* Main torusKnot with enhanced materials */}
              <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
                <mesh>
            <torusKnotGeometry args={[1, 0.3, 128, 16]} />
            <MeshDistortMaterial
              color="#3b82f6"
              speed={2}
              distort={0.4}
              radius={1}
              metalness={0.9}
              roughness={0.1}
              emissive="#1e40af"
              emissiveIntensity={0.5}
            />
                </mesh>
              </Float>

              {/* Post-processing effects */}
              <EffectComposer>
                <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
                <ChromaticAberration offset={[0.0005, 0.0005]} />
                <Vignette eskil={false} offset={0.1} darkness={0.5} />
              </EffectComposer>
            </Suspense>
          </Canvas>

          {/* 3D scene overlay text */}
          <motion.div
            className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
          >
            <p className="text-xs sm:text-sm text-gray-400">
              <SparklesIcon className="inline-block w-4 h-4 mr-1" />
              Interactive 3D Experience • Click & Drag to Explore
            </p>
          </motion.div>
              </div>
            )}
          </div>

          {/* Animated particles background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            {mounted &&
              particlePositions.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
              ))}
          </div>
        </section>

        {/* Projects Section with Enhanced Cards */}
        <section id="projects" ref={projectsRef} className="py-20 projects-section relative">
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-4xl lg:text-5xl xl:text-6xl font-bold text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <GlitchText className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Featured Projects
              </GlitchText>
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="project-card group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="bg-gray-800/30 backdrop-blur-xl border-gray-700/50 h-full hover:border-blue-500/50 transition-all duration-500 overflow-hidden relative">
                    {/* Animated gradient background */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${project.color}40, transparent 50%)`
                      }}
                    />
                    
                    {/* Top gradient bar */}
                    <div className="h-1 relative overflow-hidden">
                      <motion.div
                        className="h-full"
                        style={{ backgroundColor: project.color }}
                        initial={{ x: '-100%' }}
                        whileInView={{ x: 0 }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                    
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <project.icon className="h-8 w-8" style={{ color: project.color }} />
                        <div className="flex gap-2">
                          {/* GitHub stars */}
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Star className="h-3 w-3" />
                            {project.stats.stars}
                          </span>
                        </div>
                      </div>
                      
                      <CardTitle className="text-xl text-white flex items-center justify-between group">
                        <span className="group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 group-hover:bg-clip-text transition-all duration-300">
                          {project.title}
                        </span>
                        <a href={project.github} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-5 w-5 text-gray-400 hover:text-white transition-all duration-300 group-hover:rotate-45" />
                        </a>
                      </CardTitle>
                      
                      <CardDescription className="text-gray-400 mt-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech.map((tech, techIndex) => (
                          <motion.div
                            key={tech}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 + techIndex * 0.05 }}
                          >
                            <Badge 
                              variant="secondary" 
                              className="bg-gray-700/50 text-gray-300 border border-gray-600/50 hover:border-blue-500/50 transition-all duration-300"
                            >
                              {tech}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Project stats */}
                      <div className="flex justify-between text-xs text-gray-500 pt-4 border-t border-gray-700/50">
                        <span>{project.stats.forks} forks</span>
                        <span>{project.stats.issues} open issues</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Section with 3D visualization */}
        <section id="skills" className="py-20 tech-section relative overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-4xl lg:text-5xl xl:text-6xl font-bold text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Tech Stack & Skills
              </span>
            </motion.h2>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {techStack.map((tech, index) => (
                  <motion.div
                    key={tech.name}
                    className="tech-item group"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 10 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 group-hover:border-blue-500/50 transition-all duration-300"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <tech.icon className="h-6 w-6" style={{ color: tech.color }} />
                        </motion.div>
                        <div>
                          <span className="font-semibold text-lg">{tech.name}</span>
                          <p className="text-sm text-gray-400">{tech.description}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        {tech.level}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                      <motion.div
                        className="progress-bar h-full rounded-full relative overflow-hidden"
                        data-width={`${tech.level}%`}
                        style={{ 
                          width: '0%',
                          background: `linear-gradient(90deg, ${tech.color}80, ${tech.color})`
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-white/20"
                          animate={{ x: ['0%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          style={{ width: '50%' }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {mounted && (
                <div className="h-[400px] lg:h-[500px] xl:h-[600px]">
                  <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={0.5} />
                    
                    <Suspense fallback={null}>
                      <OrbitControls 
                        enableZoom={false} 
                        autoRotate 
                        autoRotateSpeed={1}
                        enablePan={false}
                      />
                      
                      <Sparkles count={200} scale={10} size={2} speed={0.5} />
                      
                      {/* 3D skill visualization */}
                      {techStack.map((tech, index) => {
                        const angle = (index / techStack.length) * Math.PI * 2;
                        const radius = 3;
                        const x = Math.cos(angle) * radius;
                        const z = Math.sin(angle) * radius;
                        
                        return (
                          <Float
                            key={tech.name}
                            speed={1.5}
                            rotationIntensity={0.5}
                            floatIntensity={0.5}
                          >
                            <group position={[x, 0, z]}>
                              <mesh>
                                <boxGeometry args={[1, 1, 1]} />
                                <meshStandardMaterial 
                                  color={tech.color} 
                                  metalness={0.7} 
                                  roughness={0.2}
                                  emissive={tech.color}
                                  emissiveIntensity={0.3}
                                />
                                <Edges color="white" />
                              </mesh>
                              <Text
                                position={[0, 1.5, 0]}
                                fontSize={0.3}
                                color="white"
                                anchorX="center"
                                anchorY="middle"
                              >
                                {tech.name.split('/')[0]}
                              </Text>
                            </group>
                          </Float>
                        );
                      })}
                      
                      {/* Central animated sphere */}
                      <group>
                        <mesh>
                          <sphereGeometry args={[1.5, 64, 64]} />
                          <MeshWobbleMaterial
                            color="#8b5cf6"
                            speed={2}
                            factor={0.3}
                            metalness={0.9}
                            roughness={0.1}
                            emissive="#8b5cf6"
                            emissiveIntensity={0.5}
                          />
                        </mesh>
                        <mesh scale={1.1}>
                          <sphereGeometry args={[1.5, 32, 32]} />
                          <meshBasicMaterial color="#8b5cf6" wireframe opacity={0.3} transparent />
                        </mesh>
                      </group>
                      
                      {/* Post-processing */}
                      <EffectComposer>
                        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} />
                        <Noise opacity={0.02} />
                      </EffectComposer>
                    </Suspense>
                  </Canvas>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Section with animations */}
        <section id="contact" className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-4xl lg:text-5xl xl:text-6xl font-bold text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-pink-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
                Get In Touch
              </span>
            </motion.h2>

            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border-gray-700/50 overflow-hidden relative">
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    background: [
                      'radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 100%, #8b5cf6 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 100%, #ef4444 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 0%, #10b981 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)',
                    ]
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                />
                
                <CardContent className="p-8 lg:p-12 relative">
                  <div className="grid md:grid-cols-2 gap-12">
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-3xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Let&apos;s Build Something Amazing
                      </h3>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        I&apos;m always excited about new challenges and opportunities to create innovative solutions. 
                        Whether you have a project in mind or just want to connect, I&apos;d love to hear from you!
                      </p>
                      
                      <div className="space-y-4">
                        <motion.div 
                          className="flex items-center gap-4 text-gray-300 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300"
                          whileHover={{ x: 10, borderColor: 'rgb(59 130 246 / 0.5)' }}
                        >
                          <MapPin className="h-6 w-6 text-blue-400" />
                          <div>
                            <p className="font-semibold">Location</p>
                            <p className="text-sm text-gray-400">PNG Unitech, Papua New Guinea</p>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="flex items-center gap-4 text-gray-300 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
                          whileHover={{ x: 10, borderColor: 'rgb(139 92 246 / 0.5)' }}
                        >
                          <Mail className="h-6 w-6 text-purple-400" />
                          <div>
                            <p className="font-semibold">Email</p>
                            <p className="text-sm text-gray-400">rodney.naro@gmail.com</p>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="flex items-center gap-4 text-gray-300 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
                          whileHover={{ x: 10, borderColor: 'rgb(16 185 129 / 0.5)' }}
                        >
                          <Zap className="h-6 w-6 text-green-400" />
                          <div>
                            <p className="font-semibold">Availability</p>
                            <p className="text-sm text-gray-400">Open for opportunities</p>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-2xl font-semibold mb-6">Connect on Social</h3>
                      <div className="grid grid-cols-1 gap-3">
                        <Button 
                          className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group" 
                          size="lg"
                          onClick={() => window.open('https://github.com/rodnar123', '_blank')}
                        >
                          <Github className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                          View GitHub Projects
                          <ExternalLink className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100" />
                        </Button>
                        
                        <Button 
                          className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-blue-400/50 transition-all duration-300 group" 
                          size="lg"
                          onClick={() => window.open('https://www.linkedin.com/in/rodney-naro-74378062/', '_blank')}
                        >
                          <Linkedin className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                          Connect on LinkedIn
                          <ExternalLink className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100" />
                        </Button>
                        
                        <Button 
                          className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 group" 
                          size="lg"
                          onClick={() => window.open('https://www.facebook.com/rodney.naro.965', '_blank')}
                        >
                          <Facebook className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                          Follow on Facebook
                          <ExternalLink className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100" />
                        </Button>
                        
                        <div className="relative mt-6">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-700/50" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-gray-900 px-2 text-gray-400">Or</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group relative overflow-hidden" 
                          size="lg"
                          onClick={() => window.location.href = 'mailto:rodney.naro@gmail.com'}
                        >
                          <span className="relative z-10 flex items-center justify-center w-full">
                            <Mail className="mr-3 h-5 w-5" />
                            Send Direct Email
                            <Rocket className="ml-3 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </span>
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: 0 }}
                            transition={{ duration: 0.5 }}
                          />
                        </Button>
                      </div>
                      
                      {/* Social proof */}
                      <motion.div 
                        className="mt-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                          <Shield className="h-4 w-4 text-green-400" />
                          <span>Usually responds within 24 hours</span>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Footer with animations */}
        <footer className="py-12 border-t border-gray-800/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent" />
          <div className="container mx-auto px-4 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-400 mb-4">
                © 2025 Rodney Naro. Crafted with passion using Next.js, Three.js, GSAP & Framer Motion
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Cpu className="h-4 w-4" />
                  High Performance
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Secure
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Lightning Fast
                </span>
              </div>
            </motion.div>
          </div>
        </footer>
      </div>
    </>
  );
}