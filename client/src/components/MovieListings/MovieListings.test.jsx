import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MovieListings } from './MovieListings';

// Mock MovieCard to avoid testing its internal logic here
vi.mock('../MovieCard/MovieCard', () => ({
    MovieCard: ({ title }) => <div data-testid="movie-card">{title}</div>
}));

describe('MovieListings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('fetches and renders movie listings successfully', async () => {
        const mockMovies = [
            { id: 1, title: 'Alien', poster: 'alien.jpg' },
            { id: 2, title: 'Dune', poster: 'dune.jpg' }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockMovies
        });

        render(<MovieListings />);

        await waitFor(() => {
            const cards = screen.getAllByTestId('movie-card');
            expect(cards).toHaveLength(2);
            expect(screen.getByText('Alien')).toBeInTheDocument();
            expect(screen.getByText('Dune')).toBeInTheDocument();
        });

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/movielistings'));
    });

    it('handles fetch error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 404
        });

        render(<MovieListings />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error al obtener las películas:', expect.any(Error));
        });

        const cards = screen.queryAllByTestId('movie-card');
        expect(cards).toHaveLength(0);

        consoleSpy.mockRestore();
    });

    it('handles network error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        render(<MovieListings />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error al obtener las películas:', expect.any(Error));
        });

        const cards = screen.queryAllByTestId('movie-card');
        expect(cards).toHaveLength(0);

        consoleSpy.mockRestore();
    });
});
