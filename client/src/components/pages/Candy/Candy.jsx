
import { CandyListings } from '../../CandyListings/CandyListings';
import { NavBar } from '../../navBar/NavBar';
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
                className='candy-confirm-button'
                onClick={handleGoToCheckout}
                >Continuar compra</button>

            </section>

            <section className='Candy-Listings'>

                <CandyListings />

            </section>


        </div>

    )

}