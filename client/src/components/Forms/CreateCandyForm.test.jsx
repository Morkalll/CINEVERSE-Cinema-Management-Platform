import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCandyForm } from './CreateCandyForm';
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

describe('CreateCandyForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('renders the form correctly', () => {
        render(<CreateCandyForm />);
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByText('Nombre:')).toBeInTheDocument();
        expect(screen.getByText('Precio:')).toBeInTheDocument();
        expect(screen.getByText('Stock:')).toBeInTheDocument();
        expect(screen.getByText('Descripción:')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Agregar Candy' })).toBeInTheDocument();
    });

    it('shows validation errors when submitting empty form', () => {
        render(<CreateCandyForm />);
        
        fireEvent.click(screen.getByRole('button', { name: 'Agregar Candy' }));

        expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
        expect(screen.getByText('El precio es requerido')).toBeInTheDocument();
        expect(screen.getByText('El stock es requerido')).toBeInTheDocument();
        expect(screen.getByText('La descripción es requerida')).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('shows validation errors for invalid numbers', () => {
        render(<CreateCandyForm />);
        
        const priceInput = document.getElementsByName('price')[0];
        const stockInput = document.getElementsByName('stock')[0];

        fireEvent.change(priceInput, { target: { name: 'price', value: '-10' } });
        fireEvent.change(stockInput, { target: { name: 'stock', value: '-5' } });
        
        fireEvent.click(screen.getByRole('button', { name: 'Agregar Candy' }));

        expect(screen.getByText('El precio debe ser mayor a 0')).toBeInTheDocument();
        expect(screen.getByText('El stock no puede ser negativo')).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('submits form successfully and clears fields', async () => {
        global.fetch.mockResolvedValueOnce({ ok: true });

        render(<CreateCandyForm />);
        
        const nameInput = document.getElementsByName('name')[0];
        const priceInput = document.getElementsByName('price')[0];
        const stockInput = document.getElementsByName('stock')[0];
        const descInput = document.getElementsByName('description')[0];

        fireEvent.change(nameInput, { target: { name: 'name', value: 'Popcorn' } });
        fireEvent.change(priceInput, { target: { name: 'price', value: '10' } });
        fireEvent.change(stockInput, { target: { name: 'stock', value: '50' } });
        fireEvent.change(descInput, { target: { name: 'description', value: 'Tasty' } });
        
        fireEvent.click(screen.getByRole('button', { name: 'Agregar Candy' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/candy'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        name: 'Popcorn',
                        price: '10',
                        stock: '50',
                        image: '',
                        description: 'Tasty'
                    })
                })
            );
        });

        expect(toast.success).toHaveBeenCalledWith('Producto agregado con éxito!');
        await waitFor(() => {
            expect(nameInput.value).toBe('');
        });
    });

    it('handles fetch error', async () => {
        global.fetch.mockResolvedValueOnce({ ok: false });

        render(<CreateCandyForm />);
        
        const nameInput = document.getElementsByName('name')[0];
        const priceInput = document.getElementsByName('price')[0];
        const stockInput = document.getElementsByName('stock')[0];
        const descInput = document.getElementsByName('description')[0];

        fireEvent.change(nameInput, { target: { name: 'name', value: 'Popcorn' } });
        fireEvent.change(priceInput, { target: { name: 'price', value: '10' } });
        fireEvent.change(stockInput, { target: { name: 'stock', value: '50' } });
        fireEvent.change(descInput, { target: { name: 'description', value: 'Tasty' } });
        
        fireEvent.click(screen.getByRole('button', { name: 'Agregar Candy' }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Error al crear el producto');
        });
    });
});
