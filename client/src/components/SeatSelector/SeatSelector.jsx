
import { useState, useEffect } from "react";
import { successToast, errorToast } from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/api";
import "./SeatSelector.css";


export default function SeatSelector ({rows = 5, seatsPerRow = 8, showingId}) 
{
    const [selected, setSelected] = useState([]);
    const [occupied, setOccupied] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, token } = useAuth();


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
                
                const response = await fetch
                (
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


    const toggleSeat = (row, seat) => 
    {
        const id = `${row}-${seat}`;

        if (occupied.includes(id)) 
        {
            return;
        }

        setSelected(prev => prev.includes(id) 
            ? prev.filter(seatSelected => seatSelected !== id) 
            : [...prev, id]
        );
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

            const response = await fetch
            (
                `${API_URL}/seats/reserve`,
                {
                    method: "POST",

                    headers:
                    {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify(
                    {
                        userId: user.id,
                        showingId: showingId,
                        seats: selected
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al reservar asientos");
            }

            successToast(`¡Reserva confirmada! ${selected.length}
            asiento${selected.length > 1 
            ? 's' 
            : ''}`);
            
            setOccupied(prev => [...prev, ...selected]);

            setSelected([]);


        } 
        
        catch (error) 
        {
            console.log('Error al reservar', error);
            errorToast("Error al confirmar la reserva");
            
            try 
            {
                const response = await fetch
                (
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

                {Array.from({ length: rows }).map((_, rowIndex) => 
                (
                    <div className="seat-row" key={rowIndex}>

                        {Array.from({ length: seatsPerRow }).map((_, seatIndex) => 
                        {
                            const id = `${rowIndex + 1}-${seatIndex + 1}`;
                            const isSelected = selected.includes(id);
                            const isOccupied = occupied.includes(id);

                            return (

                                <div key={id} className={`seat ${isSelected ? "selected" : ""} ${isOccupied ? "occupied" : ""}`}
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

                <span>

                    <div className="seat selected"></div> 

                    Seleccionado {selected.length > 0 && `(${selected.length})`}

                </span>

                <span><div className="seat occupied"></div> Ocupado</span>

            </div>


            <button 

                className="confirm-button" onClick={handleConfirm} disabled={loading || selected.length === 0}>

                {loading ? 'Procesando...' : 'Confirmar selección'}

            </button>

        </div>

    );

}