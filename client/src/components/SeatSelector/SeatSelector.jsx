import { useState, useEffect } from "react";
import { successToast, errorToast } from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { API_URL } from "../../services/api";
import "./SeatSelector.css";


export default function SeatSelector({ rows = 5, seatsPerRow = 8, showingId, movieTitle, showingInfo,}) 
{
    const [selected, setSelected] = useState([]);
    const [occupied, setOccupied] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, token } = useAuth();
    const { addToCart, getItemQuantity, updateQuantity } = useCart();


    useEffect(() => 
    {
        const fetchOccupiedSeats = async () => 
        {
            if (!showingId) 
            {
                console.log("No se proporcionó showingId");
                return;
            }

            try 
            {
                setLoading(true);
                
                const response = await fetch(
                    `${API_URL}/seats/occupied?showingId=${showingId}`
                );

                if (!response.ok) 
                {
                    throw new Error("Error al obtener asientos ocupados");
                }

                const data = await response.json();
                setOccupied(data.occupiedSeats || []);
            } 
            catch (error) 
            {
                console.log('Error al cargar asientos', error);
                errorToast("Error al cargar los asientos ocupados");
            } 
            finally 
            {
                setLoading(false);
            }
        };

        fetchOccupiedSeats();
    }, [showingId]);


    // 🎯 Sincronizar asientos seleccionados con el carrito
    useEffect(() => 
    {
        if (!showingInfo) return;

        const currentQuantity = getItemQuantity(showingId, "ticket");
        const selectedCount = selected.length;

        // Si la cantidad en el carrito no coincide con los asientos seleccionados
        if (currentQuantity !== selectedCount) 
        {
            updateQuantity(showingId, "ticket", selectedCount);
        }
    }, [selected, showingId, showingInfo, getItemQuantity, updateQuantity]);


    const toggleSeat = (row, seat) => 
    {
        if (!user) 
        {
            errorToast("Debes iniciar sesión para seleccionar asientos.");
            return;
        }

        const id = `${row}-${seat}`;

        if (occupied.includes(id)) 
        {
            return;
        }

        setSelected(prev => {
            const isCurrentlySelected = prev.includes(id);
            const newSelection = isCurrentlySelected 
                ? prev.filter(seatSelected => seatSelected !== id) 
                : [...prev, id];

            // 🎯 Actualizar el carrito según la selección
            if (showingInfo) 
            {
                const price = Number(showingInfo.ticketPrice ?? showingInfo.price ?? 0);
                const available = showingInfo.capacity ?? null;

                if (!isCurrentlySelected) 
                {
                    // Seleccionando un asiento nuevo
                    if (available !== null && newSelection.length > available) 
                    {
                        errorToast("No hay más entradas disponibles para esta función.");
                        return prev;
                    }

                    addToCart({
                        refId: showingId,
                        type: "ticket",
                        name: `${movieTitle} — ${showingInfo.screenName} (${new Date(showingInfo.showtime).toLocaleString()})`,
                        price,
                    }, 1);
                } 
                else 
                {
                    // Deseleccionando un asiento
                    const currentQuantity = getItemQuantity(showingId, "ticket");
                    if (currentQuantity > 0) 
                    {
                        updateQuantity(showingId, "ticket", currentQuantity - 1);
                    }
                }
            }

            return newSelection;
        });
    };


    const handleConfirm = async () => 
    {
        if (!user) 
        {
            errorToast("Debes iniciar sesión para continuar.");
            return;
        }

        if (selected.length === 0) 
        {
            errorToast("Debes seleccionar al menos un asiento.");
            return;
        }

        try 
        {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/seats/reserve`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        showingId: showingId,
                        seats: selected
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) 
            {
                throw new Error(data.message || "Error al reservar asientos");
            }

            successToast(`¡Reserva confirmada! ${selected.length} asiento${selected.length > 1 ? 's' : ''}`);
            
            setOccupied(prev => [...prev, ...selected]);
            setSelected([]);
        } 
        catch (error) 
        {
            console.log('Error al reservar', error);
            errorToast("Error al confirmar la reserva");
            
            try 
            {
                const response = await fetch(
                    `${API_URL}/seats/occupied?showingId=${showingId}`
                );

                if (response.ok) 
                {
                    const data = await response.json();
                    setOccupied(data.occupiedSeats || []);
                }
            } 
            catch (reloadError) 
            {
                console.error('Error al recargar asientos:', reloadError);
            }
        } 
        finally 
        {
            setLoading(false);
        }
    };


    if (loading && occupied.length === 0) 
    {
        return (
            <div className="seat-selector-container">
                <div className="loading-message">
                    <p>Cargando asientos...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="seat-selector-container">
            <h2 className="seat-selector-title">Selecciona tus asientos</h2>

            <div className="seat-grid">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div className="seat-row" key={rowIndex}>
                        {Array.from({ length: seatsPerRow }).map((_, seatIndex) => 
                        {
                            const id = `${rowIndex + 1}-${seatIndex + 1}`;
                            const isSelected = selected.includes(id);
                            const isOccupied = occupied.includes(id);

                            return (
                                <div 
                                    key={id} 
                                    className={`seat ${isSelected ? "selected" : ""} ${isOccupied ? "occupied" : ""}`}
                                    onClick={() => toggleSeat(rowIndex + 1, seatIndex + 1)}
                                >
                                    {seatIndex + 1}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="seat-status">
                <span><div className="seat available"></div> Disponible</span>
                <span>
                    <div className="seat selected"></div> 
                    Seleccionado {selected.length > 0 && `(${selected.length})`}
                </span>
                <span><div className="seat occupied"></div> Ocupado</span>
            </div>

            <button 
                className="confirm-button" 
                onClick={handleConfirm} 
                disabled={loading || selected.length === 0}
            >
                {loading ? 'Procesando...' : 'Confirmar selección'}
            </button>
        </div>
    );
}