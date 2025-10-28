
import { CandyListings } from '../../CandyListings/CandyListings';
import { NavBar } from '../../NavBar/NavBar';
import { useNavigate } from 'react-router';
import './Candy.css';


export const Candy = () => 
{
    const navigate = useNavigate()

    const handleGoToCheckout = () =>
    {
        navigate("/checkout")
    }


    return (

        <div className="NavBar">

            <NavBar />

            <h2> ‎ </h2>

            <section>

                <button 
                className='confirm-button'
                onClick={handleGoToCheckout}
                >Continuar compra</button>

            </section>

            <section className='Candy-Listings'>

                <CandyListings />

            </section>


        </div>

    )

}