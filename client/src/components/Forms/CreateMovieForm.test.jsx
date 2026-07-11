import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateMoviesForm } from './CreateMovieForm';
import { toast } from 'react-toastify';

vi.mock('../NavBar/NavBar', () => ({
    NavBar: () => <div data-testid="navbar">NavBar</div>
}));

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('CreateMoviesForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('renders the form correctly', () => {
        render(<CreateMoviesForm />);
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByText('Título:')).toBeInTheDocument();
        expect(screen.getByText('Género:')).toBeInTheDocument();
        expect(screen.getByText('Director:')).toBeInTheDocument();
        expect(screen.getByText('Rating (0-10):')).toBeInTheDocument();
        expect(screen.getByText('Duración (min):')).toBeInTheDocument();
        expect(screen.getByText('Sinopsis:')).toBeInTheDocument();
        expect(screen.getByText('Fecha de estreno:')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Agregar Película' })).toBeInTheDocument();
    });

    it('shows validation errors when submitting empty form', () => {
        render(<CreateMoviesForm />);
        
        fireEvent.click(screen.getByRole('button', { name: 'Agregar Película' }));

        expect(screen.getByText('El título es requerido')).toBeInTheDocument();
        expect(screen.getByText('El género es requerido')).toBeInTheDocument();
        expect(screen.getByText('El director es requerido')).toBeInTheDocument();
        expect(screen.getByText('El rating es requerido')).toBeInTheDocument();
        expect(screen.getByText('La duración es requerida')).toBeInTheDocument();
        expect(screen.getByText('La sinopsis es requerida')).toBeInTheDocument();
        expect(screen.getByText('La fecha de estreno es requerida')).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('shows validation errors for invalid numbers', () => {
        render(<CreateMoviesForm />);
        
        const ratingInput = document.getElementsByName('rating')[0];
        const durationInput = document.getElementsByName('duration')[0];

        fireEvent.change(ratingInput, { target: { name: 'rating', value: '11' } });
        fireEvent.change(durationInput, { target: { name: 'duration', value: '-10' } });
        
        fireEvent.click(screen.getByRole('button', { name: 'Agregar Película' }));

        expect(screen.getByText('El rating debe estar entre 0 y 10')).toBeInTheDocument();
        expect(screen.getByText('La duración debe ser mayor a 0')).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('submits form successfully and clears fields', async () => {
        global.fetch.mockResolvedValueOnce({ ok: true });

        render(<CreateMoviesForm />);
        
        fireEvent.change(document.getElementsByName('title')[0], { target: { name: 'title', value: 'Alien' } });
        fireEvent.change(document.getElementsByName('genre')[0], { target: { name: 'genre', value: 'Sci-Fi' } });
        fireEvent.change(document.getElementsByName('director')[0], { target: { name: 'director', value: 'Ridley Scott' } });
        fireEvent.change(document.getElementsByName('rating')[0], { target: { name: 'rating', value: '8.5' } });
        fireEvent.change(document.getElementsByName('duration')[0], { target: { name: 'duration', value: '117' } });
        fireEvent.change(document.getElementsByName('synopsis')[0], { target: { name: 'synopsis', value: 'In space no one can hear you scream' } });
        // The date input role is usually not text, get by label or name
        const dateInputs = document.getElementsByName('releaseDate');
        fireEvent.change(dateInputs[0], { target: { name: 'releaseDate', value: '1979-05-25' } });
        
        fireEvent.click(screen.getByRole('button', { name: 'Agregar Película' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/movielistings'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        title: 'Alien',
                        genre: 'Sci-Fi',
                        director: 'Ridley Scott',
                        rating: '8.5',
                        duration: '117',
                        synopsis: 'In space no one can hear you scream',
                        poster: '',
                        posterCarousel: '',
                        releaseDate: '1979-05-25'
                    })
                })
            );
        });

        expect(toast.success).toHaveBeenCalledWith('Película creada con éxito!');
        await waitFor(() => {
            expect(document.getElementsByName('title')[0].value).toBe('');
        });
    });

    it('handles fetch error', async () => {
        global.fetch.mockResolvedValueOnce({ ok: false });

        render(<CreateMoviesForm />);
        
        fireEvent.change(document.getElementsByName('title')[0], { target: { name: 'title', value: 'Alien' } });
        fireEvent.change(document.getElementsByName('genre')[0], { target: { name: 'genre', value: 'Sci-Fi' } });
        fireEvent.change(document.getElementsByName('director')[0], { target: { name: 'director', value: 'Ridley Scott' } });
        fireEvent.change(document.getElementsByName('rating')[0], { target: { name: 'rating', value: '8.5' } });
        fireEvent.change(document.getElementsByName('duration')[0], { target: { name: 'duration', value: '117' } });
        fireEvent.change(document.getElementsByName('synopsis')[0], { target: { name: 'synopsis', value: 'In space no one can hear you scream' } });
        const dateInputs = document.getElementsByName('releaseDate');
        fireEvent.change(dateInputs[0], { target: { name: 'releaseDate', value: '1979-05-25' } });
        
        fireEvent.click(screen.getByRole('button', { name: 'Agregar Película' }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Error al crear la película');
        });
    });
});
