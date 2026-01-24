import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EntityCard from '../EntityCard';
import { MythologicalEntity } from '../../types';

// Mock VisualManifestation to simplify DOM and avoid lucide icon issues in test
vi.mock('../VisualManifestation', () => ({
    default: () => <div data-testid="visual-manifestation">Abstract Visual</div>
}));

// Mock Data
const mockEntity: MythologicalEntity = {
    entity_type: 'Divinity',
    name: 'TestEntity',
    category: 'Test Category',
    origin: { country: 'Test Country', ethnicity: 'Test Ethnicity', pantheon: 'Test Pantheon' },
    identity: { gender: 'Male', cultural_role: 'Test Role', alignment: 'Neutral' },
    attributes: { domains: ['Test Domain'], symbols: ['Test Symbol'], power_objects: [], symbolic_animals: [] },
    appearance: { physical_signs: [], manifestations: 'Test', image_generation_prompt: 'A test prompt', imageUrl: '' }, // Empty imageUrl to show button
    story: { description: 'Test Description', characteristics: [] },
    relations: { parents: [], conjoint: [], descendants: [] }
};

describe('EntityCard Integration', () => {
    // Mock global fetch
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    beforeEach(() => {
        mockFetch.mockClear();
    });

    it('should handle the generation flow: Button -> Loading -> Image', async () => {
        render(<EntityCard data={mockEntity} />);

        // 1. Verify Button is visible (since imageUrl is empty)
        const generateBtn = screen.getByText(/Initialize Neural Render/i);
        expect(generateBtn).toBeInTheDocument();

        // Setup successful mock response
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'success', image_url: '/generated/test.png' }),
        });

        // 2. Click Button
        fireEvent.click(generateBtn);

        // 3. Verify Loading State
        // "Synthesizing from prompt..." is the text in the loading state
        await waitFor(() => {
            expect(screen.getByText(/Synthesizing from prompt/i)).toBeInTheDocument();
        });

        // 4. Verify Image Appears
        // The image src should be the one from the mock
        await waitFor(() => {
            const img = screen.getByAltText('TestEntity');
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', '/generated/test.png');
        });
    });
});
