import { React } from 'react';
import './CandyCard.css';

export const CandyCard = ({id, name, image, description, available, price}) =>{
    return(
        
            
            <div className='candy-card'>
                <div className='candy-image-container'>
                    <img src = {image} alt = {name} className='candy-image' />
                </div>
                <div className='candy-name'>{name}</div> 

                <div className='Candy-Details'>
                    <p className='candy-description'>{description}</p>
                    <p className='candy-price'>Precio: ${price}</p>
                    <p className='candy-available'>{available ? 'En stock' : 'Sin stock'}</p>

                    <div className='candy-bottom'>
                        <button className='add-button-new'>+</button>
                </div>

                </div>
            </div>

        
    );
};