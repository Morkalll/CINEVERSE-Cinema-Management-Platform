import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { errorToast } from '../../utils/toast';

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../utils/toast', () => ({
    errorToast: vi.fn()
}));

const renderWithRouter = (ui) => {
    return render(
        <MemoryRouter initialEntries={['/protected']}>
            <Routes>
                <Route path="/protected" element={ui} />
                <Route path="/login" element={<div>Login Page</div>} />
                <Route path="/home" element={<div>Home Page</div>} />
            </Routes>
        </MemoryRouter>
    );
};

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns null while loading', () => {
        useAuth.mockReturnValue({ loading: true, token: null, user: null });
        
        const { container } = renderWithRouter(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        );
        
        expect(container).toBeEmptyDOMElement();
        expect(errorToast).not.toHaveBeenCalled();
    });

    it('redirects to login and shows toast if no token', () => {
        useAuth.mockReturnValue({ loading: false, token: null, user: null });
        
        renderWithRouter(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        );
        
        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(errorToast).toHaveBeenCalledWith('Debes iniciar sesión para acceder');
    });

    it('renders children if token is present and no roles specified', () => {
        useAuth.mockReturnValue({ loading: false, token: 'fake-token', user: { role: 'user' } });
        
        renderWithRouter(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        );
        
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(errorToast).not.toHaveBeenCalled();
    });

    it('redirects to home and shows toast if role is not allowed', () => {
        useAuth.mockReturnValue({ loading: false, token: 'fake-token', user: { role: 'user' } });
        
        renderWithRouter(
            <ProtectedRoute allowedRoles={['admin']}>
                <div>Protected Content</div>
            </ProtectedRoute>
        );
        
        expect(screen.getByText('Home Page')).toBeInTheDocument();
        expect(errorToast).toHaveBeenCalledWith('No tienes permiso para acceder a esta página');
    });

    it('renders children if role is allowed', () => {
        useAuth.mockReturnValue({ loading: false, token: 'fake-token', user: { role: 'admin' } });
        
        renderWithRouter(
            <ProtectedRoute allowedRoles={['admin', 'sysadmin']}>
                <div>Protected Content</div>
            </ProtectedRoute>
        );
        
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(errorToast).not.toHaveBeenCalled();
    });
});
