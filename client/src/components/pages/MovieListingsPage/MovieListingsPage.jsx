
import { MovieListings } from '../../MovieListings/MovieListings';
import { NavBar } from '../../navBar/NavBar';


export const MovieListingsPage = () => 
{

    return (

        <div className="NavBar">

            <NavBar />

            <section className='Movie-Listings'>

                <MovieListings />
                
            </section>

        </div>

    )

}