import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EntityCard from '../EntityCard';
import { MythologicalEntity } from '../../types';

vi.mock('../VisualManifestation', () => ({
  default: () => <div data-testid="visual-manifestation">Abstract Visual</div>,
}));

const buildEntity = (overrides: Partial<MythologicalEntity> = {}): MythologicalEntity => ({
  entity_type: 'Divinity',
  name: 'TestEntity',
  category: 'Test Category',
  origin: { country: 'Test Country', ethnicity: 'Test Ethnicity', pantheon: 'Test Pantheon' },
  identity: { gender: 'Male', cultural_role: 'Test Role', alignment: 'Neutral' },
  attributes: { domains: ['Test Domain'], symbols: ['Test Symbol'], power_objects: [], symbolic_animals: [] },
  appearance: { physical_signs: [], manifestations: 'Test', image_generation_prompt: 'A test prompt', imageUrl: '' },
  story: { description: 'Test Description', characteristics: [] },
  relations: { parents: [], conjoint: [], descendants: [] },
  rendering: {
    images: {},
    prompt_canon: 'Canon prompt',
    prompt_variants: [
      { style_id: 'regional_or_ethnic', prompt: 'Legacy regional prompt', label: 'Regional' },
      { style_id: 'manga', prompt: 'Manga style prompt', label: 'Manga' },
    ],
  },
  ...overrides,
});

const createJsonResponse = (body: unknown, init?: { ok?: boolean; status?: number }) => ({
  ok: init?.ok ?? true,
  status: init?.status ?? 200,
  json: async () => body,
});

const createDeferredResponse = () => {
  let resolve!: (value: ReturnType<typeof createJsonResponse>) => void;
  const promise = new Promise<ReturnType<typeof createJsonResponse>>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
};

