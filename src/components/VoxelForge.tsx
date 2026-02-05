import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Box, Loader2, Cpu, Sparkles, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Voxel {
  x: number;
  y: number;
  z: number;
  color: string;
}

const ColoredVoxels: React.FC<{ data: Voxel[]; isRebuilding: boolean }> = ({ data, isRebuilding }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Current positions for animation
  const currentPositions = useRef<THREE.Vector3[]>([]);

  useEffect(() => {
    // Initialize or reset positions
    currentPositions.current = data.map(v => new THREE.Vector3(v.x, v.y, v.z));
  }, [data.length]); // Reset only if count changes significantly

  const colors = useMemo(() => {
    const array = new Float32Array(data.length * 3);
    data.forEach((v, i) => {
      const color = new THREE.Color(v.color || "#cccccc");
      array[i * 3] = color.r;
      array[i * 3 + 1] = color.g;
      array[i * 3 + 2] = color.b;
    });
    return array;
  }, [data]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const lerpSpeed = 0.1;

    data.forEach((v, i) => {
      if (!currentPositions.current[i]) {
          currentPositions.current[i] = new THREE.Vector3(v.x, v.y, v.z);
      }

      const targetPos = new THREE.Vector3(v.x, v.y, v.z);
      currentPositions.current[i].lerp(targetPos, lerpSpeed);

      const pos = currentPositions.current[i];
      const hover = Math.sin(time * 2 + (v.x + v.z) * 0.2) * 0.05;
      
      dummy.position.set(pos.x, pos.y + hover, pos.z);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, new THREE.Color(v.color));
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, data.length]} castShadow>
      <boxGeometry args={[0.98, 0.98, 0.98]}>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </boxGeometry>
      <meshStandardMaterial vertexColors roughness={0.4} metalness={0.2} />
    </instancedMesh>
  );
};

export const VoxelForge: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mascot, setMascot] = useState<Voxel[]>([]);
  const [mode, setMode] = useState<'create' | 'morph'>('create');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'assembling' | 'ready'>('idle');

  useEffect(() => {
    const initial: Voxel[] = [];
    for(let x=-1; x<=1; x++) for(let y=0; y<=1; y++) for(let z=-1; z<=1; z++) initial.push({x,y,z, color: "#ff4d4d"});
    setMascot(initial);
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setStatus('analyzing');

    try {
        const response = await fetch('/api/forge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt, 
                currentModel: mode === 'morph' ? mascot : null,
                mode 
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Forge failed');
        
        setStatus('assembling');
        if (Array.isArray(data)) {
            setMascot(data);
        }
    } catch (error: any) {
        console.error("Forge failed:", error);
        alert(`Error: ${error.message}`);
    } finally {
        setIsGenerating(false);
        setStatus('ready');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[600px]">
      <div className="flex-1 glass-card border-white/5 bg-dark-900/40 overflow-hidden relative group min-h-[500px]">
        <div className="absolute top-6 left-6 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 text-primary p-2 rounded-lg">
                <Cpu size={20} />
            </div>
            <div>
                <h3 className="font-bold text-lg leading-tight text-white uppercase tracking-tighter">Neural Forge v1.1</h3>
                <p className="text-[10px] text-secondary font-mono tracking-widest animate-pulse">
                    {isGenerating ? `STATUS: ${status.toUpperCase()}...` : 'STATUS: READY'}
                </p>
            </div>
          </div>
        </div>

        <Canvas shadows gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[20, 20, 20]} />
          <OrbitControls enableZoom={true} autoRotate={!isGenerating} makeDefault />
          <ambientLight intensity={0.5} />
          <pointLight position={[15, 15, 15]} intensity={1.5} castShadow />
          <spotLight position={[-10, 25, 10]} angle={0.3} penumbra={1} intensity={2.5} castShadow />
          <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
            <ColoredVoxels data={mascot} isRebuilding={isGenerating} />
          </Float>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
            <planeGeometry args={[40, 40]} />
            <MeshDistortMaterial color="#050505" speed={0.5} distort={0.05} radius={1} />
          </mesh>
          <gridHelper args={[40, 20, "#222", "#111"]} position={[0, -0.49, 0]} />
        </Canvas>

        <AnimatePresence>
          {isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-20">
              <Loader2 className="text-primary animate-spin mb-6" size={60} />
              <p className="font-mono text-[10px] text-primary tracking-[0.3em] uppercase">Synthesizing {mode === 'create' ? 'New Identity' : 'Evolution'}...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="glass-card p-6 border-white/10 bg-white/5 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Box size={18} className="text-primary" />
                    <h4 className="font-bold text-sm text-white uppercase tracking-widest">Forge</h4>
                </div>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                    <button 
                        onClick={() => setMode('create')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all ${mode === 'create' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Create
                    </button>
                    <button 
                        onClick={() => setMode('morph')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all ${mode === 'morph' ? 'bg-secondary text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Morph
                    </button>
                </div>
            </div>
            
            <textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder={mode === 'create' ? "Describe a new character..." : "How should it evolve?"}
                className="w-full h-40 bg-black/60 border border-white/5 rounded-2xl p-4 text-xs text-white focus:border-primary/50 outline-none transition-all resize-none font-mono mb-4" 
            />
            
            <button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt} 
                className={`w-full py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${mode === 'create' ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/90'} text-white disabled:opacity-30`}
            >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : mode === 'create' ? <Sparkles size={14} /> : <RefreshCcw size={14} />}
                {isGenerating ? "Processing..." : mode === 'create' ? "Generate" : "Evolve Model"}
            </button>
            
            <p className="mt-4 text-[10px] text-gray-500 text-center leading-relaxed italic">
                {mode === 'create' ? "Generates a completely new model from scratch." : "Uses the current voxels as a base for the next iteration."}
            </p>
        </div>
      </div>
    </div>
  );
};
