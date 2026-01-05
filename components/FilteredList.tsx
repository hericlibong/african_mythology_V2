
import React, { useMemo } from 'react';
import { MythologicalEntity, EntityType } from '../types';
import { MYTHOLOGICAL_DB } from '../services/mockData';
import MiniCard from './MiniCard';
import { ArrowLeft, ArrowDownAZ } from 'lucide-react';

interface FilteredListProps {
  category: EntityType;
  onBack: () => void;
  onSelectEntity: (entity: MythologicalEntity) => void;
}

const FilteredList: React.FC<FilteredListProps> = ({ category, onBack, onSelectEntity }) => {
  
  // Logic: Filter by category AND Sort Alphabetically
  const sortedEntities = useMemo(() => {
    return MYTHOLOGICAL_DB
      .filter(e => e.entity_type === category)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [category]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 container mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 border-b border-stone-800 pb-6 animate-fadeIn">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-800 text-stone-400 hover:text-amber-500 hover:border-amber-500/50 hover:bg-stone-900 transition-all group mb-4 md:mb-0"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-xs uppercase tracking-widest">Back to Categories</span>
        </button>

        <div className="text-center">
          <span className="block font-mono text-[10px] text-stone-500 uppercase tracking-[0.4em] mb-1">
            Classified Records
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-200 uppercase tracking-wide">
            {category === 'Divinity' ? 'The Divinities' : category === 'Hero' ? 'The Heroes' : 'The Creatures'}
          </h1>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded border border-stone-800 bg-stone-900/50 text-stone-500">
           <ArrowDownAZ size={16} />
           <span className="font-mono text-xs uppercase tracking-wide">Sorted A-Z</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        {sortedEntities.map((entity) => (
          <MiniCard 
            key={entity.name} 
            entity={entity} 
            onClick={() => onSelectEntity(entity)} 
          />
        ))}
      </div>

      {/* Footer Count */}
      <div className="mt-12 text-center">
         <span className="text-xs font-mono text-stone-600 uppercase tracking-widest">
           {sortedEntities.length} Records Found
         </span>
      </div>

    </div>
  );
};

export default FilteredList;
