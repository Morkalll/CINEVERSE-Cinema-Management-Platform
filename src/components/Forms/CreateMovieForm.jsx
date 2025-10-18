import { useState } from "react";
import './CreateMovieForm.css'

export const CreateMoviesForm = () => {
  const [form, setForm] = useState({
    title: "",
    genre: "",
    director: "",
    rating: "",
    duration: "",
    synopsis: "",
    poster: "",
    posterCarousel: "",
    releaseDate: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/movielistings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Error al crear la película");

      setMessage(" Película creada con éxito");
      setForm({
        title: "",
        genre: "",
        director: "",
        rating: "",
        duration: "",
        synopsis: "",
        poster: "",
        posterCarousel: "",
        releaseDate: "",
      });
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
  <div>
    <h2>Agregar Pelicula</h2>
  <form onSubmit={handleSubmit} className="movie-form">
    <div className="form-group">
      <label>Título:</label>
      <input name="title" value={form.title} onChange={handleChange} required />
    </div>

    <div className="form-group">
      <label>Género:</label>
      <input name="genre" value={form.genre} onChange={handleChange} required />
    </div>

    <div className="form-group">
      <label>Director:</label>
      <input name="director" value={form.director} onChange={handleChange} required />
    </div>

    <div className="form-group">
      <label>Rating:</label>
      <input name="rating" type="number" value={form.rating} onChange={handleChange} />
    </div>

    <div className="form-group">
      <label>Duración (min):</label>
      <input name="duration" type="number" value={form.duration} onChange={handleChange} />
    </div>

    <div className="form-group">
      <label>Sinopsis:</label>
      <textarea name="synopsis" value={form.synopsis} onChange={handleChange}></textarea>
    </div>

    <div className="form-group">
      <label>Poster (URL):</label>
      <input name="poster" value={form.poster} onChange={handleChange} />
    </div>

    <div className="form-group">
      <label>Poster Carousel (URL):</label>
      <input name="posterCarousel" value={form.posterCarousel} onChange={handleChange} />
    </div>

    <div className="form-group">
      <label>Fecha de estreno:</label>
      <input name="releaseDate" type="date" value={form.releaseDate} onChange={handleChange} />
    </div>

  <button type="submit">Agregar Película</button>
</form>
</div>

  );
};
