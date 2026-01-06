
import { MythologicalEntity } from '../types';
import mythologyData from '../data/mythology_data.json';

/**
 * The Living Archive Database
 * A premium curated collection of African mythological figures.
 * High-fidelity descriptions and AI prompt engineering for archival depth.
 */
export const MYTHOLOGICAL_DB: MythologicalEntity[] = mythologyData as MythologicalEntity[];

/**
 * Advanced search engine for the archive.
 * Filters across multiple fields using word boundaries to avoid false positives.
 */
export const searchEntities = (query: string): MythologicalEntity[] => {
  const q = query.trim();
  if (!q) return [];

  // Create regex with word boundaries to prevent substring matches (e.g., 'Mali' in 'malice')
  const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp("\\b" + escapedQuery + "\\b", "i");
  
  return MYTHOLOGICAL_DB.filter(e => 
    regex.test(e.name) ||
    regex.test(e.origin.country) ||
    regex.test(e.origin.ethnicity) ||
    regex.test(e.identity.cultural_role) ||
    regex.test(e.category) ||
    regex.test(e.story.description) ||
    e.attributes.domains.some(d => regex.test(d))
  );
};

/**
 * Returns a truly random entity from the database for discovery purposes.
 */
export const getRandomEntity = (): MythologicalEntity => {
  const index = Math.floor(Math.random() * MYTHOLOGICAL_DB.length);
  return MYTHOLOGICAL_DB[index];
};
