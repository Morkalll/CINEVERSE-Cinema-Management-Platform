import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NavBar } from '../../NavBar/NavBar';
import './MovieDetail.css';
import SeatSelector from "../../SeatSelector/SeatSelector";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { successToast, errorToast } from "../../../utils/toast";


export const MovieDetail = () => 
{
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedShowing, setSelectedShowing] = useState(null); // 🎯 NUEVO ESTADO

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
          console.log("No se pudo traer la película")
        }

        const movieData = await response.json();
        setMovie(movieData);
        
        // 🎯 SELECCIONAR AUTOMÁTICAMENTE LA PRIMERA FUNCIÓN
        if (movieData.movieShowings && movieData.movieShowings.length > 0) {
          setSelectedShowing(movieData.movieShowings[0]);
          console.log("✅ Primera función seleccionada:", movieData.movieShowings[0]);
        }

      } 
      
      catch (error) 
      {
        console.error("Error trayendo la película", error);
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
  const showtimes = movie.movieShowings
  

  const handlePlus = (screen) => 
  {
    const quantityInCart = getItemQuantity(screen.id, "ticket");
    const available = screen.capacity ?? null;
    const price = Number(screen.ticketPrice ?? screen.price ?? 0);


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
    }, 1);


    successToast("Entrada agregada al carrito");

  };


  const handleMinus = (screen) => 
  {
    const quantityInCart = getItemQuantity(screen.id, "ticket");


    if (quantityInCart <= 0) 
    {
      return;
    }


    updateQuantity(screen.id, "ticket", quantityInCart - 1);

    successToast("Cantidad actualizada");

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
            <p><strong>Calificación:</strong> {movie.rating} </p>
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


            {showtimes.length === 0 

              ? (
                <p>No hay funciones disponibles.</p>
              ) 

              : (
                    
                <ul>

                  {showtimes.map((screen) => 
                  {
                    const quantityInCart = getItemQuantity(screen.id, "ticket");
                    const available = screen.capacity ?? null;
                    const price = Number(screen.ticketPrice ?? screen.price ?? 0);
                    const isSelected = selectedShowing?.id === screen.id; // 🎯 VERIFICAR SI ESTÁ SELECCIONADA

                    return (

                      <li 
                        key={screen.id} 
                        onClick={() => setSelectedShowing(screen)} // 🎯 CLICK PARA SELECCIONAR
                        style={{ 
                          marginBottom: "0.6rem", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between", 
                          gap: 12,
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#e3f2fd" : "transparent",
                          padding: "8px",
                          borderRadius: "4px",
                          border: isSelected ? "2px solid #1976d2" : "2px solid transparent"
                        }}>
                      

                        <div style={{ flex: 1 }}>


                          <div style={{ marginBottom: "0.25rem", fontWeight: 600 }}>

                            <strong>{screen.screenName}</strong> — {new Date(screen.showtime).toLocaleString()}
                            {isSelected && <span style={{ marginLeft: 8, color: "#1976d2" }}>✓ Seleccionada</span>}

                          </div>
                          

                          <div style={{ marginBottom: "0.25rem", color: "#666" }}>

                            Precio: ${price} {available !== null && <span style={{ marginLeft: 8 }}>• Disponible: {available}</span>}
                            
                          </div>


                        </div>


                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>


                          <button

                            onClick={(e) => { e.stopPropagation(); handleMinus(screen); }}
                            aria-label={`Restar entrada ${movie.title} ${screen.screenName}`}
                            className="quantity-button"

                          > - </button>


                          <div style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>

                            {quantityInCart}

                          </div>


                          <button

                            onClick={(e) => { e.stopPropagation(); handlePlus(screen); }}
                            aria-label={`Sumar entrada ${movie.title} ${screen.screenName}`}
                            className="quantity-button"

                          > + </button>

                        </div>


                      </li>


                    );

                  })}

                </ul>

              )

            }

          </div>


          <div className="section-seats">
          
            {selectedShowing ? (
              <>
                <h3 style={{ marginBottom: "1rem" }}>
                  SELECCIONAR ASIENTOS - {selectedShowing.screenName}
                </h3>
                <SeatSelector    
                  rows={5}
                  seatsPerRow={8}
                  showingId={selectedShowing.id}
                />
              </>
            ) : (
              <p style={{ color: "#666", fontStyle: "italic" }}>
                Selecciona una función para elegir tus asientos
              </p>
            )}
            
          </div>


        </div>

      </div>

    </div>

  );

};