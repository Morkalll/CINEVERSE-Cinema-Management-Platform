
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { API_URL } from "../../services/api";
import { successToast, errorToast } from "../../utils/toast";

export const UserProfile = () => {
    const { user, loading: authLoading, logout, token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || !token) return;
            setLoadingOrders(true);
            try {
                const endpoint = (API_URL || "http://localhost:3000/api").replace(/\/+$/, "") + "/orders/mine";
                const res = await fetch(endpoint, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    const raw = await res.text().catch(() => "");
                    let parsed = null;
                    try { parsed = raw ? JSON.parse(raw) : null; } catch (e) { parsed = null; }
                    const msg = parsed?.message || raw || `Error (status ${res.status})`;
                    errorToast(msg);
                    setOrders([]);
                    return;
                }

                const data = await res.json().catch(() => []);
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("fetchOrders error:", err);
                errorToast(err.message || "Error al obtener órdenes");
                setOrders([]);
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchOrders();
    }, [user, token]);

    const handleGoToLogin = () => navigate("/login");

    const handleLogOut = () => {
        logout();
        navigate("/login");
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("¿Estás seguro que querés cancelar esta orden?")) return;
        try {
            const endpoint = (API_URL || "http://localhost:3000/api").replace(/\/+$/, "") + `/orders/${orderId}`;
            const res = await fetch(endpoint, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const raw = await res.text().catch(() => "");
                let parsed = null;
                try { parsed = raw ? JSON.parse(raw) : null; } catch (e) { parsed = null; }
                const msg = parsed?.message || raw || `Error al cancelar (status ${res.status})`;
                throw new Error(msg);
            }

            const body = await res.json().catch(() => ({ success: true }));
            successToast(body.message || "Orden cancelada correctamente");
            // eliminar la orden de la UI local
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
        } catch (err) {
            console.error("cancel order error:", err);
            errorToast(err.message || "Error al cancelar la orden");
        }
    };

    if (authLoading) return <div>Cargando perfil...</div>;
    if (!user) {
        return (
            <div>
                <h1>No has iniciado sesión.</h1>
                <Button variant="secondary" onClick={handleGoToLogin}>Iniciar sesión</Button>
            </div>
        );
    }

    return (
        <div>
            <h1>¡Bienvenido, {user.username}!</h1>

            <h1>Tus compras recientes:</h1>

            {loadingOrders ? (
                <div>Cargando compras...</div>
            ) : orders.length === 0 ? (
                <div>No tenés compras aún.</div>
            ) : (
                <ul>
                    {orders.map((order) => (
                        <li key={order.id} style={{ marginBottom: 12 }}>
                            <div>
                                <strong>Orden #{order.id}</strong> — Total: ${Number(order.total || 0).toFixed(2)} — {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                            </div>

                            <div>
                                {/** mostrar items de forma simple */}
                                <ul>
                                    {(order.OrderItems || order.orderItems || order.items || []).map((it) => (
                                        <li key={it.id || `${it.type}-${it.refId}`}>
                                            {it.name || `${it.type} #${it.refId}`} — Cant: {it.quantity} — Precio: ${Number(it.price || 0).toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <Button variant="danger" size="sm" onClick={() => handleCancelOrder(order.id)}>Cancelar orden</Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <div style={{ marginTop: 16 }}>
                <Button variant="secondary" onClick={handleLogOut}>Cerrar sesión</Button>
            </div>
        </div>
    );
};
