
import React, { useState, useEffect, useMemo } from 'react';
import { MythologicalEntity } from '../types';
import { MYTHOLOGICAL_DB } from '../services/mockData';
import VisualManifestation from './VisualManifestation';
import { Network, ZoomIn, Info, AlertTriangle, ArrowLeft, Layers, User, Users } from 'lucide-react';

interface LineageGraphProps {
  focusEntity: MythologicalEntity | null;
  onNodeClick: (entity: MythologicalEntity) => void;
  onNodeDoubleClick: (entity: MythologicalEntity) => void;
}

// --- HELPER FUNCTIONS ---

const findEntity = (name: string): MythologicalEntity | undefined => {
  return MYTHOLOGICAL_DB.find(e => e.name.toLowerCase() === name.toLowerCase());
};

const getBorderColor = (type?: string) => {
  switch(type) {
    case 'Divinity': return 'border-amber-400 shadow-amber-500/20'; // Gold
    case 'Hero': return 'border-stone-300 shadow-stone-400/20'; // Silver
    case 'Creature': return 'border-orange-700 shadow-orange-900/20'; // Bronze
    default: return 'border-stone-700'; // Ghost
  }
};

const getRelationLabel = (type: string) => {
  switch(type) {
    case 'parent': return 'PRECEDES';
    case 'partner': return 'ALLIED';
    case 'child': return 'SUCCEEDS';
    default: return 'LINKS';
  }
};

// --- SUB-COMPONENTS ---

