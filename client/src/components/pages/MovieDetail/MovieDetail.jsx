
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NavBar } from '../../NavBar/NavBar';
import './MovieDetail.css';
import  SeatSelector  from "../../SeatSelector/SeatSelector";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { successToast, errorToast } from "../../../utils/toast";


export const MovieDetail = () => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const { user } = useAuth();


  useEffect(() => {
    const fetchMovie = async (movieId) => {
      try {
        const response = await fetch('http://localhost:3000/api/movielistings/' + movieId);
        if (!response.ok) {
          console.log(response)
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setMovie(await response.json());
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMovie(id);
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!movie) return <div>No se encontró la película</div>;

  const releaseFullYear = new Date(movie.releaseDate).getFullYear();
  const releaseMonth = new Date(movie.releaseDate).getMonth() + 1;
  const releaseDay = new Date(movie.releaseDate).getDate();

  const showtimes = movie.showtimes
    || movie.movieShowings
    || movie.MovieShowings
    || movie.showings
    || movie.MovieShowing
    || movie.showingsList
    || [];

  const handleAddTicket = (showtime) => {
    if (!user) {
      // UX: podés reemplazar alert por un toast o redirección al login
      alert("Debes iniciar sesión para comprar entradas.");
      return;
    }

    const item = {
      refId: showtime.id, // MovieShowing id
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
          {/* ------------------ SHOWTIMES (con + / - y cantidad en tiempo real) ------------------ */}
          <div className="section-showtimes">
            <h3>HORARIOS</h3>

            {showtimes.length === 0 ? (
              <p>No hay funciones disponibles.</p>
            ) : (
              <ul>
                {showtimes.map((s) => {
                  const qtyInCart = getItemQuantity(s.id, "ticket"); // cantidad actual en el carrito
                  const available = s.capacity ?? null; // si tenés capacidad en el showtime, opcional
                  const price = Number(s.ticketPrice ?? s.price ?? 0);

                  const handlePlus = () => {
                    if (!user) {
                      errorToast("Debes iniciar sesión para comprar entradas.");
                      return;
                    }
                    // Si hay límite por capacidad, controlamos
                    if (available !== null && qtyInCart >= available) {
                      errorToast("No hay más entradas disponibles para esta función.");
                      return;
                    }
                    // Añadimos 1 (addToCart suma si ya existe)
                    addToCart(
                      {
                        refId: s.id,
                        type: "ticket",
                        name: `${movie.title} — ${s.screenName} (${new Date(s.showtime).toLocaleString()})`,
                        price,
                      },
                      1
                    );
                    successToast("Entrada agregada al carrito");
                  };

                  const handleMinus = () => {
                    if (qtyInCart <= 0) return; // nada que hacer
                    // Reducimos 1 (updateQuantity con qty-1 hará remove si llega a 0)
                    updateQuantity(s.id, "ticket", qtyInCart - 1);
                    successToast("Cantidad actualizada");
                  };

                  return (
                    <li key={s.id} style={{ marginBottom: "0.6rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: "0.25rem", fontWeight: 600 }}>
                          <strong>{s.screenName}</strong> — {new Date(s.showtime).toLocaleString()}
                        </div>
                        <div style={{ marginBottom: "0.25rem", color: "#666" }}>
                          Precio: ${price} {available !== null && <span style={{ marginLeft: 8 }}>• Disponible: {available}</span>}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={handleMinus}
                          aria-label={`Restar entrada ${movie.title} ${s.screenName}`}
                          className="qty-button"
                        >
                          -
                        </button>

                        <div style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>
                          {qtyInCart}
                        </div>

                        <button
                          onClick={handlePlus}
                          aria-label={`Sumar entrada ${movie.title} ${s.screenName}`}
                          className="qty-button"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* <div className="section-format">
            <h3>FORMATOS</h3>
            <div>Seleccioná el formato en la lista de horarios (si aplica)</div>
          </div>
          

          <button
            className="buy-button"
            onClick={() => {
              if (showtimes.length > 0) handleAddTicket(showtimes[0]);
              else alert("Selecciona una función antes de comprar.");
            }}
          >
            COMPRAR ENTRADA
          </button> 
          */}

    <div className="section-seats">
      <h3 style={{ marginTop: "2rem" }}>SELECCIÓN DE ASIENTOS</h3>

      <SeatSelector
        onConfirm={(seats) => {
          if (!user) {
            errorToast("Debes iniciar sesión para continuar.");
            return;
      }
        if (seats.length === 0) {
          errorToast("Debes seleccionar al menos un asiento.");
          return;
      }
      successToast(`Seleccionaste ${seats.length} asientos: ${seats.join(", ")}`);
      // En el futuro:
      // - Enviar los asientos al backend
      // - Asociarlos con el showtime y usuario
      // - Avanzar al paso de pago
    }}
  />
</div>

        </div>
      </div>
    </div>
  );
};
