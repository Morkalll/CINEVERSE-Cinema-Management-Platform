import { useEffect, useState } from "react";
import { NavBar } from "../../components/NavBar/NavBar";
import { successToast, errorToast } from "../../utils/toast";
import { apiRequest } from "../../services/api";
import "./SysAdminPanel.css";

export const SysAdminPanel = () => {
    const [activeTab, setActiveTab] = useState("users");
    
    
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [movies, setMovies] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [showings, setShowings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formType, setFormType] = useState("");
    const [actionType, setActionType] = useState(""); 
    
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [usersData, adminsData, moviesData, roomsData, showingsData] = await Promise.all([
                apiRequest("/users", "GET"),
                apiRequest("/admins", "GET"),
                apiRequest("/movies", "GET"),
                apiRequest("/rooms", "GET"),
                apiRequest("/movie-showings", "GET")
            ]);

            setUsers(usersData);
            setAdmins(adminsData);
            setMovies(moviesData);
            setRooms(roomsData);
            setShowings(showingsData);
            successToast("Datos cargados correctamente");
        } catch (err) {
            errorToast(err.message || "Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (item, type) => {
        setSelectedItem(item);
        setFormType(type);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const endpoints = {
                user: "/users",
                admin: "/admins",
                movie: "/movies",
                room: "/rooms",
                showing: "/movie-showings"
            };

            await apiRequest(`${endpoints[formType]}/${selectedItem.id}`, "DELETE");
            
            if (formType === "user") setUsers(users.filter((u) => u.id !== selectedItem.id));
            else if (formType === "admin") setAdmins(admins.filter((a) => a.id !== selectedItem.id));
            else if (formType === "movie") setMovies(movies.filter((m) => m.id !== selectedItem.id));
            else if (formType === "room") setRooms(rooms.filter((r) => r.id !== selectedItem.id));
            else if (formType === "showing") setShowings(showings.filter((s) => s.id !== selectedItem.id));

            successToast(`${getItemTypeName(formType)} eliminado correctamente`);
            setShowDeleteModal(false);
            setSelectedItem(null);
        } catch (err) {
            errorToast(err.message || "Error al eliminar");
        }
    };

    const handleCreateClick = (type) => {
        setFormType(type);
        setActionType("create");
        setFormData({});
        setShowFormModal(true);
    };

    const handleEditClick = (item, type) => {
        setFormType(type);
        setActionType("edit");
        setSelectedItem(item);
        setFormData(item);
        setShowFormModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const endpoints = {
                movie: "/movies",
                room: "/rooms",
                showing: "/movie-showings"
            };

            if (actionType === "create") {
                const newItem = await apiRequest(endpoints[formType], "POST", formData);
                
                if (formType === "movie") setMovies([...movies, newItem]);
                else if (formType === "room") setRooms([...rooms, newItem]);
                else if (formType === "showing") setShowings([...showings, newItem]);
                
                successToast(`${getItemTypeName(formType)} creado correctamente`);
            } else {
                const updatedItem = await apiRequest(`${endpoints[formType]}/${selectedItem.id}`, "PUT", formData);
                
                if (formType === "movie") {
                    setMovies(movies.map(m => m.id === selectedItem.id ? updatedItem : m));
                } else if (formType === "room") {
                    setRooms(rooms.map(r => r.id === selectedItem.id ? updatedItem : r));
                } else if (formType === "showing") {
                    setShowings(showings.map(s => s.id === selectedItem.id ? updatedItem : s));
                }
                
                successToast(`${getItemTypeName(formType)} actualizado correctamente`);
            }
            
            setShowFormModal(false);
            setFormData({});
        } catch (err) {
            errorToast(err.message || "Error al guardar");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const getItemTypeName = (type) => {
        const names = {
            user: "Usuario",
            admin: "Administrador",
            movie: "Película",
            room: "Sala",
            showing: "Función"
        };
        return names[type] || type;
    };

    if (loading) {
        return (
            <div>
                <NavBar />
                <div className="sysadmin-panel loading-container">
                    <div className="spinner"></div>
                    <h3>Cargando datos...</h3>
                </div>
            </div>
        );
    }

    return (
        <div>
            <NavBar />
            <div className="sysadmin-panel">
                <div className="header-section">
                    <h1>Panel del SysAdmin</h1>
                    <p>Gestión centralizada del sistema de cine</p>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <button 
                        className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => setActiveTab("users")}
                    >
                        Usuarios ({users.length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "admins" ? "active" : ""}`}
                        onClick={() => setActiveTab("admins")}
                    >
                        Admins ({admins.length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "movies" ? "active" : ""}`}
                        onClick={() => setActiveTab("movies")}
                    >
                        Películas ({movies.length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "rooms" ? "active" : ""}`}
                        onClick={() => setActiveTab("rooms")}
                    >
                        Salas ({rooms.length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "showings" ? "active" : ""}`}
                        onClick={() => setActiveTab("showings")}
                    >
                        Funciones ({showings.length})
                    </button>
                </div>

                {activeTab === "users" && (
                    <div className="sysadmin-section">
                        <div className="section-header">
                            <h2>Usuarios Registrados</h2>
                        </div>
                        
                        {users.length === 0 ? (
                            <p className="empty-message">No hay usuarios registrados</p>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Email</th>
                                            <th>Rol</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.name || user.username}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className="badge badge-info">
                                                        {user.role || "Usuario"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteClick(user, "user")}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "admins" && (
                    <div className="sysadmin-section">
                        <div className="section-header">
                            <h2>Administradores</h2>
                        </div>
                        
                        {admins.length === 0 ? (
                            <p className="empty-message">No hay administradores registrados</p>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Email</th>
                                            <th>Rol</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admins.map((admin) => (
                                            <tr key={admin.id}>
                                                <td>{admin.id}</td>
                                                <td>{admin.name || admin.username}</td>
                                                <td>{admin.email}</td>
                                                <td>
                                                    <span className="badge badge-warning">
                                                        {admin.role || "Admin"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteClick(admin, "admin")}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "movies" && (
                    <div className="sysadmin-section">
                        <div className="section-header">
                            <h2>Películas</h2>
                            <button className="add-btn" onClick={() => handleCreateClick("movie")}>
                                + Agregar Película
                            </button>
                        </div>
                        
                        {movies.length === 0 ? (
                            <p className="empty-message">No hay películas registradas</p>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Título</th>
                                            <th>Género</th>
                                            <th>Duración</th>
                                            <th>Rating</th>
                                            <th>Fecha</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {movies.map((movie) => (
                                            <tr key={movie.id}>
                                                <td>{movie.id}</td>
                                                <td>{movie.title}</td>
                                                <td>{movie.genre}</td>
                                                <td>{movie.duration} min</td>
                                                <td>⭐ {movie.rating}</td>
                                                <td>{new Date(movie.releaseDate).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => handleEditClick(movie, "movie")}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteClick(movie, "movie")}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "rooms" && (
                    <div className="sysadmin-section">
                        <div className="section-header">
                            <h2>Salas</h2>
                            <button className="add-btn" onClick={() => handleCreateClick("room")}>
                                + Agregar Sala
                            </button>
                        </div>
                        
                        {rooms.length === 0 ? (
                            <p className="empty-message">No hay salas registradas</p>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Capacidad</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rooms.map((room) => (
                                            <tr key={room.id}>
                                                <td>{room.id}</td>
                                                <td>{room.name}</td>
                                                <td>🪑 {room.capacity} asientos</td>
                                                <td>
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => handleEditClick(room, "room")}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteClick(room, "room")}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Contenido de Funciones */}
                {activeTab === "showings" && (
                    <div className="sysadmin-section">
                        <div className="section-header">
                            <h2>Funciones</h2>
                            <button className="add-btn" onClick={() => handleCreateClick("showing")}>
                                + Agregar Función
                            </button>
                        </div>
                        
                        {showings.length === 0 ? (
                            <p className="empty-message">No hay funciones registradas</p>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Película</th>
                                            <th>Sala</th>
                                            <th>Fecha y Hora</th>
                                            <th>Precio</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {showings.map((showing) => (
                                            <tr key={showing.id}>
                                                <td>{showing.id}</td>
                                                <td>
                                                    {movies.find(m => m.id === showing.movieId)?.title || `ID: ${showing.movieId}`}
                                                </td>
                                                <td>{showing.screenName}</td>
                                                <td>
                                                    {new Date(showing.showtime).toLocaleString()}
                                                </td>
                                                <td>${showing.ticketPrice}</td>
                                                <td>
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => handleEditClick(showing, "showing")}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteClick(showing, "showing")}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {showDeleteModal && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Confirmar Eliminación</h3>
                                <button 
                                    className="modal-close"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="modal-body">
                                {selectedItem && (
                                    <>
                                        <p>
                                            ¿Estás seguro que deseas eliminar este {getItemTypeName(formType).toLowerCase()}?
                                        </p>
                                        <div className="user-info">
                                            {formType === "user" || formType === "admin" ? (
                                                <>
                                                    <strong>Nombre:</strong> {selectedItem.name || selectedItem.username}<br />
                                                    <strong>Email:</strong> {selectedItem.email}<br />
                                                </>
                                            ) : formType === "movie" ? (
                                                <>
                                                    <strong>Título:</strong> {selectedItem.title}<br />
                                                    <strong>Género:</strong> {selectedItem.genre}<br />
                                                </>
                                            ) : formType === "room" ? (
                                                <>
                                                    <strong>Nombre:</strong> {selectedItem.name}<br />
                                                    <strong>Capacidad:</strong> {selectedItem.capacity} asientos<br />
                                                </>
                                            ) : (
                                                <>
                                                    <strong>Película:</strong> {movies.find(m => m.id === selectedItem.movieId)?.title}<br />
                                                    <strong>Sala:</strong> {selectedItem.screenName}<br />
                                                    <strong>Fecha:</strong> {new Date(selectedItem.showtime).toLocaleString()}<br />
                                                </>
                                            )}
                                            <strong>ID:</strong> {selectedItem.id}
                                        </div>
                                        <p className="warning-message">
                                            <strong>⚠️ Esta acción no se puede deshacer</strong>
                                        </p>
                                    </>
                                )}
                            </div>
                            
                            <div className="modal-footer">
                                <button 
                                    className="cancel-btn"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    className="delete-btn"
                                    onClick={handleConfirmDelete}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showFormModal && (
                    <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
                        <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>
                                    {actionType === "create" ? "Crear" : "Editar"} {getItemTypeName(formType)}
                                </h3>
                                <button 
                                    className="modal-close"
                                    onClick={() => setShowFormModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="modal-body">
                                <form onSubmit={handleFormSubmit}>
                                    {formType === "movie" && (
                                        <>
                                            <div className="form-group">
                                                <label>Título *</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={formData.title || ""}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Género *</label>
                                                <input
                                                    type="text"
                                                    name="genre"
                                                    value={formData.genre || ""}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Duración (min) *</label>
                                                    <input
                                                        type="number"
                                                        name="duration"
                                                        value={formData.duration || ""}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Rating *</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        name="rating"
                                                        value={formData.rating || ""}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Fecha de estreno *</label>
                                                <input
                                                    type="date"
                                                    name="releaseDate"
                                                    value={formData.releaseDate ? formData.releaseDate.split('T')[0] : ""}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Director *</label>
                                                <input
                                                    type="text"
                                                    name="director"
                                                    value={formData.director || ""}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Poster URL *</label>
                                                <input
                                                    type="url"
                                                    name="poster"
                                                    value={formData.poster || ""}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Poster Carousel URL</label>
                                                <input
                                                    type="url"
                                                    name="posterCarousel"
                                                    value={formData.posterCarousel || ""}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Sinopsis *</label>
                                                <textarea
                                                    name="synopsis"
                                                    value={formData.synopsis || ""}
                                                    onChange={handleInputChange}
                                                    rows="4"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    {formType === "room" && (
                                        <>
                                            <div className="form-group">
                                                <label>Nombre de la sala *</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name || ""}
                                                    onChange={handleInputChange}
                                                    placeholder="Ej: Sala 1"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Capacidad (asientos) *</label>
                                                <input
                                                    type="number"
                                                    name="capacity"
                                                    value={formData.capacity || ""}
                                                    onChange={handleInputChange}
                                                    min="1"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    {formType === "showing" && (
                                        <>
                                            <div className="form-group">
                                                <label>Película *</label>
                                                <select
                                                    name="movieId"
                                                    value={formData.movieId || ""}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Seleccionar película</option>
                                                    {movies.map(movie => (
                                                        <option key={movie.id} value={movie.id}>
                                                            {movie.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Sala *</label>
                                                <select
                                                    name="screenId"
                                                    value={formData.screenId || ""}
                                                    onChange={(e) => {
                                                        const selectedRoom = rooms.find(r => r.id === parseInt(e.target.value));
                                                        setFormData({
                                                            ...formData,
                                                            screenId: parseInt(e.target.value),
                                                            screenName: selectedRoom?.name || ""
                                                        });
                                                    }}
                                                    required
                                                >
                                                    <option value="">Seleccionar sala</option>
                                                    {rooms.map(room => (
                                                        <option key={room.id} value={room.id}>
                                                            {room.name} ({room.capacity} asientos)
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Fecha y Hora *</label>
                                                <input
                                                    type="datetime-local"
                                                    name="showtime"
                                                    value={formData.showtime ? formData.showtime.slice(0, 16) : ""}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Precio del ticket *</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="ticketPrice"
                                                    value={formData.ticketPrice || ""}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="modal-footer">
                                        <button 
                                            type="button"
                                            className="cancel-btn"
                                            onClick={() => setShowFormModal(false)}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit"
                                            className="save-btn"
                                        >
                                            {actionType === "create" ? "Crear" : "Guardar"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};