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
    relations: { parents: [], conjoint: [], descendants: [] },
    rendering: {
        images: {},
        prompt_canon: 'Canon prompt',
        prompt_variants: [
            { style_id: 'regional_or_ethnic', prompt: 'Regional prompt', label: 'Regional' }
        ]
    }
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

    it('should reset to idle state when switching styles', async () => {
        render(<EntityCard data={mockEntity} />);

        // 1. Start with Photoreal (default) - Button should be visible
        let generateBtn = screen.getByText(/Initialize Neural Render/i);
        expect(generateBtn).toBeInTheDocument();

        // 2. Simulate generation completion (manually setting state via mock or just assuming start state)
        // For this test, let's just assert that switching styles shows the button 
        // even if we were in a different state, but since we can't easily inject state here without completing a flow:

        // Let's do a quick generation flow first
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'success', image_url: '/generated/photoreal.png' }),
        });

        fireEvent.click(generateBtn);

        await waitFor(() => {
            expect(screen.getByAltText('TestEntity')).toHaveAttribute('src', '/generated/photoreal.png');
        });

        // 3. Switch Style to "Regional"
        // Find the style selector. The component uses a StyleSelector. 
        // We need to find how to trigger it. Based on the code, it renders options.
        // Let's assume we can click on the text "Regional"
        const regionalBtn = screen.getByText('Regional');
        fireEvent.click(regionalBtn);

        // 4. Verify "Initialize Neural Render" button is visible again
        // Because "Regional" has no image in our mock data
        await waitFor(() => {
            expect(screen.getByText(/Initialize Neural Render/i)).toBeInTheDocument();
        });
    });

    it('should call onImageGenerated when generation succeeds', async () => {
        const onImageGeneratedSpy = vi.fn();

        // Setup mock response BEFORE action
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'success', image_url: '/generated/callback_test.png' }),
        });

        render(<EntityCard data={mockEntity} onImageGenerated={onImageGeneratedSpy} />);

        // 1. Click Generate
        const generateBtn = screen.getByText(/Initialize Neural Render/i);
        fireEvent.click(generateBtn);

        // 3. Wait for Success
        await waitFor(() => {
            const img = screen.getByAltText('TestEntity');
            expect(img).toBeInTheDocument();
        });

        // 4. Verify Callback
        expect(onImageGeneratedSpy).toHaveBeenCalledWith('photoreal', '/generated/callback_test.png');
    });
});
