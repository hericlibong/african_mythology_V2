
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import EntityCard from './components/EntityCard';
import MiniCard from './components/MiniCard';
import LandingPage from './components/LandingPage';
import AboutPage from './components/AboutPage';
import MapPage from './components/MapPage';
import LineageTree from './components/LineageTree';
import TypesLobby from './components/TypesLobby';
import FilteredList from './components/FilteredList';
import { MythologicalEntity, EntityType } from './types';
import { searchEntities, getRandomEntity, MYTHOLOGICAL_DB } from './services/mockData';
import { Dices, Sparkles, ArrowLeft } from 'lucide-react';

type ViewState = 'landing' | 'archive' | 'about' | 'map' | 'lineage' | 'types';

// Parse URL hash to extract view and entity
const parseHash = (): { view: ViewState; entityName?: string; typeFilter?: EntityType } => {
  const hash = window.location.hash.slice(1); // Remove '#'
  if (!hash) return { view: 'landing' };

  const parts = hash.split('/');
  const viewPart = parts[0] as ViewState;

  const validViews: ViewState[] = ['landing', 'archive', 'about', 'map', 'lineage', 'types'];
  if (!validViews.includes(viewPart)) return { view: 'landing' };

  const result: { view: ViewState; entityName?: string; typeFilter?: EntityType } = { view: viewPart };

  // Parse entity or type filter from path
  if (parts[1]) {
    if (viewPart === 'types' && ['Divinity', 'Hero', 'Creature'].includes(parts[1])) {
      result.typeFilter = parts[1] as EntityType;
    } else {
      result.entityName = decodeURIComponent(parts[1]);
    }
  }

  return result;
};

// Build hash from state
const buildHash = (view: ViewState, entityName?: string, typeFilter?: EntityType): string => {
  if (view === 'landing') return '';
  let hash = view;
  if (view === 'archive' && entityName) {
    hash += '/' + encodeURIComponent(entityName);
  } else if (view === 'types' && typeFilter) {
    hash += '/' + typeFilter;
  } else if (view === 'lineage' && entityName) {
    hash += '/' + encodeURIComponent(entityName);
  }
  return hash;
};

