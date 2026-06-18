import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface MathCaptchaProps {
  onSuccess: () => void;
}

export function MathCaptcha({ onSuccess }: MathCaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [error, setError] = useState(false);

  const generatePuzzle = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const answer = a + b;
    
    // Generate 3 wrong options
    const opts = new Set<number>([answer]);
    while (opts.size < 4) {
      opts.add(Math.floor(Math.random() * 20) + 1);
    }
    
    setNum1(a);
    setNum2(b);
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
    setError(false);
  };

  useEffect(() => {
    generatePuzzle();
  }, []);

  const handleSelect = (val: number) => {
    if (val === num1 + num2) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(generatePuzzle, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-app-bg/60 backdrop-blur-3xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card w-full max-w-sm p-8 flex flex-col items-center text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-brand-light" />
        </div>
        
        <div>
          <h2 className="text-xl font-display font-semibold mb-2">Verify it's you</h2>
          <p className="text-white/60 text-sm">Please solve this simple math puzzle to continue securely.</p>
        </div>

        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="text-3xl font-display font-medium py-4"
        >
          {error ? (
            <span className="text-red-400 flex items-center gap-2">
              <XCircle className="w-6 h-6" /> Incorrect
            </span>
          ) : (
            `${num1} + ${num2} = ?`
          )}
        </motion.div>

        <div className="grid grid-cols-2 gap-3 w-full">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              className="glass-button py-3 rounded-2xl text-lg font-medium active:scale-95"
            >
              {opt}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
