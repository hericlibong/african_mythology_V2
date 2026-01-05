import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-red-500 to-amber-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-stone-900 ring-1 ring-stone-800 rounded-lg shadow-xl overflow-hidden">
          <input
            type="text"
            className="w-full bg-transparent text-stone-200 px-6 py-4 text-lg placeholder-stone-600 focus:outline-none font-serif"
            placeholder="Search for a deity, hero, creature..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-4 text-amber-500 hover:text-amber-300 hover:bg-stone-800/50 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
          </button>
        </div>
      </form>
      <div className="flex justify-center gap-4 mt-3 text-xs text-stone-500 font-mono tracking-tight uppercase">
        <span className="hover:text-amber-500 cursor-pointer transition-colors" onClick={() => setQuery("Yoruba")}>Yoruba</span>
        <span className="text-stone-700">•</span>
        <span className="hover:text-amber-500 cursor-pointer transition-colors" onClick={() => setQuery("Water")}>Water</span>
        <span className="text-stone-700">•</span>
        <span className="hover:text-amber-500 cursor-pointer transition-colors" onClick={() => setQuery("Trickster")}>Trickster</span>
        <span className="text-stone-700">•</span>
        <span className="hover:text-amber-500 cursor-pointer transition-colors" onClick={() => setQuery("Warrior")}>Warrior</span>
      </div>
    </div>
  );
};

export default SearchBar;