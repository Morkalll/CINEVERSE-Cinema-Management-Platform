
import { useState } from "react";
import { toast } from "react-toastify";
import './CreateMovieForm.css'


export const CreateMoviesForm = () => 
{
  const [form, setForm] = useState(
  {
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

  const [error, setError] = useState(
  {
    titleError: "",
    genreError: "",
    directorError: "",
    ratingError: "",
    durationError: "",
    synopsisError: "",
    releaseDateError: ""
  });

  const [touched, setTouched] = useState(
  {
    title: false,
    genre: false,
    director: false,
    rating: false,
    duration: false,
    synopsis: false,
    releaseDate: false
  });

  const handleTitleChange = (e) => 
  {
    const value = e.target.value;

    setForm({ ...form, title: value });

    if (touched.title) 
    {
      setError({ ...error, titleError: value.trim() === "" ? "El título es requerido" : "" });
    }

  };

  const handleGenreChange = (e) => 
  {
    const value = e.target.value;

    setForm({ ...form, genre: value });

    if (touched.genre) 
    {
      setError({ ...error, genreError: value.trim() === "" ? "El género es requerido" : "" });
    }

  };

  const handleDirectorChange = (e) => 
  {
    const value = e.target.value;

    setForm({ ...form, director: value });

    if (touched.director) 
    {
      setError({ ...error, directorError: value.trim() === "" ? "El director es requerido" : "" });
    }

  };

  const handleRatingChange = (e) => 
  {
    const value = e.target.value;

    setForm({ ...form, rating: value });

    if (touched.rating) 
    {
      const numValue = parseFloat(value);
      setError({ ...error, ratingError: value === "" ? "El rating es requerido" : (numValue < 0 || numValue > 10 ? "El rating debe estar entre 0 y 10" : "") });
    }
  };

  const handleDurationChange = (e) => 
  {
    const value = e.target.value;

    setForm({ ...form, duration: value });

    if (touched.duration) 
    {
      const numValue = parseFloat(value);
      setError({ ...error, durationError: value === "" ? "La duración es requerida" : (numValue <= 0 ? "La duración debe ser mayor a 0" : "") });
    }
  };

  const handleSynopsisChange = (e) => 
  {
    const value = e.target.value;

    setForm({ ...form, synopsis: value });

    if (touched.synopsis) 
    {
      setError({ ...error, synopsisError: value.trim() === "" ? "La sinopsis es requerida" : "" });
    }
  };

  const handlePosterChange = (e) => 
  {
    setForm({ ...form, poster: e.target.value });
  };

  const handlePosterCarouselChange = (e) => 
  {
    setForm({ ...form, posterCarousel: e.target.value });
  };

  const handleReleaseDateChange = (e) => 
  {
    const value = e.target.value;

    setForm({ ...form, releaseDate: value });

    if (touched.releaseDate) 
    {
      setError({ ...error, releaseDateError: value === "" ? "La fecha de estreno es requerida" : "" });
    }
  };

  const handleSubmit = async (e) => 
  {
    e.preventDefault();

    setTouched({
      title: true,
      genre: true,
      director: true,
      rating: true,
      duration: true,
      synopsis: true,
      releaseDate: true
    });


    const titleError = form.title.trim() === "" ? "El título es requerido" : "";
    const genreError = form.genre.trim() === "" ? "El género es requerido" : "";
    const directorError = form.director.trim() === "" ? "El director es requerido" : "";
    const numRating = parseFloat(form.rating);
    const ratingError = form.rating === "" ? "El rating es requerido" : (numRating < 0 || numRating > 10 ? "El rating debe estar entre 0 y 10" : "");
    const numDuration = parseFloat(form.duration);
    const durationError = form.duration === "" ? "La duración es requerida" : (numDuration <= 0 ? "La duración debe ser mayor a 0" : "");
    const synopsisError = form.synopsis.trim() === "" ? "La sinopsis es requerida" : "";
    const releaseDateError = form.releaseDate === "" ? "La fecha de estreno es requerida" : "";

    setError({ titleError, genreError, directorError, ratingError, durationError, synopsisError, releaseDateError });


    if (!titleError && !genreError && !directorError && !ratingError && !durationError && !synopsisError && !releaseDateError) 
    {
      try 
      {
        const response = await fetch("http://localhost:3000/api/movielistings", 
        {
          method: "POST",
          headers: 
          {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },

          body: JSON.stringify(form),
        });


        if (!response.ok) throw new Error("Error al crear la película");


        toast.success("Película creada con éxito!");
        setForm(
        {
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

        setTouched(
        {
          title: false,
          genre: false,
          director: false,
          rating: false,
          duration: false,
          synopsis: false,
          releaseDate: false
        });

      } 
      
      catch (error) 
      {
        toast.error("Error al crear la película");
      }

    }

  };

  return (

    <div>

      <h2>Agregar Película</h2>

      <form onSubmit={handleSubmit} className="movie-form" noValidate>

        <div className="form-group">

          <label>Título:</label>

          <input 
            name="title" 
            value={form.title} 
            onChange={handleTitleChange}
            onBlur={() => 
            {
              setTouched({ ...touched, title: true });
              setError({ ...error, titleError: form.title.trim() === "" ? "El título es requerido" : "" });
            }}
          />

          {touched.title && error.titleError && (
            <div className="text-danger">{error.titleError}</div>
          )}

        </div>


        <div className="form-group">

          <label>Género:</label>
          
          <input 
            name="genre" 
            value={form.genre} 
            onChange={handleGenreChange}
            onBlur={() => 
            {
              setTouched({ ...touched, genre: true });
              setError({ ...error, genreError: form.genre.trim() === "" ? "El género es requerido" : "" });
            }}
          />

          {touched.genre && error.genreError && (
            <div className="text-danger">{error.genreError}</div>
          )}

        </div>


        <div className="form-group">

          <label>Director:</label>

          <input 
            name="director" 
            value={form.director} 
            onChange={handleDirectorChange}
            onBlur={() => 
            {
              setTouched({ ...touched, director: true });
              setError({ ...error, directorError: form.director.trim() === "" ? "El director es requerido" : "" });
            }}
          />

          {touched.director && error.directorError && (
            <div className="text-danger">{error.directorError}</div>
          )}

        </div>


        <div className="form-group">

          <label>Rating (0-10):</label>

          <input 
            name="rating" 
            type="number" 
            step="0.1"
            value={form.rating} 
            onChange={handleRatingChange}
            onBlur={() => 
            {
              setTouched({ ...touched, rating: true });
              const numValue = parseFloat(form.rating);
              setError({ ...error, ratingError: form.rating === "" ? "El rating es requerido" : (numValue < 0 || numValue > 10 ? "El rating debe estar entre 0 y 10" : "") });
            }}
          />

          {touched.rating && error.ratingError && (
            <div className="text-danger">{error.ratingError}</div>
          )}

        </div>


        <div className="form-group">

          <label>Duración (min):</label>

          <input 
            name="duration" 
            type="number" 
            value={form.duration} 
            onChange={handleDurationChange}
            onBlur={() => 
            {
              setTouched({ ...touched, duration: true });
              const numValue = parseFloat(form.duration);
              setError({ ...error, durationError: form.duration === "" ? "La duración es requerida" : (numValue <= 0 ? "La duración debe ser mayor a 0" : "") });
            }}
          />

          {touched.duration && error.durationError && (
            <div className="text-danger">{error.durationError}</div>
          )}

        </div>


        <div className="form-group">

          <label>Sinopsis:</label>

          <textarea 
            name="synopsis" 
            value={form.synopsis} 
            onChange={handleSynopsisChange}
            onBlur={() => {
              setTouched({ ...touched, synopsis: true });
              setError({ ...error, synopsisError: form.synopsis.trim() === "" ? "La sinopsis es requerida" : "" });
            }}>
          </textarea>

          {touched.synopsis && error.synopsisError && (
            <div className="text-danger">{error.synopsisError}</div>
          )}

        </div>


        <div className="form-group">

          <label>Poster (URL) - Opcional:</label>

          <input 
            name="poster" 
            value={form.poster} 
            onChange={handlePosterChange}
          />

        </div>


        <div className="form-group">

          <label>Poster Carousel (URL) - Opcional:</label>

          <input 
            name="posterCarousel" 
            value={form.posterCarousel} 
            onChange={handlePosterCarouselChange}
          />

        </div>


        <div className="form-group">

          <label>Fecha de estreno:</label>

          <input 
            name="releaseDate" 
            type="date" 
            value={form.releaseDate} 
            onChange={handleReleaseDateChange}
            onBlur={() => 
            {
              setTouched({ ...touched, releaseDate: true });
              setError({ ...error, releaseDateError: form.releaseDate === "" ? "La fecha de estreno es requerida" : "" });
            }}
          />

          {touched.releaseDate && error.releaseDateError && (
            <div className="text-danger">{error.releaseDateError}</div>
          )}

        </div>


        <button type="submit">Agregar Película</button>


      </form>

    </div>

  );
  
};

