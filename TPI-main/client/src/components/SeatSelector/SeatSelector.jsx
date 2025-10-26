
import { useState } from "react";
import "./SeatSelector.css";


export default function SeatSelector({ rows = 5, seatsPerRow = 8, occupied = [], onConfirm }) 
{
    const [selected, setSelected] = useState([]);

    const toggleSeat = (row, seat) => 
    {
        const id = `${row}-${seat}`;

        if (occupied.includes(id))
        { 
            return;
        }

        setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

    };


    const handleConfirm = () => 
    {
        if (onConfirm) 
        {
            onConfirm(selected);
        }
    };


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
                                className={`seat 
                                    ${isSelected ? "selected" : ""} 
                                    ${isOccupied ? "occupied" : ""}`}
                                onClick={() => toggleSeat(rowIndex + 1, seatIndex + 1)}>

                                {seatIndex + 1}

                                </div>
                            );

                        })}

                    </div>

                ))}

            </div>


            <div className="seat-legend">

                <span><div className="seat available"></div> Disponible</span>
                <span><div className="seat selected"></div> Seleccionado</span>
                <span><div className="seat occupied"></div> Ocupado</span>

            </div>


            <button className="confirm-button" onClick={handleConfirm}>

                Confirmar selección

            </button>


        </div>

    );

}

