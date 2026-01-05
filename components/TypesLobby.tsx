
import React, { useMemo } from 'react';
import { MYTHOLOGICAL_DB } from '../services/mockData';
import { EntityType } from '../types';
import { Crown, Sword, Skull, Sparkles } from 'lucide-react';

interface TypesLobbyProps {
  onSelectType: (type: EntityType) => void;
}

const TypesLobby: React.FC<TypesLobbyProps> = ({ onSelectType }) => {
  
  // Dynamic Counter Logic
  const counts = useMemo(() => {
    return {
      Divinity: MYTHOLOGICAL_DB.filter(e => e.entity_type === 'Divinity').length,
      Hero: MYTHOLOGICAL_DB.filter(e => e.entity_type === 'Hero').length,
      Creature: MYTHOLOGICAL_DB.filter(e => e.entity_type === 'Creature').length,
    };
  }, []);

  const cards = [
    {
      id: 'Divinity' as EntityType,
      title: 'The Divinities',
      subtitle: 'Gods, Orishas & Spirits',
      icon: <Crown size={48} strokeWidth={1} />,
      count: counts.Divinity,
      color: 'amber',
      bgGradient: 'from-amber-950 to-stone-950',
      borderColor: 'group-hover:border-amber-500'
    },
    {
      id: 'Hero' as EntityType,
      title: 'The Legends',
      subtitle: 'Warriors, Queens & Kings',
      icon: <Sword size={48} strokeWidth={1} />,
      count: counts.Hero,
      color: 'stone',
      bgGradient: 'from-stone-800 to-stone-950',
      borderColor: 'group-hover:border-stone-400'
    },
    {
      id: 'Creature' as EntityType,
      title: 'The Creatures',
      subtitle: 'Beasts, Tricksters & Monsters',
      icon: <Skull size={48} strokeWidth={1} />,
      count: counts.Creature,
      color: 'red',
      bgGradient: 'from-red-950 to-stone-950',
      borderColor: 'group-hover:border-red-700'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 container mx-auto flex flex-col items-center">
      
      {/* Header */}
      <div className="text-center mb-16 animate-fadeIn">
        <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-amber-500" size={16} />
            <span className="text-[10px] md:text-xs font-mono text-amber-500 uppercase tracking-[0.3em]">
              Categorical Access
            </span>
        </div>
        <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-stone-200 to-amber-700 drop-shadow-lg">
          HALL OF BEINGS
        </h1>
        <p className="text-stone-500 mt-4 font-light italic max-w-lg mx-auto">
          Choose a path to filter the archive by the nature of the entity.
        </p>
      </div>

      {/* Cards Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 h-auto md:h-[500px] animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelectType(card.id)}
            className={`group relative flex flex-col items-center justify-center p-8 rounded-2xl border border-stone-800 ${card.borderColor} bg-gradient-to-b ${card.bgGradient} overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2`}
          >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700"></div>

            {/* Icon */}
            <div className={`relative z-10 mb-8 p-6 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm shadow-xl group-hover:scale-110 transition-transform duration-500 ${card.color === 'amber' ? 'text-amber-400' : card.color === 'stone' ? 'text-stone-300' : 'text-red-500'}`}>
              {card.icon}
            </div>

            {/* Texts */}
            <h2 className="relative z-10 font-serif text-2xl md:text-3xl font-bold text-stone-200 uppercase tracking-widest mb-2 group-hover:text-white transition-colors">
              {card.title}
            </h2>
            <p className="relative z-10 font-mono text-xs text-stone-500 uppercase tracking-wider mb-8">
              {card.subtitle}
            </p>

            {/* Counter Badge */}
            <div className="relative z-10 px-4 py-1 rounded-full border border-stone-700 bg-stone-900/80 text-xs font-mono text-stone-400 group-hover:border-white/20 group-hover:text-white transition-all">
              {card.count} ENTITIES RECORDED
            </div>

            {/* Hover Glow */}
            <div className={`absolute -bottom-20 -right-20 w-64 h-64 bg-${card.color}-600/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypesLobby;
