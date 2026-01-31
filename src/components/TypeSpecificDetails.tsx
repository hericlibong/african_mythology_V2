import React from 'react';
import { MythologicalEntity, DivinitySpecific, HeroSpecific, CreatureSpecific } from '../types';
import { Crown, Swords, Ghost, Flame, Anchor, Bug, Sparkles, Scale, Skull } from 'lucide-react';

interface TypeSpecificDetailsProps {
    entity: MythologicalEntity;
    className?: string;
}

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-2 mb-3 text-amber-500">
        {icon}
        <h3 className="font-serif font-bold uppercase tracking-wide text-sm">{title}</h3>
    </div>
);

const DetailRow: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="mb-2">
            <span className="text-stone-500 font-mono text-xs uppercase tracking-wider mr-2">{label}:</span>
            <span className="text-stone-300 text-sm">{value}</span>
        </div>
    );
};

const TagList: React.FC<{ items: string[] }> = ({ items }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="flex flex-wrap gap-2 mt-1">
            {items.map((item, i) => (
                <span key={i} className="bg-stone-900 border border-stone-700 text-stone-400 px-2 py-1 rounded text-xs transition-colors hover:border-amber-500/50 hover:text-amber-200 cursor-default">
                    {item}
                </span>
            ))}
        </div>
    );
};

const DivinityView: React.FC<{ data: DivinitySpecific }> = ({ data }) => {
    if (!data.cult && !data.domains) return null;

    return (
        <div className="space-y-4 animate-fadeIn">
            {data.cult && (
                <div>
                    {/* Only show header if there is content inside */}
                    {(data.cult.offerings?.length || 0) > 0 || (data.cult.taboos?.length || 0) > 0 ? (
                        <SectionHeader icon={<Flame size={18} />} title="Cult & Rituals" />
                    ) : null}

                    {data.cult.offerings && data.cult.offerings.length > 0 && (
                        <div className="mb-3">
                            <span className="text-stone-500 font-mono text-xs uppercase tracking-wider block mb-1">Offerings</span>
                            <TagList items={data.cult.offerings} />
                        </div>
                    )}

                    {data.cult.taboos && data.cult.taboos.length > 0 && (
                        <div>
                            <span className="text-stone-500 font-mono text-xs uppercase tracking-wider block mb-1">Taboos</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {data.cult.taboos.map((item, i) => (
                                    <span key={i} className="bg-red-950/20 border border-red-900/30 text-red-200/60 px-2 py-1 rounded text-xs">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const HeroView: React.FC<{ data: HeroSpecific }> = ({ data }) => {
    const hasContent = data.titles?.length || data.achievements?.length || data.weapons_or_artifacts?.length || data.legacy;
    if (!hasContent) return null;

    return (
        <div className="space-y-4 animate-fadeIn">
            <SectionHeader icon={<Crown size={18} />} title="Heroic Legend" />

            {data.titles && data.titles.length > 0 && (
                <div className="mb-2">
                    <span className="text-stone-500 font-mono text-xs uppercase tracking-wider block mb-1">Titles</span>
                    <p className="text-amber-100/90 font-serif italic">{data.titles.join(", ")}</p>
                </div>
            )}

            {data.legacy && (
                <div className="p-3 bg-amber-900/10 border-l-2 border-amber-600 rounded-r">
                    <p className="text-stone-300 text-sm italic">"{data.legacy}"</p>
                </div>
            )}

            {data.achievements && data.achievements.length > 0 && (
                <div className="mt-3">
                    <span className="text-stone-500 font-mono text-xs uppercase tracking-wider block mb-1">Great Achievements</span>
                    <ul className="list-disc list-inside text-stone-300 text-sm space-y-1">
                        {data.achievements.map((ach, i) => <li key={i} className="marker:text-amber-600">{ach}</li>)}
                    </ul>
                </div>
            )}

            {data.weapons_or_artifacts && data.weapons_or_artifacts.length > 0 && (
                <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Swords size={12} className="text-stone-500" />
                        <span className="text-stone-500 font-mono text-xs uppercase tracking-wider">Legendary Gear</span>
                    </div>
                    <TagList items={data.weapons_or_artifacts} />
                </div>
            )}
        </div>
    );
};

const CreatureView: React.FC<{ data: CreatureSpecific }> = ({ data }) => {
    const hasContent = data.habitat?.length || data.powers?.length || data.strengths?.length || data.weaknesses?.length || data.diet || data.size;
    if (!hasContent) return null;

    return (
        <div className="space-y-4 animate-fadeIn">
            <SectionHeader icon={<Ghost size={18} />} title="Creature Traits" />

            <div className="grid grid-cols-2 gap-4">
                {data.size && <DetailRow label="Size" value={data.size} />}
                {data.diet && <DetailRow label="Diet" value={data.diet} />}
            </div>

            {data.habitat && data.habitat.length > 0 && (
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Anchor size={12} className="text-stone-500" />
                        <span className="text-stone-500 font-mono text-xs uppercase tracking-wider">Habitat</span>
                    </div>
                    <TagList items={data.habitat} />
                </div>
            )}

            {data.powers && data.powers.length > 0 && (
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={12} className="text-amber-500" />
                        <span className="text-stone-500 font-mono text-xs uppercase tracking-wider">Special Powers</span>
                    </div>
                    <TagList items={data.powers} />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {data.strengths && data.strengths.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Scale size={12} className="text-green-500/70" />
                            <span className="text-stone-500 font-mono text-xs uppercase tracking-wider">Strengths</span>
                        </div>
                        <TagList items={data.strengths} />
                    </div>
                )}

                {data.weaknesses && data.weaknesses.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Skull size={12} className="text-red-500/70" />
                            <span className="text-stone-500 font-mono text-xs uppercase tracking-wider">Weaknesses</span>
                        </div>
                        <TagList items={data.weaknesses} />
                    </div>
                )}
            </div>
        </div>
    );
};

const TypeSpecificDetails: React.FC<TypeSpecificDetailsProps> = ({ entity, className }) => {
    // Resolve data: check nested `type_specific` first, then root level
    const divinityData = entity.type_specific?.divinity || entity.divinity;
    const heroData = entity.type_specific?.hero || entity.hero;
    const creatureData = entity.type_specific?.creature || entity.creature;

    let content = null;

    // Determine which type to show based on entity.entity_type
    // but safely checking if the data exists

    if (entity.entity_type === 'Divinity' && divinityData) {
        content = <DivinityView data={divinityData} />;
    } else if (entity.entity_type === 'Hero' && heroData) {
        content = <HeroView data={heroData} />;
    } else if (entity.entity_type === 'Creature' && creatureData) {
        content = <CreatureView data={creatureData} />;
    }

    if (!content) return null;

    return (
        <div className={className}>
            {content}
        </div>
    );
};

export default TypeSpecificDetails;