describe('EntityCard Smart UI', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps photoreal generation flow unchanged', async () => {
    mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('/preview/TestEntity?style_id=regional_or_ethnic')) {
        return createJsonResponse({ prompt: '' });
      }

      if (url === '/generate') {
        return createJsonResponse({ status: 'success', image_url: '/generated/test.png' });
      }

      throw new Error(`Unexpected fetch call: ${url}`);
    });

    render(<EntityCard data={buildEntity()} />);

    const generateBtn = screen.getByText(/Initialize Neural Render/i);
    expect(generateBtn).toBeInTheDocument();
    expect(screen.getByText('Manga')).toBeInTheDocument();
    expect(screen.queryByText('Regional')).not.toBeInTheDocument();

    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Synthesizing from prompt/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByAltText('TestEntity')).toHaveAttribute('src', '/generated/test.png');
    });
  });

  it('shows regional only when backend preview returns a prompt and ignores the legacy prompt', async () => {
    mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('/preview/TestEntity?style_id=regional_or_ethnic')) {
        return createJsonResponse({ prompt: 'Backend regional prompt' });
      }

      throw new Error(`Unexpected fetch call: ${url}`);
    });

    render(<EntityCard data={buildEntity()} />);

    await waitFor(() => {
      expect(screen.getByText('Regional')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Regional'));
    fireEvent.click(screen.getByText(/View GenAI Prompt/i));

    await waitFor(() => {
      expect(screen.getByText(/Backend regional prompt/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Legacy regional prompt/i)).not.toBeInTheDocument();
  });

  it('generates an image with regional_or_ethnic after backend preview confirms availability', async () => {
    mockFetch.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes('/preview/TestEntity?style_id=regional_or_ethnic')) {
        return createJsonResponse({ prompt: 'Backend regional prompt' });
      }

      if (url === '/generate') {
        expect(init?.body).toBe(JSON.stringify({ entity_name: 'TestEntity', style_id: 'regional_or_ethnic' }));
        return createJsonResponse({ status: 'success', image_url: '/generated/regional.png' });
      }

      throw new Error(`Unexpected fetch call: ${url}`);
    });

    render(<EntityCard data={buildEntity()} />);

    await waitFor(() => {
      expect(screen.getByText('Regional')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Regional'));
    fireEvent.click(screen.getByText(/Initialize Neural Render/i));

    await waitFor(() => {
      expect(screen.getByAltText('TestEntity')).toHaveAttribute('src', '/generated/regional.png');
    });
  });

  it('hides regional when backend preview returns an empty prompt', async () => {
    mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('/preview/TestEntity?style_id=regional_or_ethnic')) {
        return createJsonResponse({ prompt: '' });
      }

      throw new Error(`Unexpected fetch call: ${url}`);
    });

    render(<EntityCard data={buildEntity()} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    expect(screen.queryByText('Regional')).not.toBeInTheDocument();
    expect(screen.getByText('Manga')).toBeInTheDocument();
  });

  it('falls back to photoreal when a new entity does not support regional', async () => {
    const firstEntity = buildEntity();
    const secondEntity = buildEntity({
      name: 'SecondEntity',
      appearance: {
        physical_signs: [],
        manifestations: 'Second',
        image_generation_prompt: 'Second fallback prompt',
        imageUrl: '',
      },
      rendering: {
        images: {},
        prompt_canon: 'Second canon prompt',
        prompt_variants: [
          { style_id: 'regional_or_ethnic', prompt: 'Another legacy regional prompt', label: 'Regional' },
          { style_id: 'manga', prompt: 'Second manga prompt', label: 'Manga' },
        ],
      },
    });

    mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('/preview/TestEntity?style_id=regional_or_ethnic')) {
        return createJsonResponse({ prompt: 'Backend regional prompt' });
      }

      if (url.includes('/preview/SecondEntity?style_id=regional_or_ethnic')) {
        return createJsonResponse({ prompt: '' });
      }

      throw new Error(`Unexpected fetch call: ${url}`);
    });

    const { rerender } = render(<EntityCard data={firstEntity} />);

    await waitFor(() => {
      expect(screen.getByText('Regional')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Regional'));
    fireEvent.click(screen.getByText(/View GenAI Prompt/i));

    await waitFor(() => {
      expect(screen.getByText(/Backend regional prompt/i)).toBeInTheDocument();
    });

    rerender(<EntityCard data={secondEntity} />);

    await waitFor(() => {
      expect(screen.queryByText('Regional')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Second canon prompt/i)).toBeInTheDocument();
  });

  it('ignores stale preview responses when the entity changes quickly', async () => {
    const firstPreview = createDeferredResponse();
    const firstEntity = buildEntity();
    const secondEntity = buildEntity({
      name: 'SecondEntity',
      rendering: {
        images: {},
        prompt_canon: 'Second canon prompt',
        prompt_variants: [
          { style_id: 'regional_or_ethnic', prompt: 'Second legacy regional prompt', label: 'Regional' },
          { style_id: 'manga', prompt: 'Second manga prompt', label: 'Manga' },
        ],
      },
    });

    mockFetch.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes('/preview/TestEntity?style_id=regional_or_ethnic')) {
        return new Promise((resolve, reject) => {
          const signal = init?.signal;

          if (signal) {
            signal.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }

          firstPreview.promise.then(resolve);
        });
      }

      if (url.includes('/preview/SecondEntity?style_id=regional_or_ethnic')) {
        return Promise.resolve(createJsonResponse({ prompt: '' }));
      }

      throw new Error(`Unexpected fetch call: ${url}`);
    });

    const { rerender } = render(<EntityCard data={firstEntity} />);

    rerender(<EntityCard data={secondEntity} />);

    await waitFor(() => {
      expect(screen.queryByText('Regional')).not.toBeInTheDocument();
    });

    firstPreview.resolve(createJsonResponse({ prompt: 'Stale backend regional prompt' }));

    await waitFor(() => {
      expect(screen.queryByText('Regional')).not.toBeInTheDocument();
    });
  });
});
