export type EntityType = 'Divinity' | 'Hero' | 'Creature';

export interface Origin {
  country: string;
  ethnicity: string;
  pantheon: string;
}

export interface Identity {
  gender: string;
  cultural_role: string;
  alignment: string;
}

export interface Attributes {
  domains: string[];
  symbols: string[];
  power_objects: string[];
  symbolic_animals: string[];
}

export interface Appearance {
  physical_signs: string[];
  manifestations: string;
  image_generation_prompt: string;
  imageUrl: string;
}

export interface Story {
  description: string;
  characteristics: string[];
}

export interface Relations {
  parents: string[];
  conjoint: string[];
  descendants: string[];
}

// --- Contract V2 Extensions ---

export interface DivinitySpecific {
  cult?: {
    offerings?: string[];
    taboos?: string[];
  };
  domains?: string[];
}

export interface HeroSpecific {
  titles?: string[];
  achievements?: string[];
  weapons_or_artifacts?: string[];
  legacy?: string;
}

export interface CreatureSpecific {
  habitat?: string[];
  powers?: string[];
  strengths?: string[];
  weaknesses?: string[];
  diet?: string;
  size?: string;
}

export interface RenderingSpecific {
  prompt_canon?: string;
  prompt_variants?: Array<{
    style_id: string;
    label: string;
    prompt: string;
  }>;
}

export interface MythologicalEntity {
  entity_type: EntityType;
  name: string;
  category: string;
  origin: Origin;
  identity: Identity;
  attributes: Attributes;
  appearance: Appearance;
  story: Story;
  relations: Relations;

  // Contract V2 Fields (Flexible: support both root and nested structures)
  type_specific?: {
    divinity?: DivinitySpecific;
    hero?: HeroSpecific;
    creature?: CreatureSpecific;
  };
  divinity?: DivinitySpecific;
  hero?: HeroSpecific;
  creature?: CreatureSpecific;
  rendering?: RenderingSpecific;
  sources?: Array<{ label: string; url: string }>;
}