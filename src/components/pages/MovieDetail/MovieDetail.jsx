import { useParams } from "react-router-dom";


export function MovieDetail(){
    const { id } = useParams();
    const movie = movie.find((m) => m.id.toString() === id);

    if (!movie) return <h2>Pelicula no encontrada :/</h2>;

    return(
        <div>
            <h1>{movie.title}</h1>
            <p>Género: {movie.genre}</p>
            <p>Duración: {movie.duration}</p>
            <p>Calificación: {movie.rating}</p>
            <p>{movie.synopsis}</p>
            <img src = {movie.poster} alt = {movie.title} width = "100px" />
        </div>
    );
}