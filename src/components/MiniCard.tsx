
import React from 'react';
import { MythologicalEntity } from '../types';
import { Shield } from 'lucide-react';
import VisualManifestation from './VisualManifestation';

interface MiniCardProps {
  entity: MythologicalEntity;
  onClick: () => void;
}

const MiniCard: React.FC<MiniCardProps> = ({ entity, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-amber-500/10"
    >
      <div className="aspect-[4/5] overflow-hidden relative bg-stone-950">

        {/* Priority: 1. Rendered Image (any value) 2. Legacy ImageUrl 3. Abstract Visual */}
        {(entity.rendering?.images && Object.values(entity.rendering.images).length > 0) || entity.appearance.imageUrl ? (
          <img
            src={Object.values(entity.rendering?.images || {})[0] || entity.appearance.imageUrl}
            alt={entity.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
          />
        ) : (
          /* Anti-Spoiler: Fallback to VisualManifestation (Abstract View) */
          <VisualManifestation
            entity={entity}
            size="small"
            className="transition-transform duration-700 group-hover:scale-110"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <span className="inline-block px-2 py-0.5 mb-1 text-[10px] font-bold tracking-widest text-amber-950 bg-amber-500 rounded uppercase">
          {entity.entity_type}
        </span>
        <h3 className="text-lg font-serif font-bold text-amber-100 group-hover:text-amber-400 transition-colors">
          {entity.name}
        </h3>
        <p className="text-xs text-stone-400 line-clamp-1 italic font-light">
          {entity.identity.cultural_role}
        </p>
        <div className="flex items-center gap-1 mt-2 text-[10px] text-stone-500 font-mono">
          <Shield size={10} className="text-amber-600/50" />
          <span>{entity.origin.ethnicity}</span>
        </div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-[10px] bg-amber-600/80 text-white px-2 py-1 rounded-sm uppercase tracking-tighter">
          View Details
        </button>
      </div>
    </div>
  );
};

export default MiniCard;
