# Living Archives — Entity Contract v2 (Spec)

This document defines **Contract v2** for mythological entities in *Living Archives*.

The current dataset (`src/data/mythology_data.json`) uses a **single unified schema** for all entity types. Contract v2 keeps that compatibility, while re-introducing **type-specific fields** (as in the original Django models) so that:

- A **Divinity** can express cult, domains, manifestations, etc.
- A **Hero** can express titles, achievements, allies/enemies, legacy, etc.
- A **Creature** can express habitat, powers, weaknesses, encounter rules, etc.

> **Display rule (product principle):** the UI MUST only show sections that have meaningful content.  
> No placeholders, no “missing data” panels.

---

## 1) Design principles

1. **Compatibility-first**
   - Existing keys remain valid: `origin`, `identity`, `attributes`, `appearance`, `story`, `relations`.
   - New fields are additive.

2. **Common trunk + type extensions**
   - A minimal shared “trunk” keeps the app simple.
   - Type extensions prevent flattening (Hero ≠ Divinity ≠ Creature).

3. **User-generated visuals**
   - Images are optional. The app must work with `imageUrl` empty.
   - Users generate images; the contract supports multiple prompts and styles.

4. **No forced knowledge**
   - Genealogy/relations/sources can be empty.
   - Empty means “unknown or not curated yet”, not “error”.

---

## 2) Entity trunk (common fields)

### 2.1 Required
- `entity_type`: `"Divinity" | "Hero" | "Creature"`
- `name`: string
- `category`: string

### 2.2 Optional (but supported everywhere)

#### `origin`
- `country`: string
- `ethnicity`: string
- `pantheon`: string

#### `identity`
- `gender`: string
- `cultural_role`: string
- `alignment`: string *(UX-only, never treated as canonical truth)*

#### `story`
- `description`: string
- `characteristics`: string[]

#### `relations`
- `parents`: string[]
- `conjoint`: string[]
- `descendants`: string[]

#### `appearance`
- `physical_signs`: string[]
- `manifestations`: string | null
- `image_generation_prompt`: string *(legacy single prompt)*
- `imageUrl`: string *(user-generated image path or URL; can be empty)*

---

## 3) Contract v2 additions

### 3.1 Governance (optional, non-intrusive)

#### `verification` *(optional)*
- `status`: `"draft" | "reviewed" | "curated"`
- `confidence`: number *(0..1)*
- `notes`: string

#### `sources` *(optional)*
Array of:
- `label`: string
- `url`: string
- `type`: `"book" | "article" | "encyclopedia" | "museum" | "oral" | "other"`
- `accessed_at`: string *(ISO date)*

> Rule: if `sources` is empty, the UI shows nothing (no “sources” section).

---

### 3.2 Rendering block (image prompts, styles)

#### `rendering` *(optional)*
- `prompt_canon`: string  
  The faithful prompt aligned with attributes (content stays constant).
- `prompt_variants`: array of:
  - `style_id`: string *(e.g. `yoruba_traditional`, `photoreal`, `manga`, `comic`, `modern_african_painting`)*
  - `label`: string
  - `prompt`: string
  - `notes`: string *(optional)*
- `negative_prompt`: string *(optional)*

> Rule: Users can choose a style variant.  
> The system never auto-replaces the canon; it only proposes.

---

### 3.3 Type-specific extensions (the core of v2)

Add one of the following blocks depending on `entity_type`:

- `divinity` for `Divinity`
- `hero` for `Hero`
- `creature` for `Creature`

All of them are optional fields inside their block. Empty block = do not render.

---

## 4) Type blocks

### 4.1 `divinity` (Divinity-specific)
- `domains`: string[] *(can mirror legacy `attributes.domains`)*
- `symbols`: string[] *(can mirror legacy)*
- `power_objects`: string[] *(can mirror legacy)*
- `symbolic_animals`: string[] *(can mirror legacy)*
- `cult` *(optional)*:
  - `rituals`: string[]
  - `offerings`: string[]
  - `taboos`: string[]
  - `places`: string[]
  - `festivals`: string[]
