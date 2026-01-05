
import React from 'react';
import { Compass, Map as MapIcon, Search, BookOpen, Home, Layers } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'archive' | 'about' | 'map' | 'types';
  onHomeClick: () => void;
  onSearchClick: () => void;
  onMapClick: () => void;
  onAboutClick: () => void;
  onTypesClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onHomeClick, onSearchClick, onMapClick, onAboutClick, onTypesClick }) => {
  
  const getButtonClass = (view: string) => {
    const isActive = currentView === view;
    return `flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-300 uppercase font-mono text-xs md:text-sm tracking-wide ${
      isActive 
        ? 'text-amber-500 bg-amber-950/30 border border-amber-900/50' 
        : 'text-stone-400 hover:text-amber-400 hover:bg-white/5 border border-transparent'
    }`;
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-stone-950/90 backdrop-blur-md border-b border-stone-800 shadow-2xl shadow-black/50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* Logo Area */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onHomeClick}
        >
          <div className="relative">
            <Compass className="text-amber-600 group-hover:text-amber-500 transition-colors" size={24} strokeWidth={1.5} />
            <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-stone-200 tracking-[0.15em] text-sm md:text-base leading-none group-hover:text-amber-100 transition-colors">
              LIVING ARCHIVE
            </span>
            <span className="text-[8px] font-mono text-stone-600 uppercase tracking-widest hidden md:block">
              V2.1 // Neural Interface
            </span>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={onHomeClick}
            className={getButtonClass('landing')}
          >
            <Home size={14} />
            <span className="hidden md:inline">Home</span>
          </button>

          <button 
            onClick={onSearchClick}
            className={getButtonClass('archive')}
          >
            <Search size={14} />
            <span className="hidden md:inline">Search</span>
          </button>

          <button 
            onClick={onTypesClick}
            className={getButtonClass('types')}
          >
            <Layers size={14} />
            <span className="hidden md:inline">Beings</span>
          </button>

          <button 
            onClick={onMapClick}
            className={getButtonClass('map')}
          >
            <MapIcon size={14} />
            <span className="hidden md:inline">Map</span>
          </button>
          
          <div className="w-px h-6 bg-stone-800 mx-1 hidden md:block"></div>

          <button 
            onClick={onAboutClick}
            className={getButtonClass('about')}
          >
            <BookOpen size={14} />
            <span className="hidden md:inline">About</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
