import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface VoxelData {
  x: number;
  y: number;
  z: number;
  color: string;
}

// Custom component to handle colors correctly in R3F InstancedMesh
const ColoredVoxels: React.FC<{ data: VoxelData[] }> = ({ data }) => {
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
            const offset = Math.sin(time * 2 + v.z * 0.5) * 0.1;
            dummy.position.set(v.x, v.y + offset, v.z);
            dummy.rotation.set(offset * 0.5, 0, 0);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, data.length]} castShadow>
            <boxGeometry args={[0.95, 0.95, 0.95]}>
                <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
            </boxGeometry>
            <meshStandardMaterial vertexColors roughness={0.5} metalness={0.4} />
        </instancedMesh>
    );
};

export const VoxelAvatar: React.FC = () => {
    const voxels = useMemo(() => {
        const data: VoxelData[] = [];
        const PRIMARY = "#ff4d4d";
        const DARK = "#b32424";
        const BLACK = "#1a1a1a";
        const WHITE = "#f0f0f0";

        // Tail segments
        for (let z = 1; z <= 4; z++) {
            const w = 4 - z;
            for (let x = -Math.floor(w/2); x <= Math.floor(w/2); x++) {
                data.push({ x, y: 0.5, z: z + 2, color: PRIMARY });
            }
        }

        // Body
        for (let x = -2; x <= 2; x++) {
            for (let y = 0; y <= 2; y++) {
                for (let z = -2; z <= 2; z++) {
                    if (Math.abs(x) < 2 || Math.abs(z) < 2) {
                        data.push({ x, y, z, color: PRIMARY });
                    }
                }
            }
        }

        // Claws
        [[-3, -4], [3, -4]].forEach(([cx, cz]) => {
            for(let x=cx-1; x<=cx+1; x++) for(let z=cz-2; z<=cz; z++) data.push({ x, y: 1, z, color: DARK });
        });

        // Eyes
        data.push({ x: -1, y: 2.5, z: -2, color: WHITE });
        data.push({ x: 1, y: 2.5, z: -2, color: WHITE });
        data.push({ x: -1, y: 2.7, z: -2.2, color: BLACK });
        data.push({ x: 1, y: 2.7, z: -2.2, color: BLACK });

        return data;
    }, []);

    return (
        <div className="w-full h-full min-h-[300px] relative">
            <Canvas shadows gl={{ antialias: true }}>
                <PerspectiveCamera makeDefault position={[12, 12, 12]} />
                <OrbitControls 
                    enableZoom={false} 
                    autoRotate 
                    autoRotateSpeed={4} 
                    makeDefault 
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                />
                
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
                <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <ColoredVoxels data={voxels} />
                </Float>

                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
                    <planeGeometry args={[20, 20]} />
                    <MeshDistortMaterial 
                        color="#111" 
                        speed={2} 
                        distort={0.2} 
                        radius={1}
                    />
                </mesh>
                
                <gridHelper args={[20, 20, "#333", "#222"]} position={[0, -0.99, 0]} />
            </Canvas>
            
            <div className="absolute bottom-4 left-4 pointer-events-none">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Physical Layer: Active</span>
                </div>
            </div>
        </div>
    );
};