const App: React.FC = () => {
  // Initialize state from URL hash
  const initialState = parseHash();

  const [view, setView] = useState<ViewState>(initialState.view);
  const [results, setResults] = useState<MythologicalEntity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<MythologicalEntity | null>(() => {
    if (initialState.entityName) {
      return MYTHOLOGICAL_DB.find(e => e.name.toLowerCase() === initialState.entityName!.toLowerCase()) || null;
    }
    return null;
  });
  const [lineageFocusEntity, setLineageFocusEntity] = useState<MythologicalEntity | null>(() => {
    if (initialState.view === 'lineage' && initialState.entityName) {
      return MYTHOLOGICAL_DB.find(e => e.name.toLowerCase() === initialState.entityName!.toLowerCase()) || null;
    }
    return null;
  });

  // New State for Type Filtering
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<EntityType | null>(initialState.typeFilter || null);

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(initialState.view === 'archive' && !!initialState.entityName);

  // Sync URL hash when state changes
  useEffect(() => {
    const entityName = view === 'lineage' ? lineageFocusEntity?.name : selectedEntity?.name;
    const newHash = buildHash(view, entityName, selectedTypeFilter || undefined);

    if (window.location.hash.slice(1) !== newHash) {
      window.location.hash = newHash;
    }
  }, [view, selectedEntity, lineageFocusEntity, selectedTypeFilter]);

  // Listen for browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const state = parseHash();
      setView(state.view);

      if (state.entityName) {
        const entity = MYTHOLOGICAL_DB.find(e => e.name.toLowerCase() === state.entityName!.toLowerCase());
        if (state.view === 'lineage') {
          setLineageFocusEntity(entity || null);
        } else {
          setSelectedEntity(entity || null);
          if (entity) setHasSearched(true);
        }
      } else {
        setSelectedEntity(null);
        setLineageFocusEntity(null);
      }

      if (state.typeFilter) {
        setSelectedTypeFilter(state.typeFilter);
      } else {
        setSelectedTypeFilter(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // --- Actions ---

  const handleSearch = (query: string) => {
    setView('archive');
    setLoading(true);
    setHasSearched(true);
    setSelectedEntity(null);
    setResults([]);

    setTimeout(() => {
      const found = searchEntities(query);
      if (found.length === 1) {
        setSelectedEntity(found[0]);
      } else {
        setResults(found);
      }
      setLoading(false);
    }, 800);
  };

  const handleRandomDiscovery = () => {
    setView('archive');
    setLoading(true);
    setHasSearched(true);
    setSelectedEntity(null);
    setResults([]);

    setTimeout(() => {
      const result = getRandomEntity();
      setSelectedEntity(result);
      setLoading(false);
    }, 600);
  };

  const resetToHome = () => {
    setView('landing');
  };

  const handleSelectEntity = (entity: MythologicalEntity) => {
    setSelectedEntity(entity);
    // If coming from types, we can either stay in 'types' view showing the card, 
    // or switch to 'archive'. For consistency with search, let's use 'archive' view logic 
    // but we need to ensure the card is shown.
    // However, to keep the context "Back to categories", let's handle it within 'types' view?
    // Simplified approach: View card in 'archive' mode effectively.
    if (view === 'map' || view === 'lineage' || view === 'types') {
      setView('archive');
    }
  };

  const handleOpenLineage = (entity: MythologicalEntity) => {
    setLineageFocusEntity(entity);
    setView('lineage');
  };

  const handleImageGenerated = (entityName: string, styleId: string, url: string) => {
    // 1. Update In-Memory DB (Persistence within session)
    const dbEntity = MYTHOLOGICAL_DB.find(e => e.name === entityName);
    if (dbEntity) {
      if (!dbEntity.rendering) {
        dbEntity.rendering = { images: {}, prompt_canon: '', prompt_variants: [] };
      }
      if (!dbEntity.rendering.images) {
        dbEntity.rendering.images = {};
      }
      dbEntity.rendering.images[styleId] = url;
    }

    // 2. Update Search Results State (Triggers MiniCard re-render)
    setResults(prevResults => prevResults.map(p => {
      if (p.name === entityName) {
        // Create a deep copy to ensure React detects the change
        const updated = { ...p };
        // Ensure rendering object exists
        if (!updated.rendering) updated.rendering = { images: {}, prompt_canon: '', prompt_variants: [] };
        if (!updated.rendering.images) updated.rendering.images = {};

        // Update image
        updated.rendering.images = {
          // Keep existing images
          ...updated.rendering.images,
          [styleId]: url,
        };
        return updated;
      }
      return p;
    }));

    // 3. Update Selected Entity State (if needed, though EntityCard handles its own local state mostly)
    if (selectedEntity?.name === entityName) {
      setSelectedEntity(prev => {
        if (!prev) return null;
        const updated = { ...prev };
        if (!updated.rendering) updated.rendering = { images: {}, prompt_canon: '', prompt_variants: [] };
        if (!updated.rendering.images) updated.rendering.images = {};
        updated.rendering.images = { ...updated.rendering.images, [styleId]: url };
        return updated;
      });
    }
  };

  // --- Render Helpers ---

  const renderArchive = () => (
    <div className="container mx-auto px-4 pt-24 pb-12 flex flex-col min-h-screen">
      {/* Search Header */}
      <div className={`transition-all duration-700 ease-in-out flex flex-col items-center ${hasSearched ? 'mt-4 mb-8' : 'mt-[10vh] mb-12'}`}>
        <h1 className={`font-serif text-center font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-amber-100 via-stone-300 to-stone-600 drop-shadow-lg transition-all duration-700 ${hasSearched ? 'text-3xl mb-4' : 'text-5xl md:text-7xl mb-6'}`}>
          Search The <span className="text-amber-600">Archive</span>
        </h1>
        <p className={`text-stone-400 text-center max-w-lg mx-auto mb-8 font-light text-lg transition-opacity duration-500 ${hasSearched ? 'opacity-0 h-0 overflow-hidden m-0' : 'opacity-100'}`}>
          Discover lost and found myths from Sub-Saharan Africa.
          Experience Divinities, Heroes, and Creatures reimagined by AI.
        </p>
      </div>

      {/* Search Section */}
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto mb-12 relative z-10">
        <SearchBar onSearch={handleSearch} isLoading={loading} />

        <button
          onClick={handleRandomDiscovery}
          disabled={loading}
          className="mt-4 flex items-center gap-2 px-6 py-2 rounded-full border border-stone-800 bg-stone-900/50 text-stone-400 text-sm hover:text-amber-400 hover:border-amber-500/50 hover:bg-stone-800 transition-all duration-300 group"
        >
          <Dices size={16} className="group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-mono tracking-wide">Random Discovery</span>
          <Sparkles size={14} className="opacity-0 group-hover:opacity-100 text-amber-500 transition-opacity" />
        </button>
      </div>

      {/* Results Section */}
      <div className="flex-grow w-full relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-500/50 pt-12 animate-pulse z-20">
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
            <p className="font-mono text-sm tracking-widest uppercase">Querying Ancestral Nexus...</p>
          </div>
        )}

        {!loading && results.length > 0 && !selectedEntity && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-stone-800">
              <h2 className="font-serif text-xl text-stone-400 uppercase tracking-widest">
                Found {results.length} Chronicles
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((entity) => (
                <MiniCard key={entity.name} entity={entity} onClick={() => handleSelectEntity(entity)} />
              ))}
            </div>
          </div>
        )}

        {!loading && selectedEntity && (
          <div className="animate-fadeIn">
            {results.length > 1 && (
              <button
                onClick={() => setSelectedEntity(null)}
                className="mb-6 flex items-center gap-2 text-xs font-mono uppercase text-stone-500 hover:text-amber-500 transition-colors"
              >
                <ArrowLeft size={14} /> Back to selection
              </button>
            )}
            <EntityCard
              key={selectedEntity.name}
              data={selectedEntity}
              onSelectEntity={handleSelectEntity}
              onOpenLineage={() => handleOpenLineage(selectedEntity)}
              onImageGenerated={(styleId, url) => handleImageGenerated(selectedEntity.name, styleId, url)}
            />
          </div>
        )}

        {!loading && hasSearched && !selectedEntity && results.length === 0 && (
          <div className="text-center mt-12 animate-fadeIn">
            <div className="inline-block p-6 rounded-lg bg-stone-900/50 border border-stone-800">
              <p className="text-stone-400 font-serif text-lg">No myths found in the archive matching this query.</p>
              <p className="text-stone-600 text-sm mt-2 italic">Try search terms like "Nile", "Spider", "Thunder", or "Water"...</p>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-20 border-t border-stone-900 pt-8 text-center">
        <p className="text-stone-600 text-sm font-mono">
          &copy; {new Date().getFullYear()} Living Archive • Afro-Futurism Methodology
        </p>
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 selection:bg-amber-500/30 selection:text-amber-200 font-sans overflow-x-hidden">

      {/* Persistent Navbar */}
      <Navbar
        currentView={view === 'lineage' ? 'archive' : view}
        onHomeClick={resetToHome}
        onSearchClick={() => setView('archive')}
        onMapClick={() => setView('map')}
        onAboutClick={() => setView('about')}
        onTypesClick={() => {
          setView('types');
          setSelectedTypeFilter(null); // Reset filter when clicking main nav
        }}
      />

      {/* Ambient Background Effects (Global) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-amber-900/5 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-900/5 blur-[100px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
      </div>

      {/* Main View Router */}
      <main className="relative z-10">
        {view === 'landing' && <LandingPage onEnter={() => setView('archive')} />}
        {view === 'archive' && renderArchive()}
        {view === 'map' && <MapPage onSelectEntity={handleSelectEntity} />}

        {view === 'types' && !selectedTypeFilter && (
          <TypesLobby onSelectType={(type) => setSelectedTypeFilter(type)} />
        )}
        {view === 'types' && selectedTypeFilter && (
          <FilteredList
            category={selectedTypeFilter}
            onBack={() => setSelectedTypeFilter(null)}
            onSelectEntity={handleSelectEntity}
          />
        )}

        {view === 'lineage' && lineageFocusEntity && (
          <LineageTree
            focusEntity={lineageFocusEntity}
            onClose={() => setView('archive')}
            onNodeClick={handleOpenLineage}
          />
        )}
        {view === 'about' && <AboutPage onBack={() => setView('archive')} />}
      </main>

    </div>
  );
};

export default App;
