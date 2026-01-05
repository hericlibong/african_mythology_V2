import React from 'react';
import { BookOpen, Share2, Cpu, ArrowLeft } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 selection:bg-amber-500/30 font-sans pb-20">
      
      {/* Editorial Header */}
      <header className="relative pt-32 pb-16 px-6 text-center border-b border-stone-900">
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors uppercase tracking-widest text-xs font-mono"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-4">
          CULTURAL <span className="text-amber-700">MANIFESTO</span>
        </h1>
        <p className="text-stone-500 font-mono text-sm uppercase tracking-[0.2em]">
          The methodology behind the Archive
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-16 space-y-24">
        
        {/* Pillar 1: Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-amber-500">
              <BookOpen size={32} strokeWidth={1.5} />
              <h2 className="font-serif text-3xl font-bold uppercase tracking-wide">The Vision</h2>
            </div>
            <h3 className="text-xl font-serif italic text-stone-400">"Building the Digital Pantheon"</h3>
            <div className="space-y-4 leading-relaxed text-stone-300 font-light">
              <p>
                The belief systems of Sub-Saharan Africa are not a singular mythology, but a brilliant constellation of regional belief systems—Yoruba, Dogon, Zulu, Akan, and beyond. 
              </p>
              <p>
                Unlike the hyper-documented records of Greek or Egyptian antiquity, these narratives are often fragmented. The Living Archive aims to consolidate these records into a coherent <strong>Digital Pantheon</strong>, celebrating the complexity of entities like <em>Mami Wata</em>—who transcends borders to serve as a divinity, an spirit, or a creature depending on the cultural topography.
              </p>
            </div>
          </div>
          <div className="aspect-square bg-stone-900/50 rounded-2xl border border-stone-800 flex items-center justify-center p-12 overflow-hidden group">
             <div className="relative text-center space-y-4">
                <div className="text-stone-700 group-hover:text-amber-900/40 transition-colors text-9xl font-serif absolute inset-0 flex items-center justify-center pointer-events-none -z-10">01</div>
                <p className="text-amber-600/60 font-mono text-xs uppercase tracking-[0.3em]">Status: Reclaiming the visual narrative</p>
             </div>
          </div>
        </section>

        {/* Pillar 2: Ambition */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start md:flex-row-reverse">
          <div className="md:order-2 space-y-6">
            <div className="flex items-center gap-4 text-amber-500">
              <Share2 size={32} strokeWidth={1.5} />
              <h2 className="font-serif text-3xl font-bold uppercase tracking-wide">The Ambition</h2>
            </div>
            <h3 className="text-xl font-serif italic text-stone-400">"Beyond the Aesthetic - A Research Tool"</h3>
            <div className="space-y-4 leading-relaxed text-stone-300 font-light">
              <p>
                This application is designed as the first step toward a structured cultural cartography. We seek to map the invisible connections, the cross-border genealogies, and the shared influences that underpin these cultures.
              </p>
              <p>
                Our long-term goal is to move beyond isolated records to reveal how these ancient rites influence modern African imagination. We are building a tool for scholars, artists, and creators to navigate the depths of the ancestral nexus.
              </p>
            </div>
          </div>
          <div className="md:order-1 aspect-square bg-stone-900/50 rounded-2xl border border-stone-800 flex items-center justify-center p-12 overflow-hidden group">
             <div className="relative text-center space-y-4">
                <div className="text-stone-700 group-hover:text-amber-900/40 transition-colors text-9xl font-serif absolute inset-0 flex items-center justify-center pointer-events-none -z-10">02</div>
                <p className="text-amber-600/60 font-mono text-xs uppercase tracking-[0.3em]">Status: Mapping hidden genealogies</p>
             </div>
          </div>
        </section>

        {/* Pillar 3: Engine */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-amber-500">
              <Cpu size={32} strokeWidth={1.5} />
              <h2 className="font-serif text-3xl font-bold uppercase tracking-wide">The Engine</h2>
            </div>
            <h3 className="text-xl font-serif italic text-stone-400">"AI as the Cultural Weaver"</h3>
            <div className="space-y-4 leading-relaxed text-stone-300 font-light">
              <p>
                We leverage the reasoning capabilities of Gemini to synthesize diverse and scattered sources into a unified interface. Our prompt engineering bridges folklore and futurism, manifesting descriptors into high-fidelity visualizations.
              </p>
              <div className="p-4 bg-amber-900/10 border border-amber-900/30 rounded-lg text-amber-200/70 text-sm italic font-sans">
                "Note: These images are AI interpretations generated from cultural descriptors provided by the models. They are artistic manifestations of the oral record, not archaeological artifacts."
              </div>
            </div>
          </div>
          <div className="aspect-square bg-stone-900/50 rounded-2xl border border-stone-800 flex items-center justify-center p-12 overflow-hidden group">
             <div className="relative text-center space-y-4">
                <div className="text-stone-700 group-hover:text-amber-900/40 transition-colors text-9xl font-serif absolute inset-0 flex items-center justify-center pointer-events-none -z-10">03</div>
                <p className="text-amber-600/60 font-mono text-xs uppercase tracking-[0.3em]">Status: Gemini Pro Logic Layer</p>
             </div>
          </div>
        </section>

        {/* CTA Footer */}
        <footer className="pt-20 text-center border-t border-stone-900">
          <button 
            onClick={onBack}
            className="px-12 py-5 border border-amber-800 text-amber-500 font-bold tracking-widest uppercase hover:bg-amber-900/20 transition-all rounded-sm"
          >
            Enter The Archive
          </button>
        </footer>
      </main>
    </div>
  );
};

export default AboutPage;