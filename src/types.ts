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
}