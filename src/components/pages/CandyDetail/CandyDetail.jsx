import { useState, useEffect } from 'react';
import { CandyMock } from '../../../data/CandyMock';
import { NavBar } from '../../NavBar/NavBar';
import './CandyDetail.css'; 
import { useParams } from 'react-router-dom';

export const CandyDetail = () => {
    const [candy, setCandy] = useState(null);
    const { id } = useParams(); 

    useEffect(() => {
        const foundCandy = CandyMock.find(item => item.id === parseInt(id));
        setCandy(foundCandy);
    }, [id]);

    if (!candy) {
        return <h2>Dulce no encontrado.</h2>; 
    }

    return (
        <div> 
            <NavBar />
            
            
            <div className='candy-detail-card'>
                <div className='candy-image-container'>
                    
                    <img src={candy.image} alt={candy.name} />
                </div>
                <h2>{candy.name}</h2>
                <div className='product-info'>
                    <p><strong>Precio:</strong> ${candy.price}</p>
                    <p><strong>Descripción:</strong> {candy.description}</p>
                    <p>
                        <strong>Disponibilidad:</strong>{' '}
                        {candy.available ? 'Disponible' : 'No disponible'}
                    </p>
                </div>
            </div>
        </div>
    );
};