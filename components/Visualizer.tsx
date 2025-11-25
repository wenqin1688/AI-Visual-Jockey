
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createNoise3D } from 'simplex-noise';
import { audioController } from '../services/AudioController';
import { ShapeType, SentimentData } from '../types';

interface VisualizerProps {
  isPlaying: boolean;
  shapeType: ShapeType;
  setFps: (fps: number) => void;
  particleSize: number;
  imageSrc: string | null;
  isAutoRotate: boolean;
  sentiment: SentimentData | null;
  manualColor: string | null;
  setEnergyMood: (mood: string) => void;
  coreShapeIndex: number;
  effectIndex: number;
}

const PARTICLE_COUNT = 100000;
const CORE_COUNT = 25000; // High density for the core object

const Visualizer: React.FC<VisualizerProps> = ({ 
  isPlaying, 
  shapeType, 
  setFps, 
  particleSize, 
  imageSrc, 
  isAutoRotate,
  sentiment,
  manualColor,
  setEnergyMood,
  coreShapeIndex,
  effectIndex
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);
  
  const frameIdRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const noise3D = useRef(createNoise3D()).current;

  const shapeIndexRef = useRef<number>(0);
  const effectIndexRef = useRef<number>(0);
  const currentBaseColorRef = useRef<[number, number, number]>([0.05, 0.5, 1.0]); 
  const currentPositionsRef = useRef<Float32Array | null>(null);  
  const mouseRef = useRef<{x: number, y: number}>({ x: 0, y: 0 });

  // Handle Mouse Interaction for bending visuals
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keyboard Interaction (Arrow Keys for Zoom)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!cameraRef.current) return;
        const speed = 20;
        if (e.key === 'ArrowUp') cameraRef.current.position.z -= speed;
        if (e.key === 'ArrowDown') cameraRef.current.position.z += speed;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync props to refs for animation loop
  useEffect(() => {
    shapeIndexRef.current = coreShapeIndex;
    effectIndexRef.current = effectIndex;
  }, [coreShapeIndex, effectIndex]);

  // --- VJ MATHEMATICS ENGINE ---
  // Calculates the target position for a particle based on the active Shape Index
  const getTargetCorePoint = (idx: number, shapeIndex: number): {x:number, y:number, z:number} => {
      const i = idx / CORE_COUNT; // Normalized index 0 to 1
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 250; 

      let x=0, y=0, z=0;

      switch(shapeIndex) {
        case 0: // HYPER TORNADO (Funnel Structure)
            {
                // h goes from -600 to +600
                const h = (v - 0.5) * 1200; 
                // Radius is wider at top (positive h) and bottom, narrower in middle? 
                // Or standard funnel: narrow bottom, wide top.
                // Let's do wide top, narrow bottom.
                const normalizedH = (h + 600) / 1200; // 0 to 1
                const rad = 20 + Math.pow(normalizedH, 1.5) * 600;
                
                // Spiral windings
                const spiral = normalizedH * 20 * Math.PI + u * Math.PI * 2;
                
                x = rad * Math.cos(spiral);
                z = rad * Math.sin(spiral);
                y = h;
            }
            break;
        case 1: // QUANTUM CUBE (Grid)
            {
                const dim = Math.cbrt(CORE_COUNT);
                const ix = idx % dim;
                const iy = Math.floor(idx / dim) % dim;
                const iz = Math.floor(idx / (dim * dim));
                const spacing = 500 / dim;
                x = (ix - dim/2) * spacing;
                y = (iy - dim/2) * spacing;
                z = (iz - dim/2) * spacing;
            }
            break;
        case 2: // NEURAL SPHERE (Spiky)
            {
               const nr = r * (1 + Math.random() * 0.5);
               x = nr * Math.sin(phi) * Math.cos(theta);
               y = nr * Math.sin(phi) * Math.sin(theta);
               z = nr * Math.cos(phi);
            }
            break;
        case 3: // CYBER HEART
            {
                const ht = u * 2 * Math.PI;
                const hp = v * Math.PI;
                // Parametric heart formula
                x = 16 * Math.pow(Math.sin(hp), 3) * Math.sin(ht) * 15;
                y = 13 * Math.cos(hp) - 5*Math.cos(2*hp) - 2*Math.cos(3*hp) - Math.cos(4*hp);
                y *= -15;
                z = 16 * Math.pow(Math.sin(hp), 3) * Math.cos(ht) * 15;
            }
            break;
        case 4: // DNA HELIX
            {
                const h = (i - 0.5) * 800;
                const rot = i * 20 * Math.PI;
                // Two strands
                const strand = idx % 2 === 0 ? 0 : Math.PI;
                const width = 100;
                x = width * Math.cos(rot + strand);
                z = width * Math.sin(rot + strand);
                y = h;
                // Add some volume
                x += (Math.random()-0.5)*20;
                z += (Math.random()-0.5)*20;
            }
            break;
        case 5: // VOID RING (Torus)
            {
                const R = 350; const tube = 80;
                const t1 = u * Math.PI * 2;
                const t2 = v * Math.PI * 2;
                x = (R + tube * Math.cos(t2)) * Math.cos(t1);
                z = (R + tube * Math.cos(t2)) * Math.sin(t1);
                y = tube * Math.sin(t2);
            }
            break;
        case 6: // PYRAMID GATE
            {
                const level = 1 - Math.sqrt(v);
                const h = (v - 0.5) * 600;
                const size = level * 500;
                // Square layers
                if (Math.random() > 0.5) {
                   x = (Math.random()-0.5) * size;
                   z = (Math.random() > 0.5 ? 0.5 : -0.5) * size;
                } else {
                   x = (Math.random() > 0.5 ? 0.5 : -0.5) * size;
                   z = (Math.random()-0.5) * size;
                }
                y = -h;
            }
            break;
        case 7: // INFINITY LOOP
            {
                const t = i * Math.PI * 4; 
                const scale = 180;
                x = scale * Math.cos(t);
                y = scale * Math.sin(2*t) / 2;
                z = scale * Math.sin(t);
                x += (Math.random()-0.5)*50;
                y += (Math.random()-0.5)*50;
                z += (Math.random()-0.5)*50;
            }
            break;
        case 8: // STAR CLUSTER
            {
                // Dense center, diffuse edges
                const sr = Math.random() * 500 * Math.pow(Math.random(), 3); 
                x = sr * Math.sin(phi) * Math.cos(theta);
                y = sr * Math.sin(phi) * Math.sin(theta);
                z = sr * Math.cos(phi);
            }
            break;
        case 9: // DIGITAL RAIN
            {
                const col = Math.floor(Math.random() * 20);
                const row = Math.floor(Math.random() * 20);
                x = (col - 10) * 50;
                z = (row - 10) * 50;
                y = (Math.random() - 0.5) * 1000;
            }
            break;
        case 10: // ATOM CORE
            {
                 const orbit = idx % 3;
                 const ang = u * Math.PI * 2;
                 const rad = 350;
                 if (orbit === 0) { x=rad*Math.cos(ang); y=rad*Math.sin(ang); z=(Math.random()-0.5)*20; }
                 if (orbit === 1) { x=rad*Math.cos(ang); z=rad*Math.sin(ang); y=(Math.random()-0.5)*20; }
                 if (orbit === 2) { y=rad*Math.cos(ang); z=rad*Math.sin(ang); x=(Math.random()-0.5)*20; }
                 if (i < 0.2) { x=(Math.random()-0.5)*150; y=(Math.random()-0.5)*150; z=(Math.random()-0.5)*150; }
            }
            break;
        case 11: // GRID PLAINS
            {
                const size = 1000;
                x = (Math.random()-0.5)*size;
                z = (Math.random()-0.5)*size;
                // Undulating terrain
                y = Math.sin(x/80) * Math.cos(z/80) * 80;
            }
            break;
        case 12: // SATURN RINGS
            {
                 if (i < 0.25) { 
                    x = r * 0.7 * Math.sin(phi) * Math.cos(theta);
                    y = r * 0.7 * Math.sin(phi) * Math.sin(theta);
                    z = r * 0.7 * Math.cos(phi);
                 } else { 
                    const ringR = 400 + Math.random() * 200;
                    x = ringR * Math.cos(theta);
                    z = ringR * Math.sin(theta);
                    y = (Math.random()-0.5) * 15;
                 }
            }
            break;
        case 13: // DATA SPIKE
            {
                // Tall central spike
                const taper = Math.random();
                x = (Math.random()-0.5)*60 * taper;
                z = (Math.random()-0.5)*60 * taper;
                y = (Math.random()-0.5)*1200; 
            }
            break;
        case 14: // CROSS FIRE
            {
                if (idx % 3 === 0) { x=(Math.random()-0.5)*1000; y=0; z=0; }
                else if (idx % 3 === 1) { y=(Math.random()-0.5)*1000; x=0; z=0; }
                else { z=(Math.random()-0.5)*1000; x=0; y=0; }
            }
            break;
        case 15: // FLUID WAVE
            {
                 x = (u - 0.5) * 1000;
                 z = (v - 0.5) * 1000;
                 y = Math.sin(x * 0.015) * 150 + Math.cos(z * 0.015) * 150;
            }
            break;
        case 16: // CRYSTAL SHARD
            {
                x = (Math.random()-0.5) * 250;
                z = (Math.random()-0.5) * 250;
                y = (Math.random()-0.5) * 700;
                // Faceted look
                if (Math.abs(y) > 250) { x *= 0.1; z *= 0.1; } 
            }
            break;
        case 17: // WARP TUNNEL
            {
                const tr = 150 + v * 500;
                x = tr * Math.cos(theta);
                y = tr * Math.sin(theta);
                z = (u - 0.5) * 2500;
            }
            break;
        case 18: // CHAOS FIELD
            {
                x = (Math.random()-0.5) * 800;
                y = (Math.random()-0.5) * 800;
                z = (Math.random()-0.5) * 800;
            }
            break;
        case 19: // SINGULARITY
            {
                const sr = 20 + Math.pow(u, 5) * 600; 
                x = sr * Math.cos(theta);
                z = sr * Math.sin(theta);
                y = (Math.random()-0.5) * (600 - sr) * 0.5;
            }
            break;
        default: x=0; y=0; z=0;
      }
      return {x, y, z};
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    // Add Fog for depth
    scene.fog = new THREE.FogExp2(0x000000, 0.0006); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 8000);
    camera.position.set(0, 300, 900);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false; 
    controls.enableZoom = true;
    controlsRef.current = controls;

    const geometry = new THREE.BufferGeometry();
    const posArr = new Float32Array(PARTICLE_COUNT * 3);
    // Init random
    for(let i=0; i<PARTICLE_COUNT; i++) {
        posArr[i*3] = (Math.random()-0.5)*2000;
        posArr[i*3+1] = (Math.random()-0.5)*2000;
        posArr[i*3+2] = (Math.random()-0.5)*2000;
    }
    currentPositionsRef.current = posArr.slice();
    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositionsRef.current, 3));
    // Color buffer
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3).fill(1), 3));

    const texture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/disc.png');
    const material = new THREE.PointsMaterial({
      size: particleSize,
      map: texture,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.9
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    geometryRef.current = geometry;
    materialRef.current = material;
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (materialRef.current) materialRef.current.size = particleSize;
  }, [particleSize]);

  useEffect(() => {
    if (controlsRef.current) {
        controlsRef.current.autoRotate = isAutoRotate; 
        controlsRef.current.autoRotateSpeed = 1.0;
    }
  }, [isAutoRotate]);

  // --- MAIN RENDER LOOP ---
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    let frameCount = 0;
    let lastFpsTime = performance.now();

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      frameCount++;
      if (now - lastFpsTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsTime = now;
      }

      const freqData = audioController.getFrequencyData();
      let bass = 0;
      let treble = 0;
      if (freqData.length > 0) {
          bass = freqData[3] || 0; // Low frequency bin
          treble = freqData[100] || 0;
      }
      
      // Calculate Impulses for reactivity
      // Normalized 0-1 range
      const bassImpulse = bass > 140 ? Math.pow((bass - 140) / 115, 2) : 0; 
      const trebleImpulse = treble > 100 ? (treble - 100) / 155 : 0;

      // Update Mood State
      if (bass > 210) setEnergyMood("CHAOS");
      else if (bass > 170) setEnergyMood("HIGH");
      else setEnergyMood("NEUTRAL");

      // --- COLOR MANAGEMENT ---
      let targetBase: [number, number, number] = [0.05, 0.5, 1.0]; 
      const sIdx = shapeIndexRef.current;
      
      if (!manualColor && !sentiment && shapeType !== ShapeType.Image) {
         // Define Palettes for the 20 Core Shapes
         const palettes = [
            [0.0, 1.0, 1.0], // 0 Tornado (Cyan)
            [0.0, 0.4, 1.0], // 1 Cube (Blue)
            [1.0, 0.0, 0.6], // 2 Neural (Hot Pink)
            [1.0, 0.0, 0.0], // 3 Heart (Red)
            [0.2, 1.0, 0.3], // 4 DNA (Green)
            [0.6, 0.0, 1.0], // 5 Ring (Purple)
            [1.0, 0.8, 0.0], // 6 Pyramid (Gold)
            [1.0, 1.0, 1.0], // 7 Loop (White)
            [0.8, 0.9, 1.0], // 8 Star (Silver)
            [0.0, 1.0, 0.2], // 9 Matrix (Matrix Green)
            [0.0, 0.2, 1.0], // 10 Atom (Deep Blue)
            [1.0, 0.4, 0.0], // 11 Grid (Orange)
            [0.8, 0.6, 0.4], // 12 Saturn (Beige)
            [0.9, 0.0, 0.3], // 13 Spike (Crimson)
            [0.6, 0.4, 0.9], // 14 Cross (Lavender)
            [0.0, 0.9, 0.9], // 15 Wave (Teal)
            [0.8, 1.0, 1.0], // 16 Crystal (Ice)
            [0.5, 0.0, 0.8], // 17 Tunnel (Violet)
            [1.0, 0.0, 1.0], // 18 Chaos (Magenta)
            [0.1, 0.1, 0.1]  // 19 Singularity (Dark)
         ];
         const p = palettes[sIdx] || [0.5, 0.5, 0.5];
         targetBase = [p[0], p[1], p[2]];
      }
      if (manualColor) {
          const rgb = parseInt(manualColor.replace('#', ''), 16);
          targetBase = [(rgb >> 16 & 255)/255, (rgb >> 8 & 255)/255, (rgb & 255)/255];
      }

      // Smooth Color Transition
      const lerp = 0.1;
      currentBaseColorRef.current[0] += (targetBase[0] - currentBaseColorRef.current[0]) * lerp;
      currentBaseColorRef.current[1] += (targetBase[1] - currentBaseColorRef.current[1]) * lerp;
      currentBaseColorRef.current[2] += (targetBase[2] - currentBaseColorRef.current[2]) * lerp;

      timeRef.current += 0.01 + (bassImpulse * 0.05); // Speed up time on bass
      controlsRef.current?.update();

      const geom = geometryRef.current;
      const currentPos = currentPositionsRef.current;
      const positions = geom?.attributes.position.array as Float32Array;
      const colors = geom?.attributes.color.array as Float32Array;
      const time = timeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      
      // VITALITY: Respiratory Breathing for the entire scene (Simulating Life)
      // Uses Simplex Noise + Sine wave for organic feel
      const nBreath = noise3D(time * 0.2, 0, 0);
      const breath = 1 + Math.sin(time * 0.8) * 0.03 + nBreath * 0.02;

      if (geom && currentPos && positions && colors) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const idx = i * 3;
            
            // ==========================================
            // CORE PARTICLES (Form the Shapes)
            // ==========================================
            if (i < CORE_COUNT && shapeType !== ShapeType.Image) {
                const target = getTargetCorePoint(i, shapeIndexRef.current);
                
                // 1. TORNADO Special Logic (Index 0)
                if (shapeIndexRef.current === 0) {
                    const hFactor = (target.y + 600) / 1200; // 0 (bottom) to 1 (top)
                    
                    // Twist and Spin
                    const spinRate = time * 5 + hFactor * 10;
                    const tx = target.x;
                    const tz = target.z;
                    
                    // Apply Twist
                    target.x = tx * Math.cos(spinRate) - tz * Math.sin(spinRate);
                    target.z = tx * Math.sin(spinRate) + tz * Math.cos(spinRate);

                    // Bend with Mouse
                    target.x += mx * hFactor * 800; 
                    target.z += my * hFactor * 800;
                    
                    // BASS REACTION: Expand width
                    const expansion = 1 + bassImpulse * 1.5; 
                    target.x *= expansion;
                    target.z *= expansion;

                    // Add Noise jitter
                    target.x += (Math.random()-0.5) * 20 * bassImpulse;
                    target.z += (Math.random()-0.5) * 20 * bassImpulse;
                }
                // 2. STANDARD Logic for other 19 shapes
                else {
                    const rotSpeed = time * 0.5;
                    // Global Rotate
                    const tx = target.x;
                    target.x = tx * Math.cos(rotSpeed) - target.z * Math.sin(rotSpeed);
                    target.z = tx * Math.sin(rotSpeed) + target.z * Math.cos(rotSpeed);
                    
                    // BASS REACTION: Pulse Scale
                    const pulse = 1 + bassImpulse * 0.6; // Strong pulse
                    target.x *= pulse;
                    target.y *= pulse;
                    target.z *= pulse;

                    // Noise/Turbulence
                    const scale = 0.005;
                    const n = noise3D(target.x*scale, target.y*scale, target.z*scale + time);
                    const jitter = 10 + bassImpulse * 50;
                    target.x += n * jitter;
                    target.y += n * jitter;
                    target.z += n * jitter;
                }
                
                // VITALITY: Apply breathing to everything
                target.x *= breath;
                target.y *= breath;
                target.z *= breath;

                // LERP: Smoothly move particle to target shape position
                // Use faster lerp on beat
                const moveLerp = 0.15 + bassImpulse * 0.1;
                currentPos[idx] += (target.x - currentPos[idx]) * moveLerp;
                currentPos[idx+1] += (target.y - currentPos[idx+1]) * moveLerp;
                currentPos[idx+2] += (target.z - currentPos[idx+2]) * moveLerp;

                // Color Brightness on Beat
                const brightness = 1 + bassImpulse * 2.0;
                colors[idx] = Math.min(1, currentBaseColorRef.current[0] * brightness);
                colors[idx+1] = Math.min(1, currentBaseColorRef.current[1] * brightness);
                colors[idx+2] = Math.min(1, currentBaseColorRef.current[2] * brightness);

            } 
            // ==========================================
            // ATMOSPHERE / FX PARTICLES (Background)
            // ==========================================
            else {
                let x = currentPos[idx];
                let y = currentPos[idx+1];
                let z = currentPos[idx+2];
                const eIdx = effectIndexRef.current;
                
                // Base speed + Bass Boost
                const speed = 2 + bassImpulse * 40; 

                // REGENERATED 20 ATMOSPHERE EFFECTS
                switch(eIdx) {
                    case 0: // WARP SPEED (Z-Axis)
                        z += speed * 15; if(z>2000) z = -2000; 
                        break;
                    case 1: // METEOR SHOWER (Diag Down)
                        x -= speed * 5; y -= speed * 5;
                        if(y<-1000) { y=1000; x=(Math.random()-0.5)*2000; }
                        break;
                    case 2: // SNOW DRIFT (Slow Y)
                        y -= (1 + bassImpulse*5); if(y<-1000) y=1000;
                        x += Math.sin(time + y*0.01) * 2;
                        break;
                    case 3: // RISING EMBERS (Up Y)
                        y += speed * 4; if(y>1000) y=-1000;
                        x += (Math.random()-0.5)*5;
                        break;
                    case 4: // LATERAL RUSH (X Axis)
                        x += speed * 15; if(x>2000) x=-2000;
                        break;
                    case 5: // VORTEX SPIN
                        { 
                            const r = Math.sqrt(x*x+z*z); 
                            const ang = Math.atan2(z,x) + 0.01 * speed; 
                            x=r*Math.cos(ang); z=r*Math.sin(ang); 
                        }
                        break;
                    case 6: // IMPLOSION (Move to 0,0,0)
                        x *= 0.96; y *= 0.96; z *= 0.96;
                        if(Math.abs(x)<50 && Math.abs(y)<50) { 
                            x=(Math.random()-0.5)*3000; y=(Math.random()-0.5)*3000; z=(Math.random()-0.5)*3000; 
                        }
                        break;
                    case 7: // EXPLOSION (Move away)
                        x *= 1.04; y *= 1.04; z *= 1.04;
                        if(Math.abs(x)>2000) { 
                            x=(Math.random()-0.5)*100; y=(Math.random()-0.5)*100; z=(Math.random()-0.5)*100; 
                        }
                        break;
                    case 8: // STATIC NOISE (Jitter)
                        x += (Math.random()-0.5)*100 * bassImpulse; 
                        y += (Math.random()-0.5)*100 * bassImpulse;
                        break;
                    case 9: // DIGITAL GLITCH (Snap)
                        if(Math.random() > 0.98) x += (Math.random()-0.5)*1000;
                        break;
                    case 10: // MATRIX RAIN (Strict Y)
                        y -= speed * 15; if(y<-1000) y=1000; 
                        x = Math.floor(x/60)*60; z = Math.floor(z/60)*60;
                        break;
                    case 11: // PULSE WAVES (Radial Sine)
                        y += Math.sin(Math.sqrt(x*x+z*z)*0.01 - time*5) * 10 * bassImpulse;
                        break;
                    case 12: // ORBITAL DEBRIS
                        { 
                            const ang = 0.005 * speed; 
                            const tx=x; x=tx*Math.cos(ang)-z*Math.sin(ang); z=tx*Math.sin(ang)+z*Math.cos(ang); 
                        }
                        break;
                    case 13: // SHOCKWAVE (Expands outward in ring)
                        { 
                            const r = Math.sqrt(x*x+z*z); 
                            if(r < (time%5)*400) { x*=1.05; z*=1.05; } else { x*=0.99; z*=0.99; } 
                        }
                        break;
                    case 14: // FOG BANK (Slow Noise)
                        { const n = noise3D(x*0.002, y*0.002, time*0.2); x+=n*5; y+=n*5; }
                        break;
                    case 15: // SPIRAL OUT
                        { 
                            const r = Math.sqrt(x*x+z*z) + 1*speed; 
                            const ang = Math.atan2(z,x) + 0.01; 
                            x=r*Math.cos(ang); z=r*Math.sin(ang); 
                            if(r>2500){x=(Math.random()-0.5)*100;z=(Math.random()-0.5)*100;} 
                        }
                        break;
                    case 16: // LIQUID FLOW
                        x += Math.sin(y*0.01 + time)*10; y += Math.cos(x*0.01 + time)*10;
                        break;
                    case 17: // ZERO GRAVITY (Float)
                        x += Math.sin(time + i)*1; y += Math.cos(time + i)*1; z += Math.sin(time*0.5)*1;
                        break;
                    case 18: // GRID LOCK (Snap to grid)
                        x += (Math.round(x/150)*150 - x) * 0.2; 
                        y += (Math.round(y/150)*150 - y) * 0.2; 
                        z += (Math.round(z/150)*150 - z) * 0.2;
                        break;
                    case 19: // VOID SILENCE (Push away from center)
                        { const d = Math.sqrt(x*x+y*y+z*z); if(d<600) { x*=1.1; y*=1.1; z*=1.1; } }
                        break;
                }

                currentPos[idx] = x;
                currentPos[idx+1] = y;
                currentPos[idx+2] = z;
                
                // Dim atmosphere color relative to core
                const dim = 0.3 + bassImpulse * 0.5; // Flash on beat
                colors[idx] = Math.min(1, currentBaseColorRef.current[0] * dim);
                colors[idx+1] = Math.min(1, currentBaseColorRef.current[1] * dim);
                colors[idx+2] = Math.min(1, currentBaseColorRef.current[2] * dim);
            }

            // Write back to buffer
            positions[idx] = currentPos[idx];
            positions[idx+1] = currentPos[idx+1];
            positions[idx+2] = currentPos[idx+2];
        }
        
        geom.attributes.position.needsUpdate = true;
        geom.attributes.color.needsUpdate = true;
      }

      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
    };

    animate();
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [setFps, shapeType, isAutoRotate, sentiment, manualColor, isPlaying, coreShapeIndex, effectIndex]); 

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-black cursor-crosshair" />;
};

export default Visualizer;