- `genealogy` *(optional)*:
  - `parents`: string[]
  - `consorts`: string[]
  - `descendants`: string[]

> Migration note: legacy `attributes.*` can remain; `divinity.*` is the richer home.

---

### 4.2 `hero` (Hero-specific)
- `titles`: string[]
- `achievements`: string[]
- `quests`: string[]
- `allies`: string[]
- `enemies`: string[]
- `weapons_or_artifacts`: string[]
- `legacy`: string
- `historical_context`: string *(optional, can be vague)*
- `genealogy` *(optional)*:
  - `parents`: string[]
  - `descendants`: string[]
  - `lineage_notes`: string

> A Hero can still have `attributes` in legacy data, but the hero identity is driven by achievements/legacy.

---

### 4.3 `creature` (Creature-specific)
- `habitat`: string[] | string
- `powers`: string[]
- `strengths`: string[]
- `weaknesses`: string[]
- `diet`: string
- `size`: string
- `appearance_notes`: string
- `encounter` *(optional)*:
  - `omens`: string[]
  - `rules_to_survive`: string[]
  - `known_sightings`: string[]
- `threat_level`: `"low" | "medium" | "high" | "mythic"` *(optional)*

> Creatures are described by environment + signs + behavior, not by divinity-like domains.

---

## 5) UI display rules (non-negotiable)

1. **Hide empty sections**  
   If a block or list is empty, it is not rendered.
2. **No “missing data” messaging**  
   Unknown information stays silent.
3. **Rendering choices are optional**  
   If only `appearance.image_generation_prompt` exists, keep working.
4. **Relations are optional**  
   Show them only when non-empty.

---

## 6) JSON examples (v2)

### 6.1 Divinity example (v2-compatible)
```json
{
  "entity_type": "Divinity",
  "name": "Shango",
  "category": "Orisha of Lightning",
  "origin": { "country": "Nigeria", "ethnicity": "Yoruba", "pantheon": "Orisha" },
  "identity": { "gender": "Male", "cultural_role": "God of Thunder and Royal Justice", "alignment": "Chaotic Good" },
  "attributes": {
    "domains": ["Thunder", "Lightning", "Justice", "Dance"],
    "symbols": ["Double-headed axe", "Red and White Beads"],
    "power_objects": ["Oshe Shango"],
    "symbolic_animals": ["Ram"]
  },
  "appearance": {
    "physical_signs": ["Regal red robes"],
    "manifestations": "A powerful warrior king who controls the storm.",
    "image_generation_prompt": "LEGACY_PROMPT",
    "imageUrl": ""
  },
  "divinity": {
    "cult": {
      "offerings": ["Kola nuts", "Palm wine"],
      "taboos": ["(optional)"]
    }
  },
  "rendering": {
    "prompt_canon": "CANON_PROMPT",
    "prompt_variants": [
      { "style_id": "yoruba_traditional", "label": "Yoruba traditional pictural", "prompt": "STYLE_PROMPT" },
      { "style_id": "photoreal", "label": "Photorealistic", "prompt": "STYLE_PROMPT" }
    ]
  },
  "sources": [
    { "label": "Reference", "url": "https://example.org", "type": "encyclopedia", "accessed_at": "2026-01-28" }
  ]
}
```

### 6.2 Hero example (v2-compatible)
```json
{
  "entity_type": "Hero",
  "name": "Oranmiyan",
  "category": "Warrior King",
  "origin": { "country": "Nigeria", "ethnicity": "Yoruba", "pantheon": "Legendary" },
  "identity": { "gender": "Male", "cultural_role": "Conqueror and Founder of Empires" },
  "appearance": { "image_generation_prompt": "LEGACY_PROMPT", "imageUrl": "" },
  "story": {
    "description": "Founder figure associated with the rise of Oyo and Benin traditions.",
    "characteristics": ["Indomitable", "Strategic"]
  },
  "hero": {
    "titles": ["Founder", "Warrior king"],
    "achievements": ["Founded dynastic legitimacy", "Associated with Opa Oranmiyan"],
    "allies": [],
    "enemies": [],
    "weapons_or_artifacts": ["Opa Oranmiyan"],
    "legacy": "A pillar symbol remains as a material memory."
  }
}
```

