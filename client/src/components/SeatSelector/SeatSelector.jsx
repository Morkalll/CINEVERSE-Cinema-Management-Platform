
import { useState, useEffect } from "react";
import { errorToast } from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { apiRequest } from "../../services/api";
import { useNavigate } from "react-router";
import { formatDate } from "../../utils/helper";
import "./SeatSelector.css";


export default function SeatSelector({ rows = 5, seatsPerRow = 8, showingId, movieTitle, showingInfo }) 
{
    const [occupied, setOccupied] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [, setPreviousShowingId] = useState(showingId);
    
    const { user } = useAuth();
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();

    const cartItem = cart.find(item => item.refId === showingId && item.type === "ticket");
    const selected = cartItem?.seats || [];


    useEffect(() => 
    {
        setPreviousShowingId(prev => {
            if (prev !== null && prev !== showingId) {
                removeFromCart(prev, "ticket");
            }
            return showingId;
        });

    }, [showingId, removeFromCart]);


    useEffect(() => 
    {
        const fetchOccupiedSeats = async (isBackground = false) => 
        {
            if (!showingId) 
            {
                console.log("No se proporcionó showingId");
                return;
            }

            try 
            {
                if (!isBackground) setLoading(true);
                
                const data = await apiRequest(`/seats/occupied?showingId=${showingId}`);
                setOccupied(data.occupiedSeats || []);
            } 

            catch (error) 
            {
                console.log('Error al cargar asientos', error);
                errorToast("Error al cargar los asientos ocupados");
            } 

            finally 
            {
                if (!isBackground) setLoading(false);
            }
        };

        fetchOccupiedSeats();
        const intervalId = setInterval(() => fetchOccupiedSeats(true), 10000);
        return () => clearInterval(intervalId);

    }, [showingId]);


    useEffect(() => 
    {
        if (occupied.length === 0 || selected.length === 0) return;

        const newlyOccupied = selected.filter(id => occupied.includes(id));
        if (newlyOccupied.length > 0) 
        {
            const validSelection = selected.filter(id => !newlyOccupied.includes(id));
            if (validSelection.length === 0) {
                updateQuantity(showingId, "ticket", 0, []);
            } else {
                updateQuantity(showingId, "ticket", validSelection.length, validSelection);
            }
            errorToast("Algunos de tus asientos seleccionados ya no están disponibles.");
        }
    }, [occupied, selected, showingId, updateQuantity]);





    const handleGoToCandy = () =>
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

        navigate("/candy");
    }


    const toggleSeat = (row, seat) => 
    {
        if (!user) 
        {
            errorToast("Debes iniciar sesión para seleccionar asientos.");
            return;
        }

        const newSelection = [];
        for (let i = 0; i < ticketQuantity; i++) {
            const currentSeat = seat + i;
            if (currentSeat > seatsPerRow) {
                errorToast("No hay suficientes asientos contiguos en esta fila.");
                return;
            }
            
            const id = `${row}-${currentSeat}`;
            if (occupied.includes(id)) {
                errorToast("No hay suficientes asientos libres contiguos a partir del seleccionado.");
                return;
            }
            newSelection.push(id);
        }

        const price = Number(showingInfo?.ticketPrice ?? showingInfo?.price ?? 0);
        
        if (selected.length === 0) {
            addToCart({
                refId: showingId,
                type: "ticket",
                name: `${movieTitle} — Sala : ${showingInfo?.screenId} (${formatDate(showingInfo?.showtime)})`,
                price,
                seats: newSelection, 
            }, ticketQuantity);
        } else {
            updateQuantity(showingId, "ticket", ticketQuantity, newSelection);
        }
    };


    const handleQuantityChange = (newQty) => 
    {
        setTicketQuantity(newQty);
        if (selected.length > 0) 
        {
            removeFromCart(showingId, "ticket");
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

            <h2 className="seat-selector-title">Selecciona tus asientos {selected.length > 0 && `(${selected.length})`}</h2>

            <div className="ticket-quantity-selector">
                <label htmlFor="quantity">Cantidad de Entradas:</label>
                <select 
                    id="quantity" 
                    value={ticketQuantity} 
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num}</option>
                    ))}
                </select>
            </div>
            
            {ticketQuantity > 1 && (
                <p className="seat-hint">
                    Al elegir una butaca, se seleccionarán automáticamente {ticketQuantity - 1} más a su derecha.
                </p>
            )}

            <div className="seat-grid">

                {Array.from({ length: rows }).map((_, rowIndex) => 
                (
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
                                    onClick={() => toggleSeat(rowIndex + 1, seatIndex + 1)}>

                                    {seatIndex + 1}

                                </div>
                            );

                        })}

                    </div>

                ))}

            </div>


            <div className="seat-status">
                <span><div className="seat available"></div> Disponible</span>
                <span><div className="seat selected"></div> Seleccionado</span>
                <span><div className="seat occupied"></div> Ocupado</span>
            </div>


            <button 
                className="confirm-button" 
                onClick={handleGoToCandy} 
                disabled={loading || selected.length === 0}>

                Continuar compra

            </button>

        </div>

    );
    
}