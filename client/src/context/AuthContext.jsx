/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import { API_URL, apiRequest } from "../services/api";
import { jwtDecode } from "jwt-decode";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => 
{
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => 
    {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser) 
        {
            try 
            {
                setUser(JSON.parse(storedUser));
            } 
            
            catch (error) 
            {
                console.warn("Error de parsing sobre el usuario almacenado", error);
            }
        }

        if (storedToken) 
        {
            try {
                const payload = jwtDecode(storedToken);
                if (payload.exp * 1000 > Date.now()) {
                    setToken(storedToken);
                    if (!storedUser) {
                        const normalized = {
                            id: payload.id,
                            username: payload.username,
                            email: payload.email,
                            role: payload.role,
                            exp: payload.exp,
                        };
                        setUser(normalized);
                    }
                } else {
                    console.warn("Token expirado en inicialización.");
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    setUser(null);
                }
            } catch (error) {
                console.warn("No se pudo decodificar el token", error);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                setUser(null);
            }
        } else if (storedUser) {
            localStorage.removeItem("user");
            setUser(null);
        }

        setLoading(false);

    }, []);


    useEffect(() => {
        const handleAuthExpired = () => {
            console.warn("Sessión expirada, cerrando sesión.");
            setUser(null);
            setToken(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            window.dispatchEvent(new Event("auth:logout"));
        };

        window.addEventListener("auth:expired", handleAuthExpired);
        return () => window.removeEventListener("auth:expired", handleAuthExpired);
    }, []);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === "user") {
                try {
                    setUser(e.newValue ? JSON.parse(e.newValue) : null);
                } catch(err) {
                    setUser(null);
                }
            }
            if (e.key === "token") {
                setToken(e.newValue || null);
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    useEffect(() => 
    {
        if (user) 
        {
            localStorage.setItem("user", JSON.stringify(user));
        }

        else 
        {
            localStorage.removeItem("user");
        }


        if (token) 
        {
            localStorage.setItem("token", token);
        }

        else 
        {
            localStorage.removeItem("token");
        }

    }, [user, token]);


    const login = async (email, password) => 
    {
        try 
        {
            const data = await apiRequest(`/auth/login`, "POST", { email, password });

            if (data.user) 
            {
                const user = data.user;
                const normalized = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                };

                setUser(normalized);
            }


            if (data.token) 
            {
                setToken(data.token);
                try 
                {
                    const payload = jwtDecode(data.token);
                    const normalized = 
                    {
                        id: payload.id,
                        username: payload.username,
                        email: payload.email,
                        role: payload.role,
                        exp: payload.exp,
                    };

                    setUser(normalized);

                } 
                
                catch (error) 
                {
                    console.warn("No se pudo decodificar token:", error);
                }
            }

            return { success: true, data };

        } 
        
        catch (err) 
        {
            console.error("Login error:", err);
            return { success: false, error: err.message || "Error" };
        }

    };


    const logout = () => 
    {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("auth:logout"));
    };


    const fetchProfile = async () => 
    {
        if (!token || !user?.id) return;
        try
        {
            const data = await apiRequest(`/users/${user.id}`, "GET", null, token);

            const normalized = {
                id: data.id,
                username: data.username,
                email: data.email,
                role: data.role,
            };

            setUser(normalized);

        } 
        
        catch (err) 
        {
            console.error("Error al actualizar perfil", err);
        }

    };


    const value = 
    {
        user,
        token,
        loading,
        login,
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
