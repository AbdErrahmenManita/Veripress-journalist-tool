import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

export default function Typewriter({ lines }) {
  const containerRef = useRef(null);
  // Trigger when 50% of the element is in the viewport
  const isInView = useInView(containerRef, { amount: 0.5 });

  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // RESET STATE when the component leaves the viewport
  useEffect(() => {
    if (!isInView) {
      setDisplayedLines([]);
      setCurrentLineIndex(0);
      setCurrentCharIndex(0);
    }
  }, [isInView]);

  // TYPING LOOP
  useEffect(() => {
    // Do not type if not in view or if finished
    if (!isInView || currentLineIndex >= lines.length) return;

    const timeout = setTimeout(() => {
      const currentLineText = lines[currentLineIndex];
      
      if (currentCharIndex < currentLineText.length) {
        // Add next character
        setDisplayedLines(prev => {
          const newLines = [...prev];
          if (!newLines[currentLineIndex]) newLines[currentLineIndex] = '';
          newLines[currentLineIndex] += currentLineText[currentCharIndex];
          return newLines;
        });
        setCurrentCharIndex(prev => prev + 1);
      } else {
        // Move to next line
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
    }, 30); // Speed: 30ms

    return () => clearTimeout(timeout);
  }, [currentCharIndex, currentLineIndex, lines, isInView]);

  return (
    <div ref={containerRef} className="space-y-4 font-mono text-sm text-green-400 min-h-[160px]">
      {/* 
        min-h-[160px] prevents the box from collapsing 
        when the text is cleared during the reset.
      */}
      
      {/* If reset and empty, show a waiting cursor */}
      {displayedLines.length === 0 && isInView && (
         <div className="animate-pulse">_</div>
      )}

      {displayedLines.map((line, i) => (
        <div key={i} className={i === lines.length - 1 ? "text-red-400" : ""}>
           {line}
           {/* Show cursor only on the active line */}
           {i === currentLineIndex && <span className="animate-pulse">_</span>}
        </div>
      ))}
    </div>
  );
}