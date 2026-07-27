import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Checkout } from './Checkout';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { successToast, errorToast } from '../../utils/toast';

vi.mock('../../context/CartContext', () => ({
    useCart: vi.fn()
}));

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../services/api', () => ({
    apiRequest: vi.fn()
}));

vi.mock('../../utils/toast', () => ({
    successToast: vi.fn(),
    errorToast: vi.fn()
}));

describe('Checkout', () => {
    const mockRemoveFromCart = vi.fn();
    const mockClearCart = vi.fn();
    const mockIncrement = vi.fn();
    const mockDecrement = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        useCart.mockReturnValue({
            cart: [],
            total: 0,
            removeFromCart: mockRemoveFromCart,
            clearCart: mockClearCart,
            increment: mockIncrement,
            decrement: mockDecrement
        });

        useAuth.mockReturnValue({
            user: { id: 1 },
            token: 'fake-token'
        });

        // Mock window.location.href
        delete window.location;
        window.location = { href: '' };
    });

    it('renders empty cart message when cart is empty', () => {
        render(<Checkout />);
        expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
    });

    it('renders cart items correctly', () => {
        useCart.mockReturnValue({
            cart: [
                { type: 'product', refId: 1, name: 'Popcorn', quantity: 2, price: 5 },
                { type: 'ticket', refId: 2, name: 'Alien Ticket', quantity: 1, price: 10 }
            ],
            total: 20,
            removeFromCart: mockRemoveFromCart,
            clearCart: mockClearCart,
            increment: mockIncrement,
            decrement: mockDecrement
        });

        render(<Checkout />);

        expect(screen.getByText('🛒 Tu Carrito')).toBeInTheDocument();
        expect(screen.getByText('Popcorn')).toBeInTheDocument();
        expect(screen.getByText('Alien Ticket')).toBeInTheDocument();
        expect(screen.getByText('Total: $20.00')).toBeInTheDocument();
    });

    it('handles increment and decrement for products', () => {
        useCart.mockReturnValue({
            cart: [{ type: 'product', refId: 1, name: 'Popcorn', quantity: 2, price: 5 }],
            total: 10,
            removeFromCart: mockRemoveFromCart,
            clearCart: mockClearCart,
            increment: mockIncrement,
            decrement: mockDecrement
        });

        render(<Checkout />);

        fireEvent.click(screen.getByLabelText('Sumar'));
        expect(mockIncrement).toHaveBeenCalledWith(1, 'product', 1);

        fireEvent.click(screen.getByLabelText('Restar'));
        expect(mockDecrement).toHaveBeenCalledWith(1, 'product', 1);
    });

    it('handles remove from cart', () => {
        useCart.mockReturnValue({
            cart: [{ type: 'product', refId: 1, name: 'Popcorn', quantity: 2, price: 5 }],
            total: 10,
            removeFromCart: mockRemoveFromCart,
            clearCart: mockClearCart,
            increment: mockIncrement,
            decrement: mockDecrement
        });

        render(<Checkout />);

        fireEvent.click(screen.getByText('Eliminar'));
        expect(mockRemoveFromCart).toHaveBeenCalledWith(1, 'product');
        expect(successToast).toHaveBeenCalledWith('Producto eliminado');
    });

    it('handles checkout error if not logged in', () => {
        useAuth.mockReturnValue({ user: null });
        useCart.mockReturnValue({
            cart: [{ type: 'product', refId: 1, name: 'Popcorn', quantity: 2, price: 5 }],
            total: 10,
            removeFromCart: mockRemoveFromCart,
            clearCart: mockClearCart,
            increment: mockIncrement,
            decrement: mockDecrement
        });

        render(<Checkout />);

        fireEvent.click(screen.getByText('Confirmar Pedido'));
        expect(errorToast).toHaveBeenCalledWith('Debes iniciar sesión para confirmar la compra');
        expect(apiRequest).not.toHaveBeenCalled();
    });

    it('handles successful checkout and redirect', async () => {
        useCart.mockReturnValue({
            cart: [{ type: 'product', refId: 1, name: 'Popcorn', quantity: 2, price: 5 }],
            total: 10,
            removeFromCart: mockRemoveFromCart,
            clearCart: mockClearCart,
            increment: mockIncrement,
            decrement: mockDecrement
        });

        apiRequest.mockResolvedValueOnce({ orderId: 100 }); // /orders
        apiRequest.mockResolvedValueOnce({ initPoint: 'http://mercadopago.com/pay' }); // /payments/create-preference

        render(<Checkout />);

        fireEvent.click(screen.getByText('Confirmar Pedido'));

        await waitFor(() => {
            expect(apiRequest).toHaveBeenCalledWith('/orders', 'POST', {
                items: [{ type: 'product', refId: 1, quantity: 2, seats: undefined }]
            }, 'fake-token');
        });

        await waitFor(() => {
            expect(apiRequest).toHaveBeenCalledWith('/payments/create-preference', 'POST', {
                orderId: 100
            }, 'fake-token');
        });

        await waitFor(() => {
            expect(mockClearCart).toHaveBeenCalled();
            expect(window.location.href).toBe('http://mercadopago.com/pay');
        });
    });

    it('handles checkout preference error gracefully', async () => {
        useCart.mockReturnValue({
            cart: [{ type: 'product', refId: 1, name: 'Popcorn', quantity: 2, price: 5 }],
            total: 10,
            removeFromCart: mockRemoveFromCart,
            clearCart: mockClearCart,
            increment: mockIncrement,
            decrement: mockDecrement
        });

        apiRequest.mockResolvedValueOnce({ orderId: 100 }); // /orders
        apiRequest.mockRejectedValueOnce(new Error('MP Error')); // /payments/create-preference

        render(<Checkout />);

        fireEvent.click(screen.getByText('Confirmar Pedido'));

        await waitFor(() => {
            expect(mockClearCart).toHaveBeenCalled();
            expect(errorToast).toHaveBeenCalledWith('MP Error');
        });
    });

    it('handles general checkout error', async () => {
        useCart.mockReturnValue({
            cart: [{ type: 'product', refId: 1, name: 'Popcorn', quantity: 2, price: 5 }],
            total: 10,
            removeFromCart: mockRemoveFromCart,
            clearCart: mockClearCart,
            increment: mockIncrement,
            decrement: mockDecrement
        });

        apiRequest.mockRejectedValueOnce(new Error('Order Error')); // /orders

        render(<Checkout />);

        fireEvent.click(screen.getByText('Confirmar Pedido'));

        await waitFor(() => {
            expect(errorToast).toHaveBeenCalledWith('Order Error');
            expect(mockClearCart).not.toHaveBeenCalled();
        });
    });
});
