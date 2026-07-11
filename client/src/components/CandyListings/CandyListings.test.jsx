import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CandyListings } from './CandyListings';

// Mock CandyCard to avoid testing its internal logic here
vi.mock('../CandyCard/CandyCard', () => ({
    CandyCard: ({ name }) => <div data-testid="candy-card">{name}</div>
}));

describe('CandyListings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('fetches and renders candy listings successfully', async () => {
        const mockCandy = [
            { id: 1, name: 'Popcorn', image: 'p.jpg', description: 'Desc', stock: 10, price: 5 },
            { id: 2, name: 'Soda', image: 's.jpg', description: 'Desc', stock: 20, price: 3 }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockCandy
        });

        render(<CandyListings />);

        await waitFor(() => {
            const cards = screen.getAllByTestId('candy-card');
            expect(cards).toHaveLength(2);
            expect(screen.getByText('Popcorn')).toBeInTheDocument();
            expect(screen.getByText('Soda')).toBeInTheDocument();
        });

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/candy'));
    });

    it('handles fetch error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        global.fetch.mockResolvedValueOnce({
            ok: false
        });

        render(<CandyListings />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error al obtener los productos', expect.any(Error));
        });

        const cards = screen.queryAllByTestId('candy-card');
        expect(cards).toHaveLength(0);

        consoleSpy.mockRestore();
    });

    it('handles network error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        render(<CandyListings />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error al obtener los productos', expect.any(Error));
        });

        const cards = screen.queryAllByTestId('candy-card');
        expect(cards).toHaveLength(0);

        consoleSpy.mockRestore();
    });
});
