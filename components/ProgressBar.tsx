import React, { useEffect, useRef } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  color?: string; // Optional hex color
}

interface TrailParticle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  life: number;
  vx: number;
  vy: number;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<TrailParticle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const animate = () => {
      // Ensure canvas matches container width exactly
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && canvas.width !== rect.width) {
         canvas.width = rect.width;
         canvas.height = 120; // Maintain height for the cone
      }
      
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0,0,width,height);
      ctx.globalCompositeOperation = 'lighter';

      const progress = duration > 0 ? currentTime / duration : 0;
      const headX = progress * width;
      const headY = height - 10; // Position near bottom
      const mainColor = color || '#06b6d4'; // Cyan default

      // 0. Base Track Line (Visible even when empty)
      ctx.beginPath();
      ctx.moveTo(0, headY);
      ctx.lineTo(width, headY);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (progress > 0) {
          // 1. The Light Cone (Triangular Beam)
          const coneGrad = ctx.createLinearGradient(headX - 300, headY, headX, headY);
          coneGrad.addColorStop(0, 'rgba(0,0,0,0)');
          coneGrad.addColorStop(1, color ? `${color}80` : 'rgba(6, 182, 212, 0.6)'); 
          
          ctx.beginPath();
          ctx.moveTo(headX, headY);
          ctx.lineTo(headX - 300, headY - 80); // Taller cone
          ctx.lineTo(headX - 300, headY + 10); // Bottom edge
          ctx.closePath();
          ctx.fillStyle = coneGrad;
          ctx.fill();

          // 2. The Glowing Head (Orb)
          const glow = ctx.createRadialGradient(headX, headY, 0, headX, headY, 15);
          glow.addColorStop(0, '#ffffff');
          glow.addColorStop(0.3, mainColor);
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          
          ctx.beginPath();
          ctx.arc(headX, headY, 15, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // 3. Emit Sparkle Particles
          for(let i=0; i<3; i++) {
            particlesRef.current.push({
                x: headX,
                y: headY,
                size: Math.random() * 3 + 1,
                alpha: 1,
                life: 1.0,
                vx: -(Math.random() * 6 + 2), // Trail backward
                vy: (Math.random() - 0.5) * 4,
                color: mainColor
            });
          }
      }

      // 4. Update & Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life -= 0.03;
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color; 
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [currentTime, duration, color]);

  // Click & Drag Logic (Seek)
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || duration <= 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      onSeek(pct * duration);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.buttons === 1) handleClick(e); // Allow drag seeking
  };

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleClick}
      onMouseMove={handleMouseMove}
      className="w-full h-[120px] cursor-pointer relative overflow-visible pointer-events-auto"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};

export default ProgressBar;