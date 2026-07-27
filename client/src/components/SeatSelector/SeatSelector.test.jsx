import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SeatSelector from './SeatSelector';
import { AuthContext } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';

vi.mock('../../services/api', () => ({
    apiRequest: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
    useNavigate: () => mockNavigate
}));

const mockAddToCart = vi.fn();
const mockUpdateQuantity = vi.fn();
const mockRemoveFromCart = vi.fn();

// We can mock useCart directly or wrap in a provider if CartContext is exported, 
// but mocking the module is often easier for hooks.
vi.mock('../../context/CartContext', () => ({
    useCart: () => ({
        cart: [],
        addToCart: mockAddToCart,
        updateQuantity: mockUpdateQuantity,
        removeFromCart: mockRemoveFromCart
    })
}));

describe('SeatSelector Component', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render loading state initially and then seats', async () => {
        apiRequest.mockResolvedValue({ occupiedSeats: [] });

        const { container } = render(
            <AuthContext.Provider value={{ user: { id: 1 } }}>
                <SeatSelector rows={2} seatsPerRow={2} showingId={1} />
            </AuthContext.Provider>
        );

        expect(screen.getByText('Cargando asientos...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Cargando asientos...')).not.toBeInTheDocument();
        });

        // 2 rows * 2 seats = 4 seats
        const seats = container.querySelectorAll('.seat-row .seat');
        expect(seats).toHaveLength(4);
    });

    it('should allow user to select an available seat', async () => {
        apiRequest.mockResolvedValue({ occupiedSeats: [] });

        const { container } = render(
            <AuthContext.Provider value={{ user: { id: 1 } }}>
                <SeatSelector rows={2} seatsPerRow={2} showingId={1} />
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(screen.queryByText('Cargando asientos...')).not.toBeInTheDocument();
        });

        const seats = container.querySelectorAll('.seat-row .seat');
        fireEvent.click(seats[0]); // Click first seat (1-1)

        expect(mockAddToCart).toHaveBeenCalledWith(
            expect.objectContaining({ refId: 1, type: 'ticket', seats: ['1-1'] }),
            1
        );
    });

    it('should not allow selecting an occupied seat', async () => {
        apiRequest.mockResolvedValue({ occupiedSeats: ['1-1'] });

        const { container } = render(
            <AuthContext.Provider value={{ user: { id: 1 } }}>
                <SeatSelector rows={2} seatsPerRow={2} showingId={1} />
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(screen.queryByText('Cargando asientos...')).not.toBeInTheDocument();
        });

        const seats = container.querySelectorAll('.seat-row .seat');
        fireEvent.click(seats[0]); // Click 1-1 which is occupied

        expect(mockAddToCart).not.toHaveBeenCalled();
    });

    it('should clear seat selection when ticket quantity changes', async () => {
        apiRequest.mockResolvedValue({ occupiedSeats: [] });

        render(
            <AuthContext.Provider value={{ user: { id: 1 } }}>
                <SeatSelector rows={2} seatsPerRow={2} showingId={1} />
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(screen.queryByText('Cargando asientos...')).not.toBeInTheDocument();
        });

        const select = screen.getByLabelText('Cantidad de Entradas:');
        fireEvent.change(select, { target: { value: '2' } });

        // Since no seats were previously selected, removeFromCart is not called yet
        expect(mockRemoveFromCart).not.toHaveBeenCalled();
    });

});
