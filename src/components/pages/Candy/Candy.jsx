import { CandyListings } from '../../CandyListings/CandyListings';
import { NavBar } from '../../NavBar/NavBar';
import './Candy.css';

export const Candy = () => {

    return (

        <div className="NavBar">
            <NavBar />
           
            <section className='Candy-Listings'>
                <CandyListings />
            </section>
            
        </div>

    )

}