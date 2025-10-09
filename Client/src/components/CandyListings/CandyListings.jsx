import './CandyListings.css';

import { useEffect, useState } from 'react';
import { CandyCard } from '../CandyCard/CandyCard';


export const CandyListings = () => {
    const [candy, setCandy] = useState([]);
    useEffect(() => {
      const fetchCandy = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/candylistings'); // Mover local host 3000 a archivo de config
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setCandy(await response.json());
        } catch (error) {
        
        }}
        fetchCandy();
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
                    stock={candy.stock}
                    price={candy.price}
                />
            ))}
        </div>
    );
};

