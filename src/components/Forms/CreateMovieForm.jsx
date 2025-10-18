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
      <h2>Agregar Película</h2>
      <form onSubmit={handleSubmit} classname ="movie-form">
        <label>Título:</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label>Género:</label>
        <input name="genre" value={form.genre} onChange={handleChange} required />

        <label>Director:</label>
        <input name="director" value={form.director} onChange={handleChange} required />

        <label>Rating:</label>
        <input name="rating" type="number" value={form.rating} onChange={handleChange} />

        <label>Duración (min):</label>
        <input name="duration" type="number" value={form.duration} onChange={handleChange} />

        <label>Sinopsis:</label>
        <textarea name="synopsis" value={form.synopsis} onChange={handleChange}></textarea>

        <label>Poster (URL):</label>
        <input name="poster" value={form.poster} onChange={handleChange} />

        <label>Poster Carousel (URL):</label>
        <input name="posterCarousel" value={form.posterCarousel} onChange={handleChange} />

        <label>Fecha de estreno:</label>
        <input name="releaseDate" type="date" value={form.releaseDate} onChange={handleChange} />

        <button type="submit">Agregar Película</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};
