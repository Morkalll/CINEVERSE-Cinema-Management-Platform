import './CandyListings.css';

import { useEffect, useState } from 'react';
import { CandyCard } from '../CandyCard/CandyCard';
import { CandyMock } from '../../data/CandyMock.js';

export const CandyListings = () => {
    const [candy, setCandy] = useState([]);
    useEffect(() => {
        // Simula la carga desde backend
        setCandy(CandyMock);
    }, []);

    return (
        <div className='snackbar'>
            {candy.map(candy => (
                <CandyCard
                    key={candy.id}
                    id={candy.id}
                    name={candy.name}
                    image={candy.image}
                    description={candy.description}
                    available={candy.available}
                    price={candy.price}
                />
            ))}
        </div>
    );
};

