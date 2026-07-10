
import './CandyListings.css';

import { useEffect, useState } from 'react';
import { CandyCard } from '../CandyCard/CandyCard';
import { API_URL } from '../../services/api';


export const CandyListings = () => 
{
    const [candy, setCandy] = useState([]);

    useEffect(() => 
    {
      const fetchCandy = async () => 
        {
            try 
            {
                const response = await fetch(`${API_URL}/candy`);

                if (!response.ok) 
                {
                    throw new Error("Error al traer los candy")
                }

                setCandy(await response.json());

            } 
            
            catch (error) 
            {
                console.error("Error al obtener los productos", error);
            }}
                
        fetchCandy();

    }, []);

    return (

        <div className='snackbar'>

            {candy.map(item => (
                
                <CandyCard
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    image={item.image}
                    description={item.description}
                    stock={item.stock}
                    price={item.price}
                />

            ))}

        </div>
    );
};