### 6.3 Creature example (v2-compatible)
```json
{
  "entity_type": "Creature",
  "name": "Dingonek",
  "category": "River Monster",
  "origin": { "country": "Kenya", "ethnicity": "Wandorobo", "pantheon": "East African Cryptids" },
  "identity": { "gender": "Neutral", "cultural_role": "Apex aquatic predator" },
  "appearance": { "image_generation_prompt": "LEGACY_PROMPT", "imageUrl": "" },
  "story": { "description": "A feared aquatic beast described through sightings and danger.", "characteristics": ["Fierce", "Armored"] },
  "creature": {
    "habitat": ["Rivers", "Lakes"],
    "powers": ["Ambush predation"],
    "strengths": ["Armor-like scales"],
    "weaknesses": [],
    "diet": "Carnivorous",
    "size": "Large"
  }
}
```

---

## 7) Migration strategy (minimal risk)

1. **Additive first**: accept v2 blocks without changing existing rendering.
2. **UI evolution**: render `divinity/hero/creature` blocks only when present.
3. **Gradual enrichment**: update a small subset of entities (pilot set) before scaling.

---

## 8) Non-goals (for now)

- No automatic “truth engine”.
- No forced genealogy completion.
- No default images shipped with the dataset.


Voici un contenu **prêt à copier-coller** pour compléter l’issue #18 (Docs : mapping Contract V2 → UI + convention des styles).
Tu peux le mettre dans `docs/CONTRACT_V2.md` (ou en addendum à la fin).

---

## Addendum — Contract V2 : mapping UI + convention des styles (render)

### Objectif

Fixer une convention stable pour que :

* l’enrichissement futur soit **mécanique** (400+ entités),
* le frontend sache **quoi afficher** sans heuristique,
* la génération d’images multi-style reste **compatible** avec l’existant.

---

## 1) Règle “silent add” (principe)


* Toute entité possède les blocs type_specific et rendering.

* Ces blocs font partie du contrat structurel, pas de l’enrichissement.

* Ils peuvent être :

  vides,

* partiellement remplis,

* ou pleinement enrichis.

* 👉 L’absence d’affichage vient d’un manque de données, pas d’un manque de structure.

* 👉 Conséquence : on peut enrichir progressivement (entité par entité) sans casser le site.

---

## 2) Structure officielle : `type_specific`

`type_specific` contient les champs propres au type de l’entité (divinity / hero / creature).

* Type : objet libre (clé/valeur), mais **mêmes clés recommandées** par type.
* Si absent : aucune section “type” ajoutée dans l’UI.

Exemples de clés recommandées (indicatives) :

* **divinity** : `domains`, `symbols`, `rituals`, `taboos`
* **hero** : `quests`, `weapons`, `allies`, `enemies`
* **creature** : `habitat`, `abilities`, `weaknesses`, `omens`

---

## 3) Structure officielle : `rendering`

Le bloc `rendering` sert à gérer la génération d’images **par style**.

### 3.1 `rendering.images`

* Dictionnaire `style_id -> url`
* Sert à afficher la **pastille verte** et l’image au clic.

Exemple :

```json
"rendering": {
  "images": {
    "photoreal": "https://.../mami_wata.png",
    "manga": "https://.../mami_wata_manga.png"
  }
}
```

### 3.2 `rendering.prompt_canon`

* Prompt “canon” (référence) utilisé pour **photoreal**.
* Si absent, fallback legacy : `appearance.image_generation_prompt`.

### 3.3 `rendering.prompt_variants`

* Liste des prompts alternatifs (un prompt par style).
* Chaque item contient :

  * `style_id` (obligatoire)
  * `prompt` (obligatoire)

Exemple :

```json
"prompt_variants": [
  { "style_id": "manga", "prompt": "..." },
  { "style_id": "comic_marvel", "prompt": "..." }
]
```

---

## 4) Convention des `style_id` (référence unique)

