
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { successToast, errorToast } from "../../../utils/toast";
import { NavBar } from "../../navBar/NavBar";
import "./PaymentResult.css";


export const PaymentResult = ({ status }) => 
{
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [orderId, setOrderId] = useState(null);
    const [verifying, setVerifying] = useState(false);


    useEffect(() => 
    {
        const id = searchParams.get("orderId") || searchParams.get("external_reference");
        const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");
        const mpStatusParam = searchParams.get("status") || searchParams.get("collection_status");
        setOrderId(id);

        if (status === "success" && id) 
        {
            successToast("¡Pago realizado con éxito!");
            const authToken = token || localStorage.getItem("token");
            if (authToken) 
            {
                setVerifying(true);
                apiRequest("/payments/verify", "POST", { 
                    orderId: id, 
                    paymentId,
                    status: mpStatusParam 
                }, authToken)
                    .catch((err) => console.error("Error al verificar pago:", err))
                    .finally(() => setVerifying(false));
            }
        } 
        else if (status === "failure") 
        {
            errorToast("El pago no pudo completarse.");
        }

    }, [searchParams, status, token]);


    const getStatusConfig = () => 
    {
        switch (status) 
        {
            case "success":
                return {
                    icon: "✅",
                    title: "¡Pago Exitoso!",
                    message: "Tu pago ha sido procesado correctamente.",
                    color: "#4caf50",
                    bgGradient: "linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05))",
                    borderColor: "rgba(76, 175, 80, 0.3)",
                };

            case "failure":
                return {
                    icon: "❌",
                    title: "Pago Fallido",
                    message: "No se pudo procesar tu pago. Intentá nuevamente.",
                    color: "#f44336",
                    bgGradient: "linear-gradient(135deg, rgba(244, 67, 54, 0.15), rgba(244, 67, 54, 0.05))",
                    borderColor: "rgba(244, 67, 54, 0.3)",
                };

            case "pending":
                return {
                    icon: "⏳",
                    title: "Pago Pendiente",
                    message: "Tu pago está siendo procesado. Te notificaremos cuando se confirme.",
                    color: "#ff9800",
                    bgGradient: "linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 152, 0, 0.05))",
                    borderColor: "rgba(255, 152, 0, 0.3)",
                };

            default:
                return {
                    icon: "ℹ️",
                    title: "Estado Desconocido",
                    message: "No pudimos determinar el estado de tu pago.",
                    color: "#9e9e9e",
                    bgGradient: "linear-gradient(135deg, rgba(158, 158, 158, 0.15), rgba(158, 158, 158, 0.05))",
                    borderColor: "rgba(158, 158, 158, 0.3)",
                };
        }
    };


    const config = getStatusConfig();


    const handleRetry = () => 
    {
        navigate("/checkout");
    };


    const handleGoToProfile = () => 
    {
        navigate("/profile");
    };


    return (

        <div className="payment-result-container">
            
            <NavBar />

            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "calc(100vh - 80px)",
                padding: "20px",
            }}>

                <div style={{
                    background: config.bgGradient,
                    border: `1px solid ${config.borderColor}`,
                    borderRadius: "16px",
                    padding: "48px 40px",
                    maxWidth: "500px",
                    width: "100%",
                    textAlign: "center",
                    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px ${config.borderColor}`,
                }}>

                    <div style={{
                        fontSize: "64px",
                        marginBottom: "24px",
                        animation: "fadeIn 0.5s ease-in",
                    }}>
                        {config.icon}
                    </div>

                    <h1 style={{
                        color: config.color,
                        fontSize: "28px",
                        fontWeight: "700",
                        marginBottom: "12px",
                    }}>
                        {config.title}
                    </h1>

                    <p style={{
                        color: "#b0b0b0",
                        fontSize: "16px",
                        lineHeight: "1.6",
                        marginBottom: "24px",
                    }}>
                        {config.message}
                    </p>

                    {orderId && (
                        <div style={{
                            background: "rgba(153, 51, 255, 0.1)",
                            border: "1px solid rgba(153, 51, 255, 0.3)",
                            borderRadius: "8px",
                            padding: "12px 16px",
                            marginBottom: "24px",
                        }}>
                            <span style={{ color: "#9933ff", fontSize: "14px", fontWeight: "600" }}>
                                Orden #{orderId}
                            </span>
                        </div>
                    )}

                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        marginTop: "16px",
                    }}>

                        {status === "failure" && (
                            <button
                                onClick={handleRetry}
                                style={{
                                    padding: "12px 24px",
                                    background: "linear-gradient(135deg, #9933ff, #7722cc)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                }}
                                onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                                onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
                            >
                                Reintentar Pago
                            </button>
                        )}

                        <button
                            onClick={handleGoToProfile}
                            style={{
                                padding: "12px 24px",
                                background: status === "failure" ? "transparent" : "linear-gradient(135deg, #9933ff, #7722cc)",
                                color: "#fff",
                                border: status === "failure" ? "1px solid rgba(153, 51, 255, 0.5)" : "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                            }}
                            onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                            onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
                        >
                            Ver Mis Pedidos
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
};
