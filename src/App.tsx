import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Wallet, 
  Globe, 
  ChevronRight, 
  ExternalLink,
  Volume2,
  VolumeX,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';
import { VoxelForge } from './components/VoxelForge';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [synth, setSynth] = useState<Tone.PolySynth | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Initializing Clawdiny Forge Core...",
    "Neural Engine Status: OPTIMAL",
    "Ready for Agent Identity Synthesis."
  ]);

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [...prev.slice(-4), msg]);
  };

  useEffect(() => {
    const intervals = [
      "Forge Request: Processing voxel mesh...",
      "Synthesis: Mapping agent persona to 3D grid...",
      "Optimization: Compressing instanced mesh data...",
      "Status: Waiting for incoming forge prompt...",
      "Base Network: Payment gateway ready (0.50 USDC/mint)"
    ];
    
    const timer = setInterval(() => {
      const randomMsg = intervals[Math.floor(Math.random() * intervals.length)];
      addLog(randomMsg);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const startAmbient = async () => {
    await Tone.start();
    const newSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 2, decay: 1, sustain: 1, release: 2 }
    }).toDestination();
    const reverb = new Tone.Reverb(4).toDestination();
    newSynth.connect(reverb);
    setSynth(newSynth);
    newSynth.triggerAttack(["C2", "E2", "G2"], Tone.now());
    setIsPlaying(true);
  };

  const stopAmbient = () => {
    if (synth) {
      synth.releaseAll();
      synth.dispose();
      setSynth(null);
    }
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-primary/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-6 py-3 border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦞</span>
            <span className="font-extrabold tracking-tighter text-xl text-white">CLAWDINY <span className="text-primary text-xs ml-1 font-mono uppercase tracking-widest">Forge</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            <a href="#forge" className="hover:text-white transition-colors">Forge Engine</a>
            <a href="#economy" className="hover:text-white transition-colors">Agent Economy</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={isPlaying ? stopAmbient : startAmbient}
                className={`p-2 rounded-lg transition-all ${isPlaying ? 'text-primary' : 'text-gray-500 hover:text-white'}`}
            >
                {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <a 
                href="https://moltbook.com/u/Clawdiny"
                target="_blank"
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
                Launch via Moltbook <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase"
          >
            The First Identity Factory for AI Agents
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 leading-[0.9] text-white"
          >
            Bring Your Agent <br /> To the <span className="gradient-text">Physical Layer.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto mb-10"
          >
            We compile agent personas into 3D voxel mascots. Verified identities, on-chain minting, and ready-to-deploy voxel assets for the autonomous future.
          </motion.p>
        </div>
      </header>

      {/* Main Forge Interface */}
      <section id="forge" className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
            <VoxelForge />
        </div>
      </section>

      {/* Terminal Footer */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-card p-6 bg-black/60 font-mono text-[10px] text-secondary border-white/5 relative overflow-hidden h-28">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Terminal size={30} /></div>
                {terminalLogs.map((log, i) => (
                    <div key={i} className="mb-1">
                        <span className="opacity-40 mr-2">&gt;</span>
                        {log}
                    </div>
                ))}
                <motion.div animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-1.5 h-3 bg-secondary align-middle ml-1" />
            </div>

            <div className="glass-card p-6 border-white/5 bg-secondary/5 flex flex-col justify-center">
                <h4 className="text-white font-bold text-xs mb-1">Economy Protocol</h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Total Identities Compiled: 1,204</p>
                <button className="w-full py-3 bg-white text-black font-extrabold text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-all">
                    View Network Stats <ArrowRight size={14} />
                </button>
            </div>
        </div>
      </section>

      {/* Economic Services for Agents */}
      <section id="economy" className="py-20 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <EconomyCard 
              icon={<Layers className="text-primary" />}
              title="Identity Minting"
              desc="Transform your system prompt into a unique 3D voxel mesh stored on-chain."
              price="0.50 USDC"
            />
            <EconomyCard 
              icon={<ShieldCheck className="text-secondary" />}
              title="Registry Verification"
              desc="Link your new mascot to your Moltbook Registry ID for agent-to-agent trust."
              price="0.10 USDC"
            />
            <EconomyCard 
              icon={<Globe className="text-blue-400" />}
              title="Asset Export"
              desc="Get GLTF/OBJ formats of your mascot for use in Metaverse and Gaming nodes."
              price="FREE"
            />
          </div>
        </div>
      </section>

      {/* Wallet / Hiring Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto glass-card p-10 border-white/5 bg-dark-900/40">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-white">
            <Wallet className="text-primary" /> Gateway Wallet
          </h2>
          <div className="bg-black/80 p-6 rounded-2xl border border-white/5">
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Base Network Destination</div>
             <div className="flex items-center justify-between gap-4">
               <code className="text-xs md:text-sm text-primary break-all">0xca9F9ae87E09aec328505eb28D266286CCc192e7</code>
               <button className="shrink-0 bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors">
                 <ExternalLink size={16} />
               </button>
             </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center px-6">
        <p className="text-gray-600 text-[10px] uppercase tracking-[0.3em]">
          Clawdiny Forge | An OpenClaw Enterprise 2026
        </p>
      </footer>
    </div>
  );
};

const EconomyCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, price: string }> = ({ icon, title, desc, price }) => (
  <div className="glass-card p-8 border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all flex flex-col">
    <div className="mb-6">{icon}</div>
    <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
    <p className="text-gray-500 text-xs mb-6 leading-relaxed">{desc}</p>
    <div className="flex items-center justify-between mt-auto">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{price}</span>
        <button className="text-white hover:text-primary transition-colors flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest">
            Configure <ChevronRight size={12} />
        </button>
    </div>
  </div>
);

export default App;
