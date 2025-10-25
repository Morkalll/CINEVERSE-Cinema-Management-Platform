
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NavBar } from '../../NavBar/NavBar';
import './MovieDetail.css';
import  SeatSelector  from "../../SeatSelector/SeatSelector";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { successToast, errorToast } from "../../../utils/toast";


export const MovieDetail = () => 
{
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const { user } = useAuth();


  useEffect(() => 
  {
    const fetchMovie = async (movieId) => 
    {
      try 
      {
        const response = await fetch('http://localhost:3000/api/movielistings/' + movieId);

        if (!response.ok)
        {
          console.log(response)
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setMovie(await response.json());

      } 
      
      catch (error) 
      {
        console.error("Error fetching movie:", error);
      } 
      
      finally 
      {
        setLoading(false);
      }

    };


    if (id) 
    {
      fetchMovie(id);
    }

  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!movie) return <div>No se encontró la película</div>;


  const releaseFullYear = new Date(movie.releaseDate).getFullYear();
  const releaseMonth = new Date(movie.releaseDate).getMonth() + 1;
  const releaseDay = new Date(movie.releaseDate).getDate();

/*REVISAR ESTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO*/
  const showtimes = movie.showtimes
    || movie.movieShowings
    || movie.MovieShowings
    || movie.showings
    || movie.MovieShowing
    || movie.showingsList
    || [];
/*REVISAR ESTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO*/


  const handleAddTicket = (showtime) => 
  {
    if (!user) 
    {
      alert("Debes iniciar sesión para comprar entradas.");
      return;
    }

    const item = 
    {
      refId: showtime.id,
      type: "ticket",
      name: `${movie.title} — ${showtime.screenName} (${new Date(showtime.showtime).toLocaleString()})`,
      price: Number(showtime.ticketPrice ?? showtime.price ?? 0),
    };

    addToCart(item, 1);

  };

  return (

    <div>

      <NavBar />

      <div className="movie-detail-container">

        <div className="poster-section">

          <img src={movie.poster} alt={movie.title} />

          <div className="extra-info">

            <p>{movie.synopsis}</p>
            <p><strong>────────────────</strong></p>
            <p><strong>Género:</strong> {movie.genre}</p>
            <p><strong>────────────────</strong></p>
            <p><strong>Duración:</strong> {movie.duration} minutos</p>
            <p><strong>────────────────</strong></p>
            <p><strong>Calificación:</strong> {movie.rating}</p>
            <p><strong>────────────────</strong></p>
            <p><strong>Director:</strong> {movie.director}</p>
            <p><strong>────────────────</strong></p>
            <p><strong>Fecha de estreno:</strong> {releaseDay} / {releaseMonth} / {releaseFullYear}</p>

          </div>

        </div>


        <div className="movie-details-right-side">

          <h2 className="movie-title">{movie.title}</h2>

          <div className="section-showtimes">

            <h3>HORARIOS</h3>

            {showtimes.length === 0 ? 
            (
              <p>No hay funciones disponibles.</p>
            ) 
            
            : (
              
              <ul>
                
                {showtimes.map((screen) => 
                {
                  const quantityInCart = getItemQuantity(screen.id, "ticket");
                  const available = screen.capacity ?? null;
                  const price = Number(screen.ticketPrice ?? screen.price ?? 0);


                  const handlePlus = () => 
                  {
                    if (!user) 
                    {
                      errorToast("Debes iniciar sesión para comprar entradas.");
                      return;
                    }

                    if (available !== null && quantityInCart >= available) 
                    {
                      errorToast("No hay más entradas disponibles para esta función.");
                      return;
                    }

                    addToCart(
                      {
                        refId: screen.id,
                        type: "ticket",
                        name: `${movie.title} — ${screen.screenName} (${new Date(screen.showtime).toLocaleString()})`,
                        price,
                      }, 1
                    );

                    successToast("Entrada agregada al carrito");

                  };


                  const handleMinus = () => 
                  {
                    if (quantityInCart <= 0) 
                    {
                      return;
                    }

                    updateQuantity(screen.id, "ticket", quantityInCart - 1);

                    successToast("Cantidad actualizada");

                  };


                  return (

                    <li key={screen.id} style={{ marginBottom: "0.6rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      
                      <div style={{ flex: 1 }}>
                        
                        <div style={{ marginBottom: "0.25rem", fontWeight: 600 }}>
                          
                          <strong>{screen.screenName}</strong> — {new Date(screen.showtime).toLocaleString()}
                        
                        </div>
                        
                        <div style={{ marginBottom: "0.25rem", color: "#666" }}>
                          
                          Precio: ${price} {available !== null && <span style={{ marginLeft: 8 }}>• Disponible: {available}</span>}
                        
                        </div>

                      </div>


                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        
                        <button
                          onClick={handleMinus}
                          aria-label={`Restar entrada ${movie.title} ${screen.screenName}`}
                          className="quantity-button"
                        > - </button>

                        <div style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>

                          {quantityInCart}

                        </div>

                        <button
                          onClick={handlePlus}
                          aria-label={`Sumar entrada ${movie.title} ${screen.screenName}`}
                          className="quantity-button"
                        > + </button>

                      </div>

                    </li>

                  );

                })}

              </ul>

            )}

          </div>


          <div className="section-seats">
          
            <h3 style={{ marginTop: "2rem" }}>SELECCIÓN DE ASIENTOS</h3>

            <SeatSelector
            onConfirm={(seats) => 
            {
              if (!user) 
              {
                errorToast("Debes iniciar sesión para continuar.");
                return;
              }

              if (seats.length === 0) 
              { 
                errorToast("Debes seleccionar al menos un asiento.");
                return;
              }

              successToast(`Seleccionaste ${seats.length} asientos: ${seats.join(", ")}`);

            }}
            
          /></div>

        </div>

      </div>

    </div>

  );

};