Liste officielle des styles supportés côté UI + API :

* `photoreal` (canon / legacy compatible)
* `regional_or_ethnic`
* `manga`
* `comic_marvel`
* `modern_african_painting`

Règle :

* **Un bouton UI = un style_id**
* **Une image générée = stockée dans rendering.images[style_id]**

---

## 5) Mapping UI (règles simples)

### 5.1 Affichage des boutons de style

* L’UI affiche le bouton **Photoreal** si :

  * `rendering.prompt_canon` existe **OU**
  * `appearance.image_generation_prompt` existe (legacy)
* L’UI affiche un bouton variant (ex: Manga) si :

  * `rendering.prompt_variants` contient un item avec `style_id` correspondant **et** un `prompt` non vide

### 5.2 Affichage des pastilles (indicateur “image dispo”)

* Pastille verte sur un style si :

  * `rendering.images[style_id]` existe (URL non vide)

---

## 6) Exemple JSON complet (3 entités)

> Objectif : montrer la convention “enrichi vs non enrichi” + multi-style.

### 6.1 Divinity (enrichie, multi-style)

```json
{
  "name": "Mami Wata",
  "type": "divinity",
  "subtitle": "Sovereign Spirit of the Oceans",
  "origin": { "region": "Multi-ethnic (Pan-African)", "pantheon": "Vodun / Diaspora" },

  "appearance": {
    "imageUrl": "https://.../mami_wata.png",
    "image_generation_prompt": "A hyper-realistic cinematic shot of Mami Wata..."
  },

  "story": {
    "legend": "The 'Mother of Waters' who controls the wealth of the seas..."
  },

  "type_specific": {
    "domains": ["Water", "Wealth", "Beauty", "Seduction"],
    "symbols": ["Snake", "Mirror", "Golden Comb"],
    "rituals": ["Perfume", "White Kaolin", "Sweet fruits"],
    "taboos": ["Disrespecting water"]
  },

  "rendering": {
    "prompt_canon": "A hyper-realistic cinematic shot of Mami Wata... (canon version)",
    "prompt_variants": [
      {
        "style_id": "regional_or_ethnic",
        "prompt": "Mami Wata depicted in the style of vivid West African shrine chromolithography..."
      },
      {
        "style_id": "manga",
        "prompt": "Mami Wata in high-quality anime style..."
      },
      {
        "style_id": "comic_marvel",
        "prompt": "Mami Wata as a powerful comic book superheroine..."
      },
      {
        "style_id": "modern_african_painting",
        "prompt": "Abstract contemporary oil painting, Mami Wata..."
      }
    ],
    "images": {
      "photoreal": "https://.../mami_wata.png",
      "manga": "https://.../mami_wata_manga.png"
    }
  }
}
```

### 6.2 Hero (non enrichi, legacy only)

```json
{
  "name": "Oduduwa",
  "type": "hero",
  "subtitle": "Founder figure",
  "appearance": {
    "imageUrl": "https://.../oduduwa.png",
    "image_generation_prompt": "Oduduwa descending from a golden light..."
  },
  "story": { "legend": "..." }
}
```

### 6.3 Creature (enrichie, mais sans variants)

```json
{
  "name": "Popobawa",
  "type": "creature",
  "subtitle": "Shadow-shifter",
  "appearance": {
    "imageUrl": "https://.../popobawa.png",
    "image_generation_prompt": "A terrifying one-eyed creature..."
  },
  "type_specific": {
    "habitat": ["Zanzibar rooftops"],
    "abilities": ["Shadow shifting"],
    "weaknesses": ["Light exposure"]
  },
  "rendering": {
    "images": {
      "photoreal": "https://.../popobawa.png"
    }
  }
}
```

---

## Critère de fin (issue #18)

* Le doc explique clairement :

  * la règle “silent add”
  * la structure `type_specific`
  * la structure `rendering` (prompt_canon, prompt_variants, images)
  * la liste officielle des `style_id`
  * 1 exemple complet (ici : 3 pour couvrir les cas)
* Le doc est **utilisable tel quel** pour enrichir des entités en série.

---



