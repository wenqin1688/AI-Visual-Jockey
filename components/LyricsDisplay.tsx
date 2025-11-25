
import React, { useEffect, useState, useRef } from 'react';

interface LyricsDisplayProps {
  text: string;
  isVisible: boolean;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ text, isVisible }) => {
  const [displayedText, setDisplayedText] = useState("");
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const originalTextRef = useRef<string>("");

  // Charset for decoding effect
  const binaryChars = "01";

  useEffect(() => {
    if (!text) {
        setDisplayedText("");
        return;
    }

    if (text !== originalTextRef.current) {
        originalTextRef.current = text;
        startTimeRef.current = performance.now();
        
        const animate = () => {
            const now = performance.now();
            const progress = (now - startTimeRef.current) / 500; // 500ms decoding time

            if (progress >= 1) {
                setDisplayedText(text);
                return;
            }

            // Generate scrambled text based on progress
            const length = text.length;
            let result = "";
            for (let i = 0; i < length; i++) {
                if (i < length * progress) {
                    result += text[i];
                } else {
                    result += binaryChars[Math.floor(Math.random() * binaryChars.length)];
                }
            }
            setDisplayedText(result);
            frameRef.current = requestAnimationFrame(animate);
        };
        
        cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(animate);
    }
  }, [text]);

  if (!isVisible || !displayedText) return null;

  return (
    <div className="fixed bottom-[150px] left-0 right-0 z-30 pointer-events-none flex justify-center px-8">
      <h2 
        className="font-mono text-[16px] font-black uppercase tracking-[0.05em] text-center max-w-[80vw]"
        style={{
            color: 'white',
            textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 4px 10px rgba(0,0,0,0.8)'
        }}
      >
        {displayedText}
      </h2>
    </div>
  );
};

export default LyricsDisplay;