// 1. PANTHEON LOBBY
const PantheonLobby: React.FC<{ onSelect: (entity: MythologicalEntity) => void }> = ({ onSelect }) => {
  // Group entities by Pantheon
  const pantheonData = useMemo(() => {
    const groups: Record<string, MythologicalEntity[]> = {};
    MYTHOLOGICAL_DB.forEach(e => {
      const p = e.origin.pantheon || 'Unknown';
      if (!groups[p]) groups[p] = [];
      groups[p].push(e);
    });
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, []);

  return (
    <div className="w-full min-h-screen pt-24 px-4 overflow-y-auto pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fadeIn">
          <div className="flex items-center justify-center gap-2 mb-2 text-amber-500">
            <Layers size={24} />
            <span className="font-mono text-xs uppercase tracking-[0.3em]">Knowledge Graph Access</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-200 via-amber-200 to-stone-400">
            THE GREAT WEAVE
          </h1>
          <p className="text-stone-500 mt-4 max-w-xl mx-auto font-light">
            Select a lineage to initialize the relational matrix. Explore the connections between divinities, heroes, and the spirits that bind them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          {pantheonData.map(([pantheon, entities]) => (
            <div 
              key={pantheon}
              onClick={() => onSelect(entities[0])} // Select first entity to start
              className="group relative h-64 bg-stone-900/50 border border-stone-800 rounded-xl overflow-hidden cursor-pointer hover:border-amber-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-900/10"
            >
              <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
                 <VisualManifestation entity={entities[0]} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex justify-between items-end mb-2">
                  <h2 className="text-2xl font-serif font-bold text-stone-200 group-hover:text-amber-400 transition-colors">
                    {pantheon}
                  </h2>
                  <span className="text-3xl font-mono font-bold text-stone-800 group-hover:text-amber-900/50 transition-colors">
                    0{entities.length}
                  </span>
                </div>
                <div className="h-px w-full bg-stone-800 group-hover:bg-amber-800/50 transition-colors mb-3"></div>
                <p className="text-xs text-stone-500 font-mono uppercase tracking-wider">
                  Includes: {entities.slice(0, 3).map(e => e.name).join(', ')}{entities.length > 3 ? '...' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN GRAPH COMPONENT ---

const LineageGraph: React.FC<LineageGraphProps> = ({ focusEntity, onNodeClick, onNodeDoubleClick }) => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Layout Logic
  useEffect(() => {
    if (!focusEntity) return;
    
    setLoading(true);
    
    // Config: Center is 50,50
    const newNodes = [];

    // 1. Center Node
    newNodes.push({
      id: 'center',
      type: 'focus',
      data: focusEntity,
      x: 50,
      y: 50,
      label: focusEntity.name
    });

    // 2. Parents (Top Row: Y=15%)
    const parents = focusEntity.relations.parents;
    if (parents.length > 0) {
      const spread = 60; 
      const startX = 50 - (spread / 2);
      const step = parents.length > 1 ? spread / (parents.length - 1) : 0;
      
      parents.forEach((name, i) => {
        newNodes.push({
          id: `parent-${i}`,
          relationType: 'parent',
          name: name,
          data: findEntity(name),
          x: parents.length === 1 ? 50 : startX + (i * step),
          y: 15,
          label: name
        });
      });
    }

    // 3. Partners (Middle Row Sides: Y=50%)
    const partners = focusEntity.relations.conjoint;
    if (partners.length > 0) {
      partners.forEach((name, i) => {
        // Alternate left (15%) and right (85%)
        // Stagger Y slightly if multiple to avoid overlap
        const isLeft = i % 2 === 0;
        const x = isLeft ? 15 : 85;
        const yOffset = Math.floor(i / 2) * 12; // vertical stacking for multiples
        
        newNodes.push({
          id: `partner-${i}`,
          relationType: 'partner',
          name: name,
          data: findEntity(name),
          x: x,
          y: 50 + (isLeft ? -yOffset : yOffset), // Stagger differently
          label: name
        });
      });
    }

    // 4. Descendants (Bottom Row: Y=85%)
    const children = focusEntity.relations.descendants;
    if (children.length > 0) {
      const spread = 80;
      const startX = 50 - (spread / 2);
      const step = children.length > 1 ? spread / (children.length - 1) : 0;
      
      children.forEach((name, i) => {
        newNodes.push({
          id: `child-${i}`,
          relationType: 'child',
          name: name,
          data: findEntity(name),
          x: children.length === 1 ? 50 : startX + (i * step),
          y: 85,
          label: name
        });
      });
    }

    setNodes(newNodes);
    
    // Smooth transition simulation
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);

  }, [focusEntity]);

  // --- RENDER ---
  
  if (!focusEntity) {
    return <PantheonLobby onSelect={onNodeClick} />;
  }

  return (
    <div className="relative w-full h-[calc(100vh-64px)] mt-16 bg-stone-950 overflow-hidden select-none">
      
      {/* 1. Technical Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black"></div>
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 animate-pulse-slow"></div>

      {/* 2. SVG Connections Layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#78350f" />
          </marker>
        </defs>
        
        {nodes.filter(n => n.type !== 'focus').map((node, i) => {
          const isPartner = node.relationType === 'partner';
          // Calculate midpoint for label
          const midX = (50 + node.x) / 2;
          const midY = (50 + node.y) / 2;
          
          return (
            <g key={`link-group-${i}`}>
              <line
                x1="50%"
                y1="50%"
                x2={`${node.x}%`}
                y2={`${node.y}%`}
                stroke={isPartner ? "#78716c" : "#d97706"} // Stone for partner, Amber for blood
                strokeWidth={isPartner ? "1" : "2"}
                strokeDasharray={isPartner ? "4 4" : "0"}
                className="opacity-40 transition-all duration-1000"
              />
              {/* Relationship Label on Line */}
              <foreignObject x={`${midX - 5}%`} y={`${midY - 2}%`} width="10%" height="4%">
                <div className="flex justify-center items-center h-full">
                  <span className={`px-1 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest bg-stone-950 border rounded ${isPartner ? 'text-stone-500 border-stone-800' : 'text-amber-600 border-amber-900/50'}`}>
                    {getRelationLabel(node.relationType)}
                  </span>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* 3. Data Nodes Layer */}
      <div className="relative z-20 w-full h-full">
        {nodes.map((node) => {
          const isCenter = node.type === 'focus';
          const isMissing = !node.data && !isCenter;
          
          return (
            <div
              key={node.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out flex flex-col items-center group
                ${isMissing ? 'cursor-not-allowed grayscale opacity-70' : 'cursor-pointer'}
              `}
              style={{ 
                left: `${node.x}%`, 
                top: `${node.y}%`,
                zIndex: isCenter ? 50 : 30 
              }}
              onClick={() => {
                if (node.data && !isCenter) onNodeClick(node.data);
              }}
            >
              {/* The Data-Node "Micro-Fiche" */}
              <div className="relative">
                {/* Outer Ring */}
                <div 
                  className={`rounded-full border-2 bg-stone-900 flex items-center justify-center overflow-hidden transition-all duration-300
                    ${isCenter 
                      ? 'w-32 h-32 md:w-40 md:h-40 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10' 
                      : 'w-20 h-20 md:w-24 md:h-24 hover:scale-105 z-0'
                    }
                    ${isMissing ? 'border-dashed border-stone-800' : getBorderColor(node.data?.entity_type)}
                    ${!isMissing && !isCenter ? 'hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]' : ''}
                  `}
                >
                  {isMissing ? (
                    <div className="flex flex-col items-center justify-center text-stone-700">
                      <AlertTriangle size={isCenter ? 32 : 16} strokeWidth={1.5} />
                    </div>
                  ) : (
                    <VisualManifestation 
                      entity={node.data} 
                      size={isCenter ? 'large' : 'small'}
                      className="opacity-90 group-hover:opacity-100" 
                    />
                  )}
                  
                  {/* Scanline Effect for Center */}
                  {isCenter && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent animate-scan"></div>}
                </div>

                {/* Profile Button (Center Only) */}
                {isCenter && (
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       onNodeDoubleClick(focusEntity);
                     }}
                     className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-amber-600 text-stone-950 font-bold text-[10px] uppercase tracking-wider rounded-full hover:bg-amber-400 hover:scale-105 transition-all shadow-lg border border-amber-500"
                   >
                     <User size={10} /> View Profile
                   </button>
                )}
              </div>

              {/* Data Label */}
              <div className={`mt-5 px-3 py-1.5 bg-stone-900/90 border border-stone-800 backdrop-blur-sm rounded text-center min-w-[120px] transition-all duration-300 ${isCenter ? 'scale-110 border-amber-900/50' : ''}`}>
                <span 
                  className={`block font-serif font-bold tracking-wide text-sm
                    ${isCenter ? 'text-amber-100' : 'text-stone-300'}
                    ${isMissing ? 'text-stone-600' : ''}
                  `}
                >
                  {node.label}
                </span>
                
                {!isMissing && (
                  <div className="flex justify-center gap-2 mt-1">
                     <span className={`text-[8px] font-mono uppercase px-1 rounded ${isCenter ? 'bg-amber-900/30 text-amber-500' : 'bg-stone-800 text-stone-500'}`}>
                        {node.data?.entity_type}
                     </span>
                  </div>
                )}
                
                {isMissing && (
                  <span className="text-[8px] text-stone-600 font-mono uppercase tracking-tight block mt-1">
                    Unknown Fragment
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. HUD / Info Panel */}
      <div className="absolute top-6 left-6 z-50 animate-fadeIn">
         <button 
            onClick={() => onNodeClick(null as any)} // Hack to trigger lobby (parent handles null check usually, but here we rely on parent updating prop)
            className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-4 group"
         >
           <div className="p-1 rounded-full border border-stone-700 group-hover:border-amber-500">
             <ArrowLeft size={12} />
           </div>
           <span className="text-xs font-mono uppercase tracking-widest">Back to Nexus</span>
         </button>

         <div className="p-4 bg-stone-900/90 backdrop-blur border border-stone-800 rounded-xl shadow-2xl max-w-xs">
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-widest mb-3 border-b border-stone-800 pb-2">
              Relational Matrix
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                <span className="w-2 h-2 rounded-full border border-amber-500 bg-amber-900/20"></span>
                <span>Divinity (Gold)</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                 <span className="w-2 h-2 rounded-full border border-stone-400 bg-stone-800/50"></span>
                 <span>Hero (Silver)</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                 <span className="w-2 h-2 rounded-full border border-orange-700 bg-orange-900/20"></span>
                 <span>Creature (Bronze)</span>
              </div>
               <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                 <span className="w-2 h-2 rounded-full border border-stone-700 border-dashed"></span>
                 <span>Missing Record</span>
              </div>
            </div>
         </div>
      </div>

      {/* Loading Overlay */}
      <div className={`absolute inset-0 bg-stone-950 z-[60] pointer-events-none transition-opacity duration-500 flex items-center justify-center ${loading ? 'opacity-100' : 'opacity-0'}`}>
         <div className="flex flex-col items-center">
             <div className="w-12 h-12 border-2 border-stone-800 border-t-amber-500 rounded-full animate-spin"></div>
             <p className="mt-4 font-mono text-[10px] text-stone-500 uppercase tracking-[0.3em] animate-pulse">Calculating Vectors...</p>
         </div>
      </div>

    </div>
  );
};

export default LineageGraph;
