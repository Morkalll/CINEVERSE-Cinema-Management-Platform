import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MovieCarousel } from './MovieCarousel';

// Mock ReactSwipe since it might rely on DOM layout measurements that aren't available in JSDOM
vi.mock('react-swipe', () => ({
    default: vi.fn(({ children }) => <div data-testid="react-swipe">{children}</div>)
}));

describe('MovieCarousel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('renders loading state initially', () => {
        global.fetch.mockReturnValue(new Promise(() => {})); // Never resolves
        render(<MovieCarousel />);
        expect(screen.getByText('Cargando películas...')).toBeInTheDocument();
    });

    it('fetches and renders movies successfully', async () => {
        const mockMovies = [
            { id: 1, title: 'Alien', posterCarousel: 'alien.jpg' },
            { id: 2, title: 'Dune', posterCarousel: 'dune.jpg' }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockMovies
        });

        render(<MovieCarousel />);

        await waitFor(() => {
            expect(screen.getByText('Alien')).toBeInTheDocument();
            expect(screen.getByText('Dune')).toBeInTheDocument();
        });

        const posters = screen.getAllByRole('img');
        expect(posters[0]).toHaveAttribute('src', 'alien.jpg');
        expect(posters[1]).toHaveAttribute('src', 'dune.jpg');
    });

    it('handles fetch error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        global.fetch.mockResolvedValueOnce({
            ok: false
        });

        render(<MovieCarousel />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error:', expect.any(Error));
        });

        expect(screen.getByText('Cargando películas...')).toBeInTheDocument();
        consoleSpy.mockRestore();
    });
});
