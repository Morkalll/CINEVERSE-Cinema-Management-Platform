
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { NavBar } from "../NavBar/NavBar";
import { API_URL } from "../../services/api";
import "./CreateMovieForm.css"; 


export const CreateMovieShowingForm = () => 
{
    const [form, setForm] = useState(
    {
        movieId: "",
        screenId: "",
        date: "",
        showtime: "",
        price: "",
    });

    const [error, setError] = useState(
    {
        movieIdError: "",
        screenIdError: "",
        dateError: "",
        showtimeError: "",
        priceError: ""
    });

    const [touched, setTouched] = useState(
    {
        movieId: false,
        screenId: false,
        date: false,
        showtime: false,
        price: false
    });


    const [movies, setMovies] = useState([]);
    const [screen, setScreen] = useState([]);


    useEffect(() => 
    {
        const fetchScreens = async () => 
        {
            try 
            {
                const response = await fetch(`${API_URL}/screens`, 
                {
                    headers: 
                    {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = await response.json();
                setScreen(data);

            } 
            
            catch 
            {
                toast.error("Error al cargar sala");
            }

        };


        const fetchMovies = async () => 
        {
            try 
            {
                const response = await fetch(`${API_URL}/movielistings`, 
                {
                    headers: 
                    {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = await response.json();
                setMovies(data);

            } 
            
            catch 
            {
                toast.error("Error al cargar películas");
            }

        };

        fetchMovies();
        fetchScreens();

    }, []);


    const handleMovieIdChange = (e) => 
    {
        const value = e.target.value;

        setForm({ ...form, movieId: value });

        if (touched.movieId) 
        {
            setError({ ...error, movieIdError: value === "" ? "Debe seleccionar una película" : "" });
        }

    };


    const handleScreenIdChange = (e) => 
    {
        const value = e.target.value;

        setForm({ ...form, screenId: value });

        if (touched.screenId) 
        {
            setError({ ...error, screenIdError: value === "" ? "Debe seleccionar una sala" : "" });
        }

    };

    const validateDateTimeFields = (dateVal, timeVal, isDateTouched, isTimeTouched) => {
        const today = new Date().toISOString().split('T')[0];
        let dateErr = "";
        let timeErr = "";

        if (dateVal === "") {
            dateErr = "La fecha es requerida";
        } else if (dateVal < today) {
            dateErr = "La fecha no puede ser anterior a hoy";
        }

        if (timeVal === "") {
            timeErr = "La hora es requerida";
        } else if (!dateErr) {
            const now = new Date();
            const inputDateTime = new Date(`${dateVal}T${timeVal}`);
            if (inputDateTime < now) {
                timeErr = "La hora no puede estar en el pasado";
            }
        }

        setError(prev => ({
            ...prev,
            dateError: isDateTouched ? dateErr : prev.dateError,
            showtimeError: isTimeTouched ? timeErr : prev.showtimeError
        }));

        return { dateErr, timeErr };
    };

    const handleDateChange = (e) => 
    {
        const value = e.target.value;
        setForm({ ...form, date: value });
        if (touched.date) 
        {
            validateDateTimeFields(value, form.showtime, true, touched.showtime);
        }
    };

    const handleShowtimeChange = (e) => 
    {
        const value = e.target.value;
        setForm({ ...form, showtime: value });
        if (touched.showtime) 
        {
            validateDateTimeFields(form.date, value, touched.date, true);
        }
    };

    const handlePriceChange = (e) => 
    {
        const value = e.target.value;

        setForm({ ...form, price: value });

        if (touched.price) 
        {
            const numValue = parseFloat(value);
            setError({ ...error, priceError: value === "" ? "El precio es requerido" : (numValue <= 0 ? "El precio debe ser mayor a 0" : "") });
        }

    };

    const handleSubmit = async (e) => 
    {
        e.preventDefault();

        setTouched(
        {
            movieId: true,
            screenId: true,
            date: true,
            showtime: true,
            price: true
        });

        const movieIdError = form.movieId === "" ? "Debe seleccionar una película" : "";
        const screenIdError = form.screenId === "" ? "Debe seleccionar una sala" : "";
        
        const { dateErr, timeErr } = validateDateTimeFields(form.date, form.showtime, true, true);
        const dateError = dateErr;
        const showtimeError = timeErr;
        
        const numPrice = parseFloat(form.price);
        const priceError = form.price === "" ? "El precio es requerido" : (numPrice <= 0 ? "El precio debe ser mayor a 0" : "");

        setError({ movieIdError, screenIdError, dateError, showtimeError, priceError });


        if (!movieIdError && !screenIdError && !dateError && !showtimeError && !priceError) 
        {
            const datetime = new Date(`${form.date}T${form.showtime}`).toISOString();

            try 
            {
                const response = await fetch(`${API_URL}/movieshowings`, 
                {
                    method: "POST",

                    headers: 
                    {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },

                    body: JSON.stringify(
                    {
                        ...form,
                        showtime: datetime,
                    }),
                });

                if (!response.ok) 
                {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || "Error al crear la función");
                }


                toast.success("Función creada con éxito!");

                setForm(
                {
                    movieId: "",
                    date: "",
                    showtime: "",
                    screenId: "",
                    price: "",
                });

                setTouched(
                {
                    movieId: false,
                    screenId: false,
                    date: false,
                    showtime: false,
                    price: false
                });

            } 
            
            catch (error) 
            {
                toast.error(error.message || "Error al crear la función");
            }

        }

    };


    return (

        <div>
            <NavBar />

            <form onSubmit={handleSubmit} className="movie-form" noValidate>
                
                <div className="form-group">

                    <label>Película:</label>

                    <select
                        name="movieId"
                        value={form.movieId}
                        onChange={handleMovieIdChange}
                        onBlur={() => 
                        {
                            setTouched({ ...touched, movieId: true });
                            setError({ ...error, movieIdError: form.movieId === "" ? "Debe seleccionar una película" : "" });
                        }}>
                            
                        <option value="">Seleccionar película</option>

                        {movies.map((movie) => (

                            <option key={movie.id} value={movie.id}>

                                {movie.title}

                            </option>
                        ))}

                    </select>

                    {touched.movieId && error.movieIdError && (
                        <div className="text-danger">{error.movieIdError}</div>
                    )}

                </div>


                <div className="form-group">

                    <label>Fecha:</label>
                    
                    <input
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleDateChange}
                        onBlur={() => 
                        {
                            setTouched({ ...touched, date: true });
                            validateDateTimeFields(form.date, form.showtime, true, touched.showtime);
                        }}
                    />

                    {touched.date && error.dateError && (
                        <div className="text-danger">{error.dateError}</div>
                    )}

                </div>


                <div className="form-group">

                    <label>Hora:</label>

                    <input
                        name="showtime"
                        type="time"
                        value={form.showtime}
                        onChange={handleShowtimeChange}
                        onBlur={() => 
                        {
                            setTouched({ ...touched, showtime: true });
                            validateDateTimeFields(form.date, form.showtime, touched.date, true);
                        }}
                    />

                    {touched.showtime && error.showtimeError && (
                        <div className="text-danger">{error.showtimeError}</div>
                    )}

                </div>


                <div className="form-group">

                    <label>Sala:</label>

                    <select
                        name="screenId"
                        value={form.screenId}
                        onChange={handleScreenIdChange}
                        onBlur={() => 
                        {
                            setTouched({ ...touched, screenId: true });
                            setError({ ...error, screenIdError: form.screenId === "" ? "Debe seleccionar una sala" : "" });
                        }}>

                        <option value="">Seleccionar sala</option>

                        {screen.map((s) => (

                            <option key={s.id} value={s.id}>

                                {s.id}

                            </option>
                        ))}

                    </select>

                    {touched.screenId && error.screenIdError && (
                        <div className="text-danger">{error.screenIdError}</div>
                    )}

                </div>


                <div className="form-group">

                    <label>Precio ($):</label>

                    <input
                        name="price"
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={handlePriceChange}
                        onBlur={() => 
                        {
                            setTouched({ ...touched, price: true });
                            const numValue = parseFloat(form.price);
                            setError({ ...error, priceError: form.price === "" ? "El precio es requerido" : (numValue <= 0 ? "El precio debe ser mayor a 0" : "") });
                        }}
                    />

                    {touched.price && error.priceError && (
                        <div className="text-danger">{error.priceError}</div>
                    )}

                </div>


                <button type="submit">Agregar Función</button>


            </form>

        </div>

    );
    
};