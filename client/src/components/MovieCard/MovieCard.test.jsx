import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { MovieCard } from './MovieCard';

describe('MovieCard', () => {
    it('renders the movie card correctly', () => {
        render(
            <MemoryRouter>
                <MovieCard id={1} title="Alien" posterUrl="alien.jpg" />
            </MemoryRouter>
        );

        expect(screen.getByText('Alien')).toBeInTheDocument();
        const image = screen.getByRole('img', { name: 'Alien' });
        expect(image).toHaveAttribute('src', 'alien.jpg');
        
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/movie/1');
    });
});
