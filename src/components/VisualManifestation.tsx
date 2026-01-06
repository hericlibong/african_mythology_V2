
import React from 'react';
import { MythologicalEntity } from '../types';
import { 
  Waves, Flame, CloudLightning, Mountain, Moon, Sun, 
  Sparkles, Star, Skull, Wind, Hammer, 
  Bug, Eye, Hexagon, Fingerprint, Anchor
} from 'lucide-react';

interface VisualManifestationProps {
  entity: MythologicalEntity;
  size?: 'small' | 'large';
  className?: string;
}

const VisualManifestation: React.FC<VisualManifestationProps> = ({ entity, size = 'large', className = '' }) => {
  
  // Deterministic color mapping based on primary domains
  const getGradient = (domains: string[]) => {
    const d = domains.join(' ').toLowerCase();
    if (d.includes('water') || d.includes('ocean') || d.includes('river')) return 'from-cyan-950 via-blue-900 to-slate-900';
    if (d.includes('fire') || d.includes('war') || d.includes('iron') || d.includes('lightning')) return 'from-red-950 via-amber-900 to-stone-900';
    if (d.includes('nature') || d.includes('agriculture') || d.includes('rain')) return 'from-emerald-950 via-green-900 to-stone-900';
    if (d.includes('sky') || d.includes('cosmic') || d.includes('stars') || d.includes('void')) return 'from-indigo-950 via-purple-900 to-black';
    if (d.includes('death') || d.includes('ancestor') || d.includes('trickster')) return 'from-stone-950 via-stone-900 to-black';
    return 'from-amber-950 via-stone-900 to-black';
  };

  // Icon mapping
  const getIcon = (domains: string[]) => {
    const d = domains.join(' ').toLowerCase();
    if (d.includes('water') || d.includes('ocean')) return <Waves strokeWidth={1} />;
    if (d.includes('fire') || d.includes('lightning')) return <Flame strokeWidth={1} />;
    if (d.includes('war') || d.includes('iron')) return <Hammer strokeWidth={1} />;
    if (d.includes('wind') || d.includes('storm')) return <Wind strokeWidth={1} />;
    if (d.includes('sky') || d.includes('creation')) return <CloudLightning strokeWidth={1} />;
    if (d.includes('stars') || d.includes('cosmos')) return <Star strokeWidth={1} />;
    if (d.includes('death')) return <Skull strokeWidth={1} />;
    if (d.includes('trickster')) return <Fingerprint strokeWidth={1} />;
    if (d.includes('wisdom')) return <Eye strokeWidth={1} />;
    return <Sparkles strokeWidth={1} />;
  };

  const bgGradient = getGradient(entity.attributes.domains);
  const Icon = getIcon(entity.attributes.domains);
  const initials = entity.name.substring(0, 2).toUpperCase();

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gradient-to-br ${bgGradient} ${className}`}>
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      
      {/* Abstract Shapes */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-center">
        
        {/* Large Background Icon Faded */}
        <div className="absolute opacity-10 scale-[5] text-white transform rotate-12">
           {Icon}
        </div>

        {/* Central Monogram */}
        <div className="relative">
          <div className="border border-white/20 w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-sm bg-white/5 shadow-2xl shadow-black/50">
             <div className="text-white/80 scale-150">
                {Icon}
             </div>
          </div>
        </div>

        {/* Typography */}
        <h1 className="mt-6 font-serif font-black text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 tracking-tighter opacity-90 select-none">
          {initials}
        </h1>

        {/* Decoder Lines */}
        <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1 opacity-40">
           <div className="w-1 h-3 bg-white/50"></div>
           <div className="w-1 h-2 bg-white/30"></div>
           <div className="w-1 h-4 bg-white/70"></div>
           <div className="w-1 h-2 bg-white/30"></div>
           <div className="w-1 h-3 bg-white/50"></div>
        </div>
      </div>

      {/* Tech Overlay for "Archive" feel */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1 opacity-50">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
        <span className="text-[8px] font-mono text-white/60 tracking-widest uppercase">
          RECONSTRUCTED
        </span>
      </div>
    </div>
  );
};

export default VisualManifestation;
