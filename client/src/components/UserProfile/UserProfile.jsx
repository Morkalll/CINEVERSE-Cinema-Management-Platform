
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { API_URL } from "../../services/api";
import { errorToast, successToast } from "../../utils/toast";


const statusConfig = {
    paid:      { label: "Pagado",     color: "#33cc66", bg: "#1a3d2a" },
    created:   { label: "Creado",     color: "#ffaa00", bg: "#3d3a1a" },
    pending:   { label: "Pendiente",  color: "#ffaa00", bg: "#3d3a1a" },
    cancelled: { label: "Cancelado (Manual)",  color: "#ff4444", bg: "#3d1a1a" },
    expired:   { label: "Cancelado (Auto)", color: "#ff8844", bg: "#3d221a" },
    refunding: { label: "Procesando Reembolso", color: "#ffbb33", bg: "#3d301a" },
    refunded:  { label: "Reembolsado", color: "#4488ff", bg: "#1a2a3d" },
    failed:    { label: "Fallido",    color: "#ff4444", bg: "#3d1a1a" },
};


export const UserProfile = () => 
{
    const { user, loading: authLoading, logout, token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [refundingOrderId, setRefundingOrderId] = useState(null);


    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => 
    {
        if (!user || !token) 
        {
            return;
        }

        setLoadingOrders(true);

        try 
        {
            const endpoint = `${API_URL}/orders/mine`;
            const res = await fetch(endpoint, 
            {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) 
            {
                const raw = await res.text().catch(() => "");

                let parsed = null;

                try 
                { 
                    parsed = raw ? JSON.parse(raw) : null; 
                } 

                catch { 
                    parsed = null; 
                }

                const msg = parsed?.message || raw || `Error (status ${res.status})`;

                errorToast(msg);

                setOrders([]);

                return;
            }

            const data = await res.json().catch(() => []);

            setOrders(Array.isArray(data) ? data : []);

        } 
        
        catch (err) 
        {
            console.error("Error al obtener órdenes", err);

            errorToast(err.message || "Error al obtener órdenes");

            setOrders([]);
        } 
        
        finally 
        {
            setLoadingOrders(false);
        }
    }, [user, token]);

    useEffect(() => 
    {
        fetchOrders();
    }, [fetchOrders]);


    const handleGoToLogin = () => 
    {
        navigate("/login");
    }


    const handleLogOut = () => 
    {
        logout();
        navigate("/login");
    };


    const handleRefund = async (orderId) => 
    {
        if (refundingOrderId === orderId) return;

        if (!window.confirm("¿Estás seguro de solicitar un reembolso para esta orden?")) 
        {
            return;
        }

        setRefundingOrderId(orderId);

        try 
        {
            const res = await fetch(`${API_URL}/payments/refund/${orderId}`, 
            {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
            });

            if (!res.ok) 
            {
                const err = await res.json().catch(() => null);
                throw new Error(err?.message || "Error al solicitar reembolso");
            }

            successToast("Reembolso procesado exitosamente");
            fetchOrders(); // Refresh orders list
        } 
        catch (err) 
        {
            console.error("Error refund:", err);
            errorToast(err.message || "Error al solicitar reembolso");
        }
        finally
        {
            setRefundingOrderId(null);
        }
    };


    const handlePay = async (orderId) => 
    {
        try 
        {
            const res = await fetch(`${API_URL}/payments/create-preference`, 
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ orderId }),
            });

            if (!res.ok) 
            {
                const err = await res.json().catch(() => null);
                throw new Error(err?.message || "Error al iniciar pago");
            }

            const data = await res.json();
            
            if (data.initPoint) 
            {
                window.location.href = data.initPoint;
            } 
            else if (data.sandboxInitPoint) 
            {
                window.location.href = data.sandboxInitPoint;
            } 
            else 
            {
                errorToast("No se pudo obtener el enlace de pago");
            }
        } 
        catch (err) 
        {
            console.error("Error pay:", err);
            errorToast(err.message || "Error al procesar el pago");
        }
    };


    const handleCancelUser = async (orderId) => 
    {
        if (!window.confirm("¿Estás seguro de que deseas cancelar este pedido?")) 
        {
            return;
        }

        try 
        {
            const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, 
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) 
            {
                const err = await res.json().catch(() => null);
                throw new Error(err?.message || "Error al cancelar orden");
            }

            successToast("Pedido cancelado exitosamente");
            fetchOrders();
        } 
        catch (err) 
        {
            console.error("Error cancel:", err);
            errorToast(err.message || "Error al cancelar el pedido");
        }
    };


    if (authLoading) 
    {
        return <div>Cargando perfil...</div>;
    }


    if (!user) 
    {
        return (
            <div>

                <h1>No has iniciado sesión.</h1>
                
                <Button variant="secondary" onClick={handleGoToLogin}>Iniciar sesión</Button>

            </div>
        );
    }


    const getStatusBadge = (status) => 
    {
        const config = statusConfig[status] || statusConfig.created;
        return (
            <span style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 600,
                color: config.color,
                backgroundColor: config.bg,
                border: `1px solid ${config.color}`,
                marginLeft: "8px",
            }}>
                {config.label}
            </span>
        );
    };


    return (

        <div>
            
            <h1>¡Bienvenido, {user.username}!</h1>

            <h1>Tus compras recientes:</h1>


            {loadingOrders ? 
            (
                <div>Cargando compras...</div>

            ) 
            
            : orders.length === 0 ? 
            (

                <div>No tenés compras aún.</div>

            ) 
            
            : (

                <ul>

                    {orders.map((order) => (
                        
                        <li key={order.id} style={{ marginBottom: 12 }}>
                            
                            <div>
                                
                                <strong>Orden #{order.id}</strong> 
                                {getStatusBadge(order.status)}
                                {" — "}
                                Total: ${Number(order.total || 0).toFixed(2)} — {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                            
                            </div>

                            <div>

                                <ul>
                                    {(order.orderItems || []).map((it) => {
                                        return (
                                            <li key={it.id || `${it.type}-${it.refId}`}>
                                                {it.name || `${it.type} #${it.refId}`} — Cant: {it.quantity} — Precio: ${Number(it.price || 0).toFixed(2)}
                                            </li>
                                        );
                                    })}
                                </ul>
                                

                            </div>

                            {(order.status === "paid" || order.status === "refunding") && (
                                <div style={{ marginTop: 6 }}>
                                    <button 
                                        onClick={() => handleRefund(order.id)}
                                        disabled={refundingOrderId === order.id}
                                        style={{
                                            padding: "5px 14px",
                                            backgroundColor: refundingOrderId === order.id ? "#1f1414" : "#2a1a1a",
                                            color: refundingOrderId === order.id ? "#888888" : "#ff6666",
                                            border: "1px solid #ff4444",
                                            borderRadius: "6px",
                                            cursor: refundingOrderId === order.id ? "not-allowed" : "pointer",
                                            fontSize: "13px",
                                            transition: "all 0.2s ease",
                                            opacity: refundingOrderId === order.id ? 0.6 : 1,
                                        }}
                                        onMouseOver={(e) => { if (refundingOrderId !== order.id) e.target.style.backgroundColor = "#3d1a1a"; }}
                                        onMouseOut={(e) => { if (refundingOrderId !== order.id) e.target.style.backgroundColor = "#2a1a1a"; }}
                                    >
                                        {refundingOrderId === order.id ? "⏳ Procesando..." : "💰 Solicitar Reembolso"}
                                    </button>
                                </div>
                            )}

                            {(order.status === "created" || order.status === "pending") && (
                                <div style={{ marginTop: 6 }}>
                                    <p style={{ color: "#ffaa00", fontSize: "12px", marginBottom: "8px", fontWeight: "bold" }}>
                                        ⏱️ Tienes 5 minutos desde la creación para pagar esta orden antes de que sea cancelada automáticamente.
                                    </p>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={() => handlePay(order.id)}
                                            style={{
                                                padding: "5px 14px",
                                                backgroundColor: "#1a2a1a",
                                                color: "#66ff66",
                                                border: "1px solid #44ff44",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                fontSize: "13px",
                                                transition: "all 0.2s ease",
                                            }}
                                            onMouseOver={(e) => { e.target.style.backgroundColor = "#1a3d1a"; }}
                                            onMouseOut={(e) => { e.target.style.backgroundColor = "#1a2a1a"; }}
                                        >
                                            💳 Pagar Pedido
                                        </button>
                                        <button 
                                            onClick={() => handleCancelUser(order.id)}
                                            style={{
                                                padding: "5px 14px",
                                                backgroundColor: "#2a1a1a",
                                                color: "#ff6666",
                                                border: "1px solid #ff4444",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                fontSize: "13px",
                                                transition: "all 0.2s ease",
                                            }}
                                            onMouseOver={(e) => { e.target.style.backgroundColor = "#3d1a1a"; }}
                                            onMouseOut={(e) => { e.target.style.backgroundColor = "#2a1a1a"; }}
                                        >
                                            ❌ Cancelar Pedido
                                        </button>
                                    </div>
                                </div>
                            )}

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
