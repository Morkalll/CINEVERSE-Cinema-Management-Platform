import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateMovieShowingForm } from './CreateMovieShowingForm';
import { toast } from 'react-toastify';

vi.mock('../navBar/NavBar', () => ({
    NavBar: () => <div data-testid="navbar">NavBar</div>
}));

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('CreateMovieShowingForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn((url) => {
            if (url.includes('/screens')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([{ id: 1 }, { id: 2 }])
                });
            }
            if (url.includes('/movielistings') && !url.includes('POST')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([{ id: 1, title: 'Alien' }, { id: 2, title: 'Dune' }])
                });
            }
            return Promise.resolve({ ok: true });
        });
    });

    it('renders the form correctly and fetches movies and screens', async () => {
        render(<CreateMovieShowingForm />);
        
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByText('Película:')).toBeInTheDocument();
        expect(screen.getByText('Fecha:')).toBeInTheDocument();
        expect(screen.getByText('Hora:')).toBeInTheDocument();
        expect(screen.getByText('Sala:')).toBeInTheDocument();
        expect(screen.getByText('Precio ($):')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('Alien')).toBeInTheDocument();
            expect(screen.getByText('1')).toBeInTheDocument(); // Screen ID
        });
    });

    it('shows validation errors when submitting empty form', async () => {
        render(<CreateMovieShowingForm />);
        await waitFor(() => expect(screen.getByText('Alien')).toBeInTheDocument());
        
        fireEvent.click(screen.getByRole('button', { name: 'Agregar Función' }));

        expect(screen.getByText('Debe seleccionar una película')).toBeInTheDocument();
        expect(screen.getByText('La fecha es requerida')).toBeInTheDocument();
        expect(screen.getByText('La hora es requerida')).toBeInTheDocument();
        expect(screen.getByText('Debe seleccionar una sala')).toBeInTheDocument();
        expect(screen.getByText('El precio es requerido')).toBeInTheDocument();
    });

    it('shows validation errors for invalid numbers', async () => {
        render(<CreateMovieShowingForm />);
        await waitFor(() => expect(screen.getByText('Alien')).toBeInTheDocument());
        
        const priceInput = document.getElementsByName('price')[0];
        fireEvent.change(priceInput, { target: { name: 'price', value: '-10' } });
        
        fireEvent.click(screen.getByRole('button', { name: 'Agregar Función' }));

        expect(screen.getByText('El precio debe ser mayor a 0')).toBeInTheDocument();
    });

    it('submits form successfully and clears fields', async () => {
        render(<CreateMovieShowingForm />);
        
        await waitFor(() => expect(screen.getByText('Alien')).toBeInTheDocument());

        const movieSelect = document.getElementsByName('movieId')[0];
        const screenSelect = document.getElementsByName('screenId')[0];
        
        const dateInput = document.getElementsByName('date')[0];
        const timeInput = document.getElementsByName('showtime')[0];
        const priceInput = document.getElementsByName('price')[0];

        fireEvent.change(movieSelect, { target: { name: 'movieId', value: '1' } });
        fireEvent.change(dateInput, { target: { name: 'date', value: '2027-01-01' } });
        fireEvent.change(timeInput, { target: { name: 'showtime', value: '20:00' } });
        fireEvent.change(screenSelect, { target: { name: 'screenId', value: '1' } });
        fireEvent.change(priceInput, { target: { name: 'price', value: '15.50' } });
        
        // Reset fetch to capture the POST request
        global.fetch.mockClear();
        global.fetch.mockResolvedValueOnce({ ok: true });

        fireEvent.click(screen.getByRole('button', { name: 'Agregar Función' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/movieshowings'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        movieId: '1',
                        screenId: '1',
                        date: '2027-01-01',
                        showtime: new Date('2027-01-01T20:00').toISOString(),
                        price: '15.50'
                    })
                })
            );
        });

        expect(toast.success).toHaveBeenCalledWith('Función creada con éxito!');
        expect(priceInput.value).toBe('');
    });
});
