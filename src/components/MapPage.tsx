
import React, { useState, useMemo } from 'react';
import { MythologicalEntity } from '../types';
import { MYTHOLOGICAL_DB } from '../services/mockData';
import MiniCard from './MiniCard';
import { Compass, Filter, MapPin, Sparkles } from 'lucide-react';

interface MapPageProps {
  onSelectEntity: (entity: MythologicalEntity) => void;
}

type RegionKey = 'West Africa' | 'Central Africa' | 'East Africa' | 'Southern Africa' | 'Pan-African & Diaspora';

const REGION_MAPPING: Record<RegionKey, string[]> = {
  'West Africa': ['Nigeria', 'Benin', 'Ghana', 'Mali', 'Togo'],
  'Central Africa': ['DRC', 'Angola', 'Congo Basin'],
  'East Africa': ['Kenya', 'Tanzania', 'Uganda', 'Egypt'],
  'Southern Africa': ['South Africa', 'Zimbabwe/Zambia', 'Zimbabwe', 'Zambia', 'Namibia', 'Mozambique'],
  'Pan-African & Diaspora': ['Haiti', 'Pan-African', 'USA']
};

const MapPage: React.FC<MapPageProps> = ({ onSelectEntity }) => {
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | null>(null);
  const [selectedEthnicity, setSelectedEthnicity] = useState<string | null>(null);

  // Filter Logic
  const regionEntities = useMemo(() => {
    if (!selectedRegion) return [];
    
    const validCountries = REGION_MAPPING[selectedRegion];
    
    return MYTHOLOGICAL_DB.filter(entity => {
      const entityCountry = entity.origin.country;
      return validCountries.some(c => entityCountry.includes(c));
    });
  }, [selectedRegion]);

  const filteredEntities = useMemo(() => {
    if (!selectedEthnicity) return regionEntities;
    return regionEntities.filter(e => e.origin.ethnicity === selectedEthnicity);
  }, [regionEntities, selectedEthnicity]);

  const availableEthnicities = useMemo(() => {
    const eths = new Set(regionEntities.map(e => e.origin.ethnicity));
    return Array.from(eths).sort();
  }, [regionEntities]);

  return (
    <div className="min-h-screen pt-24 pb-12 font-sans overflow-hidden">
      
      {/* Header */}
      <div className="container mx-auto px-4 mb-10 text-center animate-fadeIn">
        <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-amber-500 animate-spin-slow" size={16} />
            <span className="text-[10px] md:text-xs font-mono text-amber-500 uppercase tracking-[0.3em]">Phase 1: Exploration</span>
        </div>
        <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-stone-200 to-amber-700 drop-shadow-lg">
          SACRED CARTOGRAPHY
        </h1>
        <p className="text-stone-500 mt-2 font-light italic max-w-lg mx-auto">
          Traverse the spiritual geography of the continent. Select a region to unearth its hidden mythology.
        </p>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
        
        {/* Interactive Map Section (Left Column) */}
        <div className="lg:col-span-5 relative animate-fadeIn" style={{ animationDelay: '0.2s' }}>
           <div className="aspect-[4/5] w-full bg-stone-950 rounded-3xl border border-amber-900/30 p-6 relative overflow-hidden group shadow-2xl shadow-black">
              
              {/* Texture Layers */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-40 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-stone-900/0 via-stone-900/50 to-stone-950"></div>
              
              {/* SVG Map Container */}
              <div className="relative w-full h-full z-10 flex items-center justify-center">
                <svg viewBox="0 0 500 600" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(180,83,9,0.2)]">
                  <defs>
                    <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                    </pattern>
                  </defs>

                  {/* Background Grid */}
                  <rect width="500" height="600" fill="url(#grid)" />

                  {/* --- REGIONS --- */}
                  {/* Styling: 
                      Stroke: 0.5px Gold (amber-500)
                      Fill: Transparent (or dark stone on hover)
                      Active: Pulse animation + brighter stroke 
                  */}

                  {/* West Africa */}
                  <path
                    d="M 120,250 L 180,240 L 220,280 L 220,320 L 150,340 L 100,300 Z"
                    className={`cursor-pointer transition-all duration-500 ease-out hover:fill-amber-900/20
                      ${selectedRegion === 'West Africa' 
                        ? 'stroke-amber-400 stroke-[1.5px] fill-amber-900/30 animate-pulse' 
                        : 'stroke-amber-700/50 stroke-[0.5px] fill-transparent'
                      }`}
                    onClick={() => { setSelectedRegion('West Africa'); setSelectedEthnicity(null); }}
                  />
                  <text x="135" y="295" className={`text-[10px] font-mono tracking-widest pointer-events-none transition-all duration-300 ${selectedRegion === 'West Africa' ? 'fill-amber-300' : 'fill-stone-600'}`}>WEST</text>

                  {/* Central Africa */}
                  <path
                    d="M 220,320 L 280,320 L 300,380 L 260,450 L 210,420 L 220,320 Z"
                    className={`cursor-pointer transition-all duration-500 ease-out hover:fill-amber-900/20
                      ${selectedRegion === 'Central Africa' 
                        ? 'stroke-amber-400 stroke-[1.5px] fill-amber-900/30 animate-pulse' 
                        : 'stroke-amber-700/50 stroke-[0.5px] fill-transparent'
                      }`}
                    onClick={() => { setSelectedRegion('Central Africa'); setSelectedEthnicity(null); }}
                  />
                   <text x="235" y="380" className={`text-[10px] font-mono tracking-widest pointer-events-none transition-all duration-300 ${selectedRegion === 'Central Africa' ? 'fill-amber-300' : 'fill-stone-600'}`}>CENTRAL</text>

                  {/* East Africa (+Nile) */}
                  <path
                    d="M 280,150 L 350,150 L 380,250 L 380,350 L 300,380 L 280,320 L 220,280 L 250,180 Z"
                    className={`cursor-pointer transition-all duration-500 ease-out hover:fill-amber-900/20
                      ${selectedRegion === 'East Africa' 
                        ? 'stroke-amber-400 stroke-[1.5px] fill-amber-900/30 animate-pulse' 
                        : 'stroke-amber-700/50 stroke-[0.5px] fill-transparent'
                      }`}
                    onClick={() => { setSelectedRegion('East Africa'); setSelectedEthnicity(null); }}
                  />
                  <text x="310" y="260" className={`text-[10px] font-mono tracking-widest pointer-events-none transition-all duration-300 ${selectedRegion === 'East Africa' ? 'fill-amber-300' : 'fill-stone-600'}`}>EAST</text>

                  {/* Southern Africa */}
                  <path
                    d="M 210,420 L 260,450 L 300,380 L 320,400 L 280,550 L 240,520 Z"
                    className={`cursor-pointer transition-all duration-500 ease-out hover:fill-amber-900/20
                      ${selectedRegion === 'Southern Africa' 
                        ? 'stroke-amber-400 stroke-[1.5px] fill-amber-900/30 animate-pulse' 
                        : 'stroke-amber-700/50 stroke-[0.5px] fill-transparent'
                      }`}
                    onClick={() => { setSelectedRegion('Southern Africa'); setSelectedEthnicity(null); }}
                  />
                  <text x="255" y="480" className={`text-[10px] font-mono tracking-widest pointer-events-none transition-all duration-300 ${selectedRegion === 'Southern Africa' ? 'fill-amber-300' : 'fill-stone-600'}`}>SOUTH</text>

                  {/* Diaspora (Abstract Floating Orbs) */}
                  <circle
                    cx="60" cy="200" r="25"
                    className={`cursor-pointer transition-all duration-500 ease-out hover:fill-amber-900/20
                      ${selectedRegion === 'Pan-African & Diaspora' 
                        ? 'stroke-amber-400 stroke-[1.5px] fill-amber-900/30 animate-pulse' 
                        : 'stroke-amber-700/50 stroke-[0.5px] fill-transparent'
                      }`}
                    onClick={() => { setSelectedRegion('Pan-African & Diaspora'); setSelectedEthnicity(null); }}
                  />
                  <text x="35" y="245" className={`text-[10px] font-mono tracking-widest pointer-events-none transition-all duration-300 ${selectedRegion === 'Pan-African & Diaspora' ? 'fill-amber-300' : 'fill-stone-600'}`}>DIASPORA</text>

                  {/* Decorative Lines connecting Diaspora */}
                  <line x1="85" y1="200" x2="118" y2="255" stroke="rgba(120, 53, 15, 0.2)" strokeDasharray="4 2" />

                </svg>
              </div>

              {/* Status Overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end border-t border-stone-800 pt-4">
                <div className="flex flex-col">
                   <span className="text-[10px] font-mono text-stone-600 uppercase">Status</span>
                   <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedRegion ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-stone-700'}`}></div>
                    <span>{selectedRegion ? selectedRegion.toUpperCase() : 'STANDBY...'}</span>
                  </div>
                </div>
                <Compass className={`text-stone-700 transition-transform duration-1000 ${selectedRegion ? 'rotate-180 text-amber-900' : 'rotate-0'}`} size={24} strokeWidth={1} />
              </div>
           </div>
        </div>

        {/* Results Panel (Right Column) */}
        <div className="lg:col-span-7 space-y-6 lg:h-[600px] lg:overflow-y-auto pr-2 custom-scrollbar">
          
          {selectedRegion ? (
            <div className="animate-slideIn">
              
              {/* Filter Bar */}
              <div className="bg-stone-900/80 backdrop-blur-sm p-4 rounded-xl border border-stone-800 mb-6 sticky top-0 z-20 shadow-xl">
                <div className="flex items-center gap-2 mb-3 text-amber-500/80 text-xs font-bold uppercase tracking-wider">
                   <Filter size={14} />
                   <span>Filter by Ethnicity</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                     onClick={() => setSelectedEthnicity(null)}
                     className={`px-3 py-1 text-xs rounded-full border transition-all ${!selectedEthnicity ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-[0_0_10px_rgba(217,119,6,0.3)]' : 'bg-transparent text-stone-400 border-stone-700 hover:border-amber-500/50'}`}
                  >
                    ALL
                  </button>
                  {availableEthnicities.map(eth => (
                    <button
                      key={eth}
                      onClick={() => setSelectedEthnicity(eth === selectedEthnicity ? null : eth)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${selectedEthnicity === eth ? 'bg-amber-600 text-stone-950 border-amber-500' : 'bg-transparent text-stone-400 border-stone-700 hover:border-amber-500/50'}`}
                    >
                      {eth}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Grid */}
              <div className="flex items-center justify-between mb-4 px-2">
                 <h2 className="text-xl font-serif text-stone-200">
                   {selectedEthnicity ? `${selectedEthnicity} Chronicles` : `All ${selectedRegion} Myths`}
                 </h2>
                 <span className="text-xs font-mono text-stone-500 bg-stone-900 px-2 py-1 rounded border border-stone-800">
                   COUNT: {filteredEntities.length}
                 </span>
              </div>

              {filteredEntities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-12">
                  {filteredEntities.map(entity => (
                    <MiniCard 
                      key={entity.name} 
                      entity={entity} 
                      onClick={() => onSelectEntity(entity)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-stone-800 rounded-xl text-stone-500">
                  <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No records found in this sector for current filters.</p>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-stone-900/20 to-stone-950/50 border border-stone-800/50 rounded-3xl border-dashed animate-fadeIn">
               <div className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-stone-800">
                 <Compass size={40} className="text-stone-700" strokeWidth={1} />
               </div>
               <h3 className="text-2xl font-serif text-stone-300 mb-3 tracking-wide">Awaiting Coordinates</h3>
               <p className="text-stone-500 max-w-sm font-mono text-sm leading-relaxed">
                 Select a region on the <span className="text-amber-600">Sacred Map</span> to reveal its myths, legends, and divinities.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
