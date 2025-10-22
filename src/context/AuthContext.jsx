// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { API_URL } from "../services/api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Inicializar desde localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.warn("Error parsing stored user", e);
            }
        }

        if (storedToken) {
            setToken(storedToken);

            // Si no habia user almacenado, decodificamos token para obtener datos básicos
            if (!storedUser) {
                try {
                    const payload = jwtDecode(storedToken);
                    const normalized = {
                        id: payload.id,
                        username: payload.username,
                        email: payload.email,
                        role: payload.role,
                        exp: payload.exp,
                    };
                    setUser(normalized);
                } catch (e) {
                    console.warn("Token decode failed:", e);
                }
            }
        }

        setLoading(false);
    }, []);

    // Persistir cambios en localStorage
    useEffect(() => {
        if (user) localStorage.setItem("user", JSON.stringify(user));
        else localStorage.removeItem("user");

        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
    }, [user, token]);

    // Login: POST /auth/login -> { token } (según backend actual)
    const login = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => null);
                throw new Error(errBody?.message || "Error al iniciar sesión");
            }

            const data = await res.json();

            // Si backend devolviera data.user, preferirlo.
            if (data.user) {
                const u = data.user;
                const normalized = {
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    role: u.role,
                };
                setUser(normalized);
            }

            // Si el backend devuelve token, decodificamos y normalizamos
            if (data.token) {
                setToken(data.token);
                try {
                    const payload = jwtDecode(data.token);
                    const normalized = {
                        id: payload.id,
                        username: payload.username,
                        email: payload.email,
                        role: payload.role,
                        exp: payload.exp,
                    };
                    setUser(normalized);
                } catch (e) {
                    console.warn("No se pudo decodificar token:", e);
                }
            }

            return { success: true, data };
        } catch (err) {
            console.error("Login error:", err);
            return { success: false, error: err.message || "Error" };
        }
    };


    const loginAdmin = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login-admin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => null);
                throw new Error(errBody?.message || "Error al iniciar sesión");
            }

            const data = await res.json();

            // Si backend devolviera data.user, preferirlo.
            if (data.user) {
                const u = data.user;
                const normalized = {
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    role: u.role,
                };
                setUser(normalized);
            }

            // Si el backend devuelve token, decodificamos y normalizamos
            if (data.token) {
                setToken(data.token);
                try {
                    const payload = jwtDecode(data.token);
                    const normalized = {
                        id: payload.id,
                        username: payload.username,
                        email: payload.email,
                        role: payload.role,
                        exp: payload.exp,
                    };
                    setUser(normalized);
                } catch (e) {
                    console.warn("No se pudo decodificar token:", e);
                }
            }

            return { success: true, data };
        } catch (err) {
            console.error("Login error:", err);
            return { success: false, error: err.message || "Error" };
        }
    };


    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };


    const fetchProfile = async () => {
        if (!token || !user?.id) return;
        try {
            const res = await fetch(`${API_URL}/users/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                // normalizar
                const normalized = {
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    role: data.role,
                };
                setUser(normalized);
            } else {
                console.warn("fetchProfile: respuesta no OK", res.status);
            }
        } catch (err) {
            console.error("Error al actualizar perfil:", err);
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        loginAdmin,
        logout,
        fetchProfile,
        isAuthenticated: !!token,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
