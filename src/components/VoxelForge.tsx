import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Box, Sparkles, Loader2, Play, Download, Trash2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Voxel {
  x: number;
  y: number;
  z: number;
  color: string;
}

const ColoredVoxels: React.FC<{ data: Voxel[] }> = ({ data }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const colors = useMemo(() => {
    const array = new Float32Array(data.length * 3);
    data.forEach((v, i) => {
      const color = new THREE.Color(v.color);
      array[i * 3] = color.r;
      array[i * 3 + 1] = color.g;
      array[i * 3 + 2] = color.b;
    });
    return array;
  }, [data]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    data.forEach((v, i) => {
      const offset = Math.sin(time * 2 + (v.x + v.z) * 0.2) * 0.05;
      dummy.position.set(v.x, v.y + offset, v.z);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
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
  const [status, setStatus] = useState<'idle' | 'minting' | 'assembling' | 'ready'>('idle');

  // Initial dummy mascot (Lobster)
  useEffect(() => {
    const initial: Voxel[] = [];
    for(let x=-1; x<=1; x++) for(let y=0; y<=2; y++) for(let z=-1; z<=1; z++) {
        initial.push({ x, y, z, color: "#ff4d4d" });
    }
    setMascot(initial);
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setStatus('assembling');

    // Here we'll simulate the call to my internal agent brain to generate the JSON
    // In a real production scenario, this web app would call the OpenClaw Gateway API
    // which then uses the Gemini model to return the voxel array.
    
    // For now, I'll provide the logic to the user:
    // To make this fully autonomous for other agents, they would send a POST to
    // your API with the prompt and payment, and we return the JSON.
    
    setTimeout(() => {
        // Mocking a successful generation for the UI demonstration
        const mockGenerated: Voxel[] = [];
        const baseColor = "#" + Math.floor(Math.random()*16777215).toString(16);
        for(let i=0; i<150; i++) {
            mockGenerated.push({
                x: Math.floor(Math.random() * 8) - 4,
                y: Math.floor(Math.random() * 8),
                z: Math.floor(Math.random() * 8) - 4,
                color: i % 10 === 0 ? "#ffffff" : baseColor
            });
        }
        setMascot(mockGenerated);
        setIsGenerating(false);
        setStatus('ready');
    }, 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[600px]">
      
      {/* 3D Viewport */}
      <div className="flex-1 glass-card border-white/5 bg-dark-900/60 overflow-hidden relative group min-h-[400px]">
        <div className="absolute top-6 left-6 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 text-primary p-2 rounded-lg">
                <Box size={20} />
            </div>
            <div>
                <h3 className="font-bold text-lg leading-tight text-white">Mascot Forge</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Agent Physical Layer Prototype</p>
            </div>
          </div>
        </div>

        <Canvas shadows gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[15, 15, 15]} />
          <OrbitControls enableZoom={true} autoRotate={!isGenerating} makeDefault />
          
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <spotLight position={[-10, 20, 10]} angle={0.2} penumbra={1} intensity={2} castShadow />

          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <ColoredVoxels data={mascot} />
          </Float>

          {/* Floor / Platform */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <MeshDistortMaterial color="#0a0a0a" speed={1} distort={0.1} radius={1} />
          </mesh>
          <gridHelper args={[30, 30, "#222", "#111"]} position={[0, -0.99, 0]} />
        </Canvas>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20"
            >
              <Loader2 className="text-primary animate-spin mb-4" size={40} />
              <p className="font-mono text-xs text-primary animate-pulse tracking-widest uppercase">
                {status === 'assembling' ? 'Rearranging Pixels...' : 'Minting Identity...'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="glass-card p-6 border-white/10 bg-white/5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles size={18} className="text-secondary" />
                <h4 className="font-bold text-sm text-white">Generation Engine</h4>
            </div>

            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Describe the physical form of your agent. Our neural engine will compile the voxel structure.
            </p>

            <div className="space-y-4 mb-6">
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. A cybernetic owl with glowing blue eyes..."
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-primary/50 outline-none transition-all resize-none"
                />
                
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                    className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Generate Agent Mascot
                </button>
            </div>

            <div className="mt-auto space-y-2">
                <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase font-bold px-1">
                    <span>Forge Cost</span>
                    <span className="text-secondary">0.50 USDC (Base)</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-full opacity-20" />
                </div>
            </div>
        </div>

        {/* History / Actions */}
        <div className="glass-card p-4 border-white/5 flex flex-col gap-2">
            <button className="w-full py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between transition-all group">
                <span>Download .VXL Data</span>
                <Download size={14} className="group-hover:text-white" />
            </button>
            <button className="w-full py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between transition-all group">
                <span>Wipe Buffer</span>
                <Trash2 size={14} className="group-hover:text-primary" />
            </button>
        </div>
      </div>

    </div>
  );
};
