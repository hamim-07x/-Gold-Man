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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/20 backdrop-blur-[20px]">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card w-full max-w-[320px] p-6 flex flex-col items-center text-center space-y-5 shadow-2xl ring-1 ring-black/5 relative overflow-hidden bg-white"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand/10 blur-[30px] pointer-events-none rounded-full" />
        
        <div className="w-12 h-12 rounded-[16px] bg-brand/10 flex items-center justify-center border border-brand/20 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-brand" strokeWidth={1.5} />
        </div>
        
        <div>
          <h2 className="text-lg tracking-wide font-medium mb-1.5 text-gray-900">Verification</h2>
          <p className="text-gray-500 text-[12px] leading-relaxed px-2">Solve this puzzle to secure your session.</p>
        </div>

        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="text-3xl font-display font-medium py-2 tracking-widest text-gray-900"
        >
          {error ? (
            <span className="text-red-500 flex items-center justify-center gap-2 text-2xl">
              <XCircle className="w-6 h-6" strokeWidth={1.5} /> Error
            </span>
          ) : (
            `${num1} + ${num2} = ?`
          )}
        </motion.div>

        <div className="grid grid-cols-2 gap-2.5 w-full">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              className="py-3 text-base font-bold rounded-[14px] active:scale-[0.97] bg-gray-50 hover:bg-gray-100 text-gray-900 border border-black/5 transition-all shadow-sm"
            >
              {opt}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
