import { Link } from 'react-router-dom';
import './CandyCard.css';

export const CandyCard = ({id, name, image}) =>{
    return(
        <Link to = {`/candy/${id}`} className='candy-card-link'>
            
            <div className='candy-card'>
                <div className='candy-image-container'>
                    <img src = {image} alt = {name} className='candy-image' />
                </div>
                <div className='candy-name'>{name}</div> 
            </div>

        </Link>
    );
};