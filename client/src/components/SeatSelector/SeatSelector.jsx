
import { useState, useEffect } from "react";
import { errorToast } from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { API_URL } from "../../services/api";
import { useNavigate } from "react-router";
import "./SeatSelector.css";


export default function SeatSelector({ rows = 5, seatsPerRow = 8, showingId, movieTitle, showingInfo }) 
{
    const [selected, setSelected] = useState([]);
    const [occupied, setOccupied] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previousShowingId, setPreviousShowingId] = useState(showingId);
    
    const { user } = useAuth();
    const { addToCart, getItemQuantity, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();


    useEffect(() => 
    {
        if (previousShowingId !== null && previousShowingId !== showingId) 
        {
            removeFromCart(previousShowingId, "ticket");
        }

        setPreviousShowingId(showingId);

        setSelected([]);

    }, [showingId]);


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


    useEffect(() => 
    {
        if (!showingInfo) return;

        const selectedCount = selected.length;
        const currentQuantity = getItemQuantity(showingId, "ticket");

        if (currentQuantity !== selectedCount) 
        {
            if (selectedCount > 0 && currentQuantity === 0) 
            {
                const price = Number(showingInfo.ticketPrice ?? showingInfo.price ?? 0);
                
                addToCart({
                    refId: showingId,
                    type: "ticket",
                    name: `${movieTitle} — ${showingInfo.screenName} (${new Date(showingInfo.showtime).toLocaleString()})`,
                    price,
                    seats: selected, 
                }, selectedCount);
            }

            else 
            {
                updateQuantity(showingId, "ticket", selectedCount, selected); 
            }
        }

    }, [selected, showingId, showingInfo, getItemQuantity, updateQuantity, addToCart, movieTitle]);


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

        const id = `${row}-${seat}`;

        if (occupied.includes(id)) 
        {
            return;
        }

        setSelected(prev => 
        {
            const isCurrentlySelected = prev.includes(id);

            const newSelection = isCurrentlySelected 
            ? prev.filter(seatSelected => seatSelected !== id) 
            : [...prev, id];

            return newSelection;
        });
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