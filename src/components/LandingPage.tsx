import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-stone-950 text-stone-100">
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 blur-[150px] rounded-full"></div>
      
      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-fadeIn">
        
        <div className="mb-6 flex justify-center">
          <span className="inline-block px-3 py-1 text-[10px] font-mono tracking-[0.3em] uppercase border border-amber-900/50 text-amber-500/80 rounded-full bg-black/50 backdrop-blur-sm">
            Est. 2025 • Neural Mythology
          </span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-amber-100 via-stone-400 to-stone-800 drop-shadow-2xl">
          THE LIVING <br />
          <span className="text-amber-700/90">ARCHIVE</span>
        </h1>

        <h2 className="text-xl md:text-2xl font-light text-stone-400 mb-8 italic tracking-wide">
          Restoring the visual memory of African Mythology through AI.
        </h2>

        <div className="max-w-xl mx-auto mb-12 text-sm md:text-base text-stone-500 font-mono leading-relaxed border-l-2 border-amber-900/30 pl-6 text-left">
          <p>
            For centuries, the oral traditions of the continent have painted vivid pictures in the minds of listeners. 
            Today, we use generative intelligence to manifest these ancient entities into the digital realm.
            Bridging the gap between folklore and futurism.
          </p>
        </div>

        <button 
          onClick={onEnter}
          className="group relative inline-flex items-center gap-4 px-12 py-5 bg-amber-700 hover:bg-amber-600 text-stone-950 font-bold tracking-widest uppercase transition-all duration-500 ease-out overflow-hidden rounded-sm"
        >
          <span className="relative z-10 flex items-center gap-2">
            Enter The Archive
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </button>
      </div>

      {/* Decorative Footer */}
      <div className="absolute bottom-10 w-full text-center">
        <Sparkles className="inline-block text-amber-900/50 animate-pulse" size={48} />
      </div>
    </div>
  );
};

export default LandingPage;