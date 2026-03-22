'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../actions/auth';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleDigit = async (digit: string) => {
    if (pin.length >= 6) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 6) {
      const res = await login(newPin);
      if (res.success) {
        router.refresh();
        router.push('/');
      } else {
        setError(true);
        setTimeout(() => setPin(''), 500); // Clear pin after error animation
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  // Sleek iOS styled NumPad
  const numPad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '⌫']
  ];

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col items-center justify-center -mt-16 sm:mt-0 px-6 font-sans">
      <div className="flex flex-col items-center w-full max-w-sm">
        <Lock className="w-6 h-6 text-neutral-400 mb-6" strokeWidth={1.5} />
        <h1 className="text-xl font-medium tracking-wide mb-12">Enter Passcode</h1>
        
        {/* Pin Dots */}
        <div className={`flex gap-5 mb-24 transition-transform duration-100 ${error ? 'animate-shake' : ''}`}>
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                i < pin.length ? 'bg-white scale-110' : 'border border-neutral-600'
              } ${error ? '!bg-red-500 !border-red-500 !scale-100' : ''}`}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="w-full max-w-[280px] grid grid-cols-3 gap-x-6 gap-y-4">
          {numPad.flat().map((key, idx) => (
            <button
              key={idx}
              onClick={() => key === '⌫' ? handleDelete() : key ? handleDigit(key) : null}
              disabled={!key || pin.length >= 6}
              className={`aspect-square rounded-full flex items-center justify-center text-3xl font-light
                transition-colors active:bg-neutral-600
                ${!key ? 'invisible' : 'bg-[#2C2C2E] hover:bg-neutral-700'}`}
            >
              {key === '⌫' ? <span className="text-2xl mt-1">⌫</span> : key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
