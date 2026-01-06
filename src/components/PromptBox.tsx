import React, { useState } from 'react';
import { Copy, Check, Terminal, Cpu } from 'lucide-react';

interface PromptBoxProps {
  prompt: string;
}

const PromptBox: React.FC<PromptBoxProps> = ({ prompt }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-cyan-900/50 bg-black shadow-lg shadow-cyan-900/10 group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-stone-900/80 border-b border-cyan-900/30">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-cyan-500" />
          <span className="text-xs font-mono text-cyan-500 uppercase tracking-wider">
            Prompt Terminal
          </span>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
          <Cpu size={10} />
          Optimized for Imagen 3
        </span>
      </div>

      {/* Content */}
      <div className="relative p-4 bg-black/90 font-mono text-xs md:text-sm leading-relaxed text-cyan-300/90 selection:bg-cyan-900/50 selection:text-cyan-100">
        <p className="break-words">
          <span className="text-pink-500 mr-2">$</span>
          {prompt}
          <span className="animate-pulse inline-block w-2 h-4 bg-cyan-500 ml-1 align-middle"></span>
        </p>

        {/* Copy Button (Floating) */}
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-md bg-stone-800/80 text-stone-400 hover:text-cyan-400 hover:bg-stone-700 transition-all border border-stone-700 hover:border-cyan-500/50"
          title="Copy prompt"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>

      {/* Footer / Status Line */}
      <div className="px-4 py-1 bg-cyan-950/20 text-[10px] text-cyan-700/50 font-mono border-t border-cyan-900/20 flex justify-between">
        <span>STATUS: READY</span>
        <span>TOKEN_COUNT: {prompt.split(' ').length}</span>
      </div>
    </div>
  );
};

export default PromptBox;