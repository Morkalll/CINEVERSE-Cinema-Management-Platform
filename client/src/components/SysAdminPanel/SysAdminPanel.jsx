
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "../../components/NavBar/NavBar";
import { successToast, errorToast } from "../../utils/toast";
import { apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./SysAdminPanel.css";

export const SysAdminPanel = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("users");
    
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [movies, setMovies] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [showings, setShowings] = useState([]);
    const [candy, setCandy] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, item: null, type: "" });

    useEffect(() => {
        if (!user) {
            errorToast("Debes iniciar sesión");
            navigate("/login");
            return;
        }

        if (user.role !== "sysadmin") {
            errorToast("No tienes permisos para acceder a esta página");
            navigate("/home");
            return;
        }

        fetchAllData();
    }, [user, navigate]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [usersData, adminsData, moviesData, roomsData, showingsData, candyData] = await Promise.all([
                apiRequest("/users", "GET"),
                apiRequest("/admins", "GET"),
                apiRequest("/movielistings", "GET"),
                apiRequest("/screens", "GET"),
                apiRequest("/movieshowings", "GET"),
                apiRequest("/candy", "GET")
            ]);

            setUsers(usersData);
            setAdmins(adminsData);
            setMovies(moviesData);
            setRooms(roomsData);
            setShowings(showingsData);
            setCandy(candyData);
            successToast("Datos cargados correctamente");
        } catch (err) {
            errorToast(err.message || "Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (item, type) => {
        setDeleteConfirm({ show: true, item, type });
    };

    const handleConfirmDelete = async () => {
        const { item, type } = deleteConfirm;
        
        try {
            const endpoints = {
                user: "/users",
                admin: "/users",
                movie: "/movielistings",
                screen: "/screens",
                showing: "/movieshowings",
                candy: "/candy"
            };

            await apiRequest(`${endpoints[type]}/${item.id}`, "DELETE");
            
            if (type === "user") setUsers(users.filter((u) => u.id !== item.id));
            else if (type === "admin") setAdmins(admins.filter((a) => a.id !== item.id));
            else if (type === "movie") setMovies(movies.filter((m) => m.id !== item.id));
            else if (type === "room") setRooms(rooms.filter((r) => r.id !== item.id));
            else if (type === "showing") setShowings(showings.filter((s) => s.id !== item.id));
            else if (type === "candy") setCandy(candy.filter((c) => c.id !== item.id));

            successToast(`${getItemTypeName(type)} eliminado correctamente`);
            setDeleteConfirm({ show: false, item: null, type: "" });
        } catch (err) {
            errorToast(err.message || "Error al eliminar");
        }
    };

    const getItemTypeName = (type) => {
        const names = {
            user: "Usuario",
            admin: "Administrador",
            movie: "Película",
            room: "Sala",
            showing: "Función",
            candy: "Candy"
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
                    <button 
                        className={`tab-btn ${activeTab === "candy" ? "active" : ""}`}
                        onClick={() => setActiveTab("candy")}
                    >
                        Candy ({candy.length})
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
                            <button 
                                className="add-btn" 
                                onClick={() => navigate("/addmovie")}
                            >
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
                            <p className="info-message">Las salas se gestionan desde la base de datos</p>
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

                {activeTab === "showings" && (
                    <div className="sysadmin-section">
                        <div className="section-header">
                            <h2>Funciones</h2>
                            <button 
                                className="add-btn" 
                                onClick={() => navigate("/addmovieshowing")}
                            >
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
                                                <td>{showing.screenName || showing.screenId}</td>
                                                <td>
                                                    {new Date(showing.showtime).toLocaleString()}
                                                </td>
                                                <td>${showing.ticketPrice || showing.price}</td>
                                                <td>
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

                {activeTab === "candy" && (
                    <div className="sysadmin-section">
                        <div className="section-header">
                            <h2>Candy</h2>
                            <button 
                                className="add-btn" 
                                onClick={() => navigate("/addcandy")}
                            >
                                + Agregar Candy
                            </button>
                        </div>
                        
                        {candy.length === 0 ? (
                            <p className="empty-message">No hay productos de candy registrados</p>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Precio</th>
                                            <th>Stock</th>
                                            <th>Descripción</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {candy.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{item.name}</td>
                                                <td>${item.price}</td>
                                                <td>{item.stock}</td>
                                                <td>{item.description?.substring(0, 50)}...</td>
                                                <td>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteClick(item, "candy")}
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

                {deleteConfirm.show && (
                    <div className="delete-confirm-overlay" onClick={() => setDeleteConfirm({ show: false, item: null, type: "" })}>
                        <div className="delete-confirm-box" onClick={(e) => e.stopPropagation()}>
                            <h3>Confirmar Eliminación</h3>
                            <p>¿Estás seguro que deseas eliminar este {getItemTypeName(deleteConfirm.type).toLowerCase()}?</p>
                            <div className="delete-confirm-buttons">
                                <button 
                                    className="cancel-btn"
                                    onClick={() => setDeleteConfirm({ show: false, item: null, type: "" })}
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
            </div>
        </div>
    );
};