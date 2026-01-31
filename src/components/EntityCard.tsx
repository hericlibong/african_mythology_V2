
import React, { useState, useEffect, useMemo } from 'react';
import { MythologicalEntity } from '../types';
import PromptBox from './PromptBox';
import VisualManifestation from './VisualManifestation';
import { MYTHOLOGICAL_DB } from '../services/mockData';
import { MapPin, Shield, Zap, Heart, Scroll, Image as ImageIcon, Eye, EyeOff, Sparkles, Loader2, Cpu, GitFork } from 'lucide-react';
import TypeSpecificDetails from './TypeSpecificDetails';

interface EntityCardProps {
  data: MythologicalEntity;
  onSelectEntity?: (entity: MythologicalEntity) => void;
  onOpenLineage?: () => void;
}

const EntityCard: React.FC<EntityCardProps> = ({ data, onSelectEntity, onOpenLineage }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [generationState, setGenerationState] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [imageUrl, setImageUrl] = useState(data.appearance.imageUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset generation state when navigating to a new entity
  useEffect(() => {
    setGenerationState('idle');
    setImageUrl(data.appearance.imageUrl);
  }, [data]);

  const handleGenerate = async () => {
    setGenerationState('generating');

    try {
      const response = await fetch('/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity_name: data.name }),
      });

      if (response.status === 429) {
        let msg = "Quota reached. Try again later.";
        try {
          const errorData = await response.json();
          if (errorData.message) {
            msg = errorData.message;
          }
        } catch (jsonError) {
          console.warn("Could not parse 429 JSON response", jsonError);
        }
        setErrorMessage(msg);
        setGenerationState('error');
        return;
      }

      if (!response.ok) throw new Error('Generation failed');

      const result = await response.json();

      if (result.status === 'success') {
        setImageUrl(result.image_url);
        setGenerationState('completed');
        setErrorMessage(null);
      } else {
        console.error("API returned error:", result);
        setGenerationState('error');
        setErrorMessage(result.message || null);
      }
    } catch (e) {
      console.error("Generation error:", e);
      setGenerationState('error');
      setErrorMessage(null);
    }
  };

  const getEntityByName = (name: string) => {
    return MYTHOLOGICAL_DB.find(e => e.name.toLowerCase() === name.toLowerCase());
  };

  // Check if there are any valid relations in the DB to justify showing the Lineage Tree
  const hasValidConnections = useMemo(() => {
    const allRelations = [
      ...data.relations.parents,
      ...data.relations.conjoint,
      ...data.relations.descendants
    ];
    return allRelations.some(name => getEntityByName(name) !== undefined);
  }, [data]);

  const renderRelationLink = (name: string) => {
    const target = getEntityByName(name);
    if (target && onSelectEntity) {
      return (
        <button
          key={name}
          onClick={() => onSelectEntity(target)}
          className="text-amber-400 hover:text-amber-200 underline decoration-amber-500/30 underline-offset-4 transition-colors"
        >
          {name}
        </button>
      );
    }
    return <span key={name} className="text-stone-400">{name}</span>;
  };

  const handleImageError = () => {
    console.warn(`Failed to load image for ${data.name}. Resetting state.`);
    setImageUrl(undefined);
    setGenerationState('error');
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fadeIn pb-12">
      <div className="bg-stone-900/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-black">

        {/* Header Section */}
        <div className="relative p-6 md:p-8 pb-4 border-b border-stone-800">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-900 via-amber-600 to-stone-900"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <span className="inline-block px-3 py-1 mb-2 text-xs font-bold tracking-widest text-amber-950 bg-amber-500 rounded-full uppercase">
                {data.entity_type}
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 drop-shadow-sm">
                {data.name}
              </h1>
              <h2 className="text-xl text-stone-400 font-light mt-1 italic">
                {data.identity.cultural_role}
              </h2>
            </div>

            <div className="text-right flex flex-col items-end">
              <div className="flex items-center gap-2 text-stone-300">
                <MapPin size={16} className="text-amber-500" />
                <span className="text-sm font-medium">{data.origin.ethnicity} ({data.origin.country})</span>
              </div>
              <span className="text-xs text-stone-500 uppercase tracking-wide mt-1">
                Pantheon: {data.origin.pantheon}
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">

          {/* Left Column: Visuals */}
          <div className="md:col-span-5 bg-stone-950/50 p-6 border-b md:border-b-0 md:border-r border-stone-800 flex flex-col">

            {/* Visual Generator Area */}
            <div className="aspect-[3/4] w-full rounded-lg overflow-hidden border border-stone-800 relative group bg-black shadow-lg">

              {/* IDLE & GENERATING OVERLAYS (The "Screen") */}
              {generationState !== 'completed' && !imageUrl && (
                <div className="absolute inset-0 z-20 bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
                  {/* Grid Texture Background */}
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                  {generationState === 'idle' || generationState === 'error' ? (
                    <div className="relative z-10 flex flex-col items-center animate-fadeIn">
                      <div className="mb-6 p-4 rounded-full bg-stone-900 border border-stone-800 shadow-inner">
                        <Cpu size={32} className={`text-stone-600 ${generationState === 'error' ? 'text-red-500' : ''}`} strokeWidth={1} />
                      </div>
                      <button
                        onClick={handleGenerate}
                        className="group relative px-6 py-3 bg-amber-900/10 border border-amber-800/50 hover:bg-amber-900/30 hover:border-amber-500/80 transition-all duration-500"
                      >
                        <div className="absolute inset-0 w-1 bg-amber-500/50 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out opacity-20"></div>
                        <span className="flex items-center gap-3 text-amber-500 font-mono text-xs font-bold tracking-widest uppercase">
                          <Sparkles size={14} className="group-hover:animate-pulse" />
                          {generationState === 'error' ? 'Retry Neural Render' : 'Initialize Neural Render'}
                        </span>
                      </button>
                      <p className="mt-4 text-[9px] text-stone-600 font-mono uppercase tracking-[0.2em]">
                        {generationState === 'error' ? (errorMessage || 'Construct Failed. Retry?') : 'Awaiting User Authorization'}
                      </p>
                    </div>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center">
                      <Loader2 size={32} className="text-amber-500 animate-spin mb-4" />
                      <p className="text-amber-500/80 font-mono text-xs uppercase tracking-widest animate-pulse">
                        Synthesizing from prompt...
                      </p>
                      <div className="mt-4 w-32 h-1 bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-600 w-full animate-[translateX_-100%_1.5s_infinite]"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* COMPLETED STATE: Reveal Image or Fallback */}
              <div className={`w-full h-full transition-opacity duration-1000 ease-in-out ${generationState === 'completed' || imageUrl ? 'opacity-100' : 'opacity-0'}`}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={data.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <VisualManifestation entity={data} />
                )}
              </div>

              {/* Tech Label Overlay (Visible only after generation) */}
              <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-1000 ${generationState === 'completed' || imageUrl ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
                  <ImageIcon size={12} />
                  <span>{imageUrl ? 'Generative Render Output' : 'Abstract Reconstruction'}</span>
                </div>
              </div>
            </div>

            {/* Prompt Toggle */}
            <div className="mt-4">
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-500 hover:text-amber-500 transition-colors"
              >
                {showPrompt ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPrompt ? 'Hide GenAI Prompt' : 'View GenAI Prompt'}
              </button>

              {showPrompt && (
                <div className="animate-fadeIn mt-2">
                  <PromptBox prompt={data.appearance.image_generation_prompt} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Data */}
          <div className="md:col-span-7 p-6 md:p-8 space-y-8">

            {/* Story */}
            <section>
              <div className="flex items-center gap-2 mb-3 text-amber-500">
                <Scroll size={20} />
                <h3 className="font-serif text-lg font-bold uppercase tracking-wide">The Legend</h3>
              </div>
              <p className="text-stone-300 leading-relaxed text-lg font-light">
                {data.story.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {data.story.characteristics.map((char, i) => (
                  <span key={i} className="text-xs border border-stone-700 text-stone-400 px-2 py-1 rounded-sm uppercase tracking-wide">
                    {char}
                  </span>
                ))}
              </div>
            </section>

            {/* Contract V2: Type Specific Details */}
            <TypeSpecificDetails
              entity={data}
              className="border border-amber-900/30 bg-amber-950/10 rounded-lg p-4"
            />


            <div className="h-px bg-stone-800 w-full"></div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3 text-amber-500">
                  <Shield size={18} />
                  <h3 className="font-serif font-bold uppercase tracking-wide text-sm">Symbols & Artifacts</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...data.attributes.symbols, ...data.attributes.power_objects].map((item, i) => (
                    <span key={i} className="bg-amber-900/30 text-amber-200/80 border border-amber-900/50 px-3 py-1 rounded text-sm transition-colors hover:bg-amber-900/40 cursor-default">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3 text-amber-500">
                  <Zap size={18} />
                  <h3 className="font-serif font-bold uppercase tracking-wide text-sm">Domains</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.attributes.domains.map((item, i) => (
                    <span key={i} className="bg-stone-800 text-stone-300 px-3 py-1 rounded text-sm transition-colors hover:bg-stone-700 cursor-default">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Relations */}
            <section className="bg-stone-950/30 p-4 rounded-lg border border-stone-800 hover:border-stone-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-500">
                  <Heart size={18} />
                  <h3 className="font-serif font-bold uppercase tracking-wide text-sm">Lineage</h3>
                </div>
              </div>

              <div className="text-sm text-stone-400 space-y-2 mb-6">
                {data.relations.parents.length > 0 && (
                  <p>
                    <strong className="text-stone-500">Parents:</strong>{' '}
                    {data.relations.parents.map((name, i) => (
                      <React.Fragment key={name}>
                        {renderRelationLink(name)}
                        {i < data.relations.parents.length - 1 ? ', ' : ''}
                      </React.Fragment>
                    ))}
                  </p>
                )}
                {data.relations.conjoint.length > 0 && (
                  <p>
                    <strong className="text-stone-500">Partners:</strong>{' '}
                    {data.relations.conjoint.map((name, i) => (
                      <React.Fragment key={name}>
                        {renderRelationLink(name)}
                        {i < data.relations.conjoint.length - 1 ? ', ' : ''}
                      </React.Fragment>
                    ))}
                  </p>
                )}
                {data.relations.descendants.length > 0 && (
                  <p>
                    <strong className="text-stone-500">Descendants:</strong>{' '}
                    {data.relations.descendants.map((name, i) => (
                      <React.Fragment key={name}>
                        {renderRelationLink(name)}
                        {i < data.relations.descendants.length - 1 ? ', ' : ''}
                      </React.Fragment>
                    ))}
                  </p>
                )}
              </div>

              {hasValidConnections && onOpenLineage && (
                <button
                  onClick={onOpenLineage}
                  className="w-full py-3 bg-stone-900 border border-stone-700 hover:border-amber-500 text-stone-400 hover:text-amber-400 transition-all group rounded flex items-center justify-center gap-3"
                >
                  <GitFork size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold">
                    View Lineage Tree
                  </span>
                </button>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityCard;
