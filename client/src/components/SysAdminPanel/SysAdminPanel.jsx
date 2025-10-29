import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "../../components/NavBar/NavBar";
import { successToast, errorToast } from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/helper";
import "./SysAdminPanel.css";


export const SysAdminPanel = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("users");
    const navigate = useNavigate();
    
    const [users, setUsers] = useState([]);
    const [movies, setMovies] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [showings, setShowings] = useState([]);
    const [candy, setCandy] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, item: null, type: "" });
    const [showCreateScreen, setShowCreateScreen] = useState(false);
    const [showCreateScreenConfirm, setShowCreateScreenConfirm] = useState(false);

    // Edit modal states
    const [editModal, setEditModal] = useState({ show: false, item: null, type: "" });
    const [editForm, setEditForm] = useState({});
    

    const handleGoToRegisterAdmin = () => 
    {
        if (!checkSysAdminAuth()) return;
        navigate("/register-admin");
    };

    const handleGoToRegisterSysAdmin = () => 
    {
        if (!checkSysAdminAuth()) return;
        navigate("/register-sysadmin");
    };


    useEffect(() => {
        if (!user) {
            errorToast("Debes iniciar sesión");
            navigate("/login");
            return;
        }

        if (user.role !== "sysadmin" && user.role !== "admin") {
            errorToast("No tienes permisos para acceder a esta página");
            navigate("/home");
            return;
        }

        fetchAllData();
    }, [user, navigate]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };

            const requests = [];
            
            requests.push(
                fetch("http://localhost:3000/api/users", { headers })
                    .then(res => res.ok ? res.json() : [])
                    .catch(() => [])
            );
            
            requests.push(
                fetch("http://localhost:3000/api/movielistings", { headers })
                    .then(res => res.ok ? res.json() : [])
                    .catch(() => [])
            );
            
            requests.push(
                fetch("http://localhost:3000/api/screens", { headers })
                    .then(res => res.ok ? res.json() : [])
                    .catch(() => [])
            );
            
            requests.push(
                fetch("http://localhost:3000/api/movieshowings", { headers })
                    .then(res => res.ok ? res.json() : [])
                    .catch(() => [])
            );
            
            requests.push(
                fetch("http://localhost:3000/api/candy", { headers })
                    .then(res => res.ok ? res.json() : [])
                    .catch(() => [])
            );
            
            requests.push(
                fetch("http://localhost:3000/api/orders/all", { headers })
                    .then(res => res.ok ? res.json() : [])
                    .catch(() => [])
            );

            const [usersData, moviesData, roomsData, showingsData, candyData, ordersData] = await Promise.all(requests);

            setUsers(usersData || []);
            setMovies(moviesData || []);
            setRooms(roomsData || []);
            setShowings(showingsData || []);
            setCandy(candyData || []);
            setOrders(ordersData || []);
        } catch (err) {
            console.error("Error fetching data:", err);
            errorToast("Error al cargar algunos datos");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (item, type) => 
    {
      setDeleteConfirm({ show: true, item, type });
    };

    const handleCancelClick = (order) => {
        setCancelConfirm({ show: true, order });
    };


    const handleConfirmCancel = async () => {
        const order = cancelConfirm.order;
        
        try {
            const token = localStorage.getItem("token");
            
            const response = await fetch(`http://localhost:3000/api/orders/${order.id}/cancel`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Error al cancelar orden");
            }
            
            setOrders(orders.map(o => o.id === order.id ? { ...o, status: "cancelled" } : o));
            
            successToast("Orden cancelada exitosamente");
            setCancelConfirm({ show: false, order: null });
        } catch (err) {
            console.error("Error cancelling order:");
            errorToast(err.message || "Error al cancelar orden");
        }
    };

    const handleConfirmDelete = async () => {
        const { item, type } = deleteConfirm;

        if (type === "order" && item.status !== "cancelled") {
            errorToast("Solo se pueden eliminar órdenes canceladas");
            setDeleteConfirm({ show: false, item: null, type: "" });
        return;
    }
        
        try {
            const token = localStorage.getItem("token");
            const endpoints = {
                user: "/api/users",
                movie: "/api/movielistings",
                room: "/api/screens",
                showing: "/api/movieshowings",
                candy: "/api/candy",
                order: "/api/orders"
            };

            const url = `http://localhost:3000${endpoints[type]}/${item.id}`;

            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const responseText = await response.text();
            let responseData;

            try {
                responseData = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error(`Server returned invalid response: ${responseText}`);
            }
            

            if (!response.ok && response.status === 403) {
                if (user.role === "admin") {
                    throw new Error("Solo el SysAdmin puede eliminar usuarios");
                }

            }
            
            if (!response.ok) {
                throw new Error(responseData.message || `Error ${response.status}`);
            }

            
            if (type === "user") {
                setUsers(users.filter((u) => u.id !== item.id));
            } else if (type === "movie") {
                setMovies(movies.filter((m) => m.id !== item.id));
                setShowings(showings.filter((s) => s.movieId !== item.id));
            } else if (type === "room") {
                setRooms(rooms.filter((r) => r.id !== item.id));
                setShowings(showings.filter((s) => s.screenId !== item.id));
            } else if (type === "showing") {
                setShowings(showings.filter((s) => s.id !== item.id));
            } else if (type === "candy") {
                setCandy(candy.filter((c) => c.id !== item.id));
            } else if (type === "order") {
                setOrders(orders.filter((o) => o.id !== item.id));
            }

            successToast(`${getItemTypeName(type)} eliminado correctamente`);
            setDeleteConfirm({ show: false, item: null, type: "" });
        } catch (err) {
            console.error("DELETE ERROR:", err);
            errorToast(err.message || "Error al eliminar");
        }
    };

    const handleEditClick = (item, type) => {
        let formData = {};
        
        if (type === "movie") {
            formData = {
                title: item.title || "",
                genre: item.genre || "",
                director: item.director || "",
                rating: item.rating || "",
                duration: item.duration || "",
                synopsis: item.synopsis || "",
                poster: item.poster || "",
                posterCarousel: item.posterCarousel || "",
                releaseDate: item.releaseDate ? new Date(item.releaseDate).toISOString().split('T')[0] : ""
            };
        } else if (type === "room") {
            formData = {
                capacity: item.capacity || ""
            };
        } else if (type === "showing") {
            const showtimeDate = new Date(item.showtime);
            formData = {
                movieId: item.movieId || "",
                screenId: item.screenId || "",
                date: showtimeDate.toISOString().split('T')[0],
                showtime: showtimeDate.toTimeString().slice(0, 5),
                price: item.ticketPrice || item.price || ""
            };
        } else if (type === "candy") {
            formData = {
                name: item.name || "",
                price: item.price || "",
                stock: item.stock || "",
                image: item.image || "",
                description: item.description || ""
            };
        }
        
        setEditForm(formData);
        setEditModal({ show: true, item, type });
    };

    const handleEditFormChange = (field, value) => {
        setEditForm({ ...editForm, [field]: value });
    };

    const handleConfirmEdit = async () => {
        const { item, type } = editModal;
        
        try {
            const token = localStorage.getItem("token");
            const endpoints = {
                movie: "/api/movielistings",
                room: "/api/screens",
                showing: "/api/movieshowings",
                candy: "/api/candy"
            };

            let bodyData = { ...editForm };
            
            // For showings, combine date and time
            if (type === "showing") {
                const datetime = new Date(`${editForm.date}T${editForm.showtime}`).toISOString();
                bodyData = {
                    movieId: editForm.movieId,
                    screenId: editForm.screenId,
                    showtime: datetime,
                    price: editForm.price
                };
            }

            const url = `http://localhost:3000${endpoints[type]}/${item.id}`;

            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            const updatedItem = await response.json();
            
            // Update local state
            if (type === "movie") {
                setMovies(movies.map(m => m.id === item.id ? updatedItem : m));
            } else if (type === "room") {
                setRooms(rooms.map(r => r.id === item.id ? updatedItem : r));
            } else if (type === "showing") {
                // Manually add the movie relationship since backend doesn't include it
                const updatedShowing = {
                    ...updatedItem,
                    movieId: Number(updatedItem.movieId),
                    movie: movies.find(m => m.id === Number(updatedItem.movieId))
                };
                setShowings(showings.map(s => s.id === item.id ? updatedShowing : s));
            } else if (type === "candy") {
                setCandy(candy.map(c => c.id === item.id ? updatedItem : c));
            }

            successToast(`${getItemTypeName(type)} actualizado correctamente`);
            setEditModal({ show: false, item: null, type: "" });
        } catch (err) {
            console.error("EDIT ERROR:", err);
            errorToast(err.message || "Error al actualizar");
        }
    };

    const handleCreateScreen = async () => {
    try {
        const token = localStorage.getItem("token");
        
        // Calculate the next screen number based on highest existing ID
        const maxId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) : 0;
        const capacity = 40; // Default capacity
        
        const response = await fetch("http://localhost:3000/api/screens", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ capacity })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Error al crear la sala");
        }

        const newScreen = await response.json();
        setRooms([...rooms, newScreen]);
        setShowCreateScreenConfirm(false);
        successToast("Sala creada correctamente");
    } catch (err) {
        console.error("Error creating screen:", err);
        errorToast(err.message || "Error al crear la sala");
    }
};

    const getItemTypeName = (type) => {
        const names = {
            user: "Usuario",
            movie: "Película",
            room: "Sala",
            showing: "Función",
            candy: "Candy",
            order: "Orden"
        };
        return names[type] || type;
    };


    const renderEditModalContent = () => {
        const { type } = editModal;

        if (type === "movie") {
            return (
                <div className="modal-form-body">
                    <div className="form-group">
                        <label>Título:</label>
                        <input
                            type="text"
                            value={editForm.title || ""}
                            onChange={(e) => handleEditFormChange("title", e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Género:</label>
                        <input
                            type="text"
                            value={editForm.genre || ""}
                            onChange={(e) => handleEditFormChange("genre", e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Director:</label>
                        <input
                            type="text"
                            value={editForm.director || ""}
                            onChange={(e) => handleEditFormChange("director", e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Rating (0-10):</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                value={editForm.rating || ""}
                                onChange={(e) => handleEditFormChange("rating", e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Duración (min):</label>
                            <input
                                type="number"
                                min="1"
                                value={editForm.duration || ""}
                                onChange={(e) => handleEditFormChange("duration", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Sinopsis:</label>
                        <textarea
                            value={editForm.synopsis || ""}
                            onChange={(e) => handleEditFormChange("synopsis", e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Poster (URL):</label>
                        <input
                            type="text"
                            value={editForm.poster || ""}
                            onChange={(e) => handleEditFormChange("poster", e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Poster Carousel (URL):</label>
                        <input
                            type="text"
                            value={editForm.posterCarousel || ""}
                            onChange={(e) => handleEditFormChange("posterCarousel", e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Fecha de Estreno:</label>
                        <input
                            type="date"
                            value={editForm.releaseDate || ""}
                            onChange={(e) => handleEditFormChange("releaseDate", e.target.value)}
                        />
                    </div>
                </div>
            );
        } else if (type === "room") {
            return (
                <div className="modal-form-body">
                    <div className="form-group">
                        <label>Capacidad (número de asientos):</label>
                        <input
                            type="number"
                            min="1"
                            value={editForm.capacity || ""}
                            onChange={(e) => handleEditFormChange("capacity", e.target.value)}
                        />
                    </div>
                </div>
            );
        } else if (type === "showing") {
            return (
                <div className="modal-form-body">
                    <div className="form-group">
                        <label>Película:</label>
                        <select
                            value={editForm.movieId || ""}
                            onChange={(e) => handleEditFormChange("movieId", Number(e.target.value))}
                        >
                            <option value="">Seleccionar película</option>
                            {movies.map((movie) => (
                                <option key={movie.id} value={movie.id}>
                                    {movie.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Sala:</label>
                        <select
                            value={editForm.screenId || ""}
                            onChange={(e) => handleEditFormChange("screenId", Number(e.target.value))}
                        >
                            <option value="">Seleccionar sala</option>
                            {rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                    Sala {room.id}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha:</label>
                            <input
                                type="date"
                                value={editForm.date || ""}
                                onChange={(e) => handleEditFormChange("date", e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Hora:</label>
                            <input
                                type="time"
                                value={editForm.showtime || ""}
                                onChange={(e) => handleEditFormChange("showtime", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Precio ($):</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editForm.price || ""}
                            onChange={(e) => handleEditFormChange("price", e.target.value)}
                        />
                    </div>
                </div>
            );
        } else if (type === "candy") {
            return (
                <div className="modal-form-body">
                    <div className="form-group">
                        <label>Nombre:</label>
                        <input
                            type="text"
                            value={editForm.name || ""}
                            onChange={(e) => handleEditFormChange("name", e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Precio ($):</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editForm.price || ""}
                                onChange={(e) => handleEditFormChange("price", e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Stock:</label>
                            <input
                                type="number"
                                min="0"
                                value={editForm.stock || ""}
                                onChange={(e) => handleEditFormChange("stock", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Imagen (URL):</label>
                        <input
                            type="text"
                            value={editForm.image || ""}
                            onChange={(e) => handleEditFormChange("image", e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Descripción:</label>
                        <textarea
                            value={editForm.description || ""}
                            onChange={(e) => handleEditFormChange("description", e.target.value)}
                        />
                    </div>
                </div>
            );
        }

        return null;
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
                    <h1>Administración</h1>
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
                    <button 
                        className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
                        onClick={() => setActiveTab("orders")}
                    >
                        Órdenes ({orders.length})
                    </button>
                </div>

                {activeTab === "users" && (
                    <div className="sysadmin-section">
                        <div className="section-header">
                            <h2>Usuarios Registrados</h2>
                            <p className="info-message">Incluye usuarios, admins y sysadmins</p>
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
                                                    <span className={`badge ${
                                                        user.role === 'sysadmin' ? 'badge-danger' :
                                                        user.role === 'admin' ? 'badge-warning' : 
                                                        'badge-info'
                                                    }`}>
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

                                <button onClick={handleGoToRegisterAdmin}> Crear nuevo admin </button>
                                <button onClick={handleGoToRegisterSysAdmin}> Crear nuevo sysadmin </button>
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
                                                <td>{movie.rating}</td>
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
                                <button 
                                    className="add-btn" 
                                    onClick={() => setShowCreateScreenConfirm(true)}
                                >
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
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rooms.map((room) => (
                                            <tr key={room.id}>
                                                <td>{room.id}</td>
                                                <td>Sala {room.id}</td>
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
                                                <td>Sala {showing.screenId}</td>
                                                <td>
                                                    {formatDate(showing.showtime)}
                                                </td>
                                                <td>${showing.ticketPrice || showing.price}</td>
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
                                                        className="edit-btn"
                                                        onClick={() => handleEditClick(item, "candy")}
                                                    >
                                                        Editar
                                                    </button>
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

                {activeTab === "orders" && (
                    <div className="sysadmin-section">
                        <div className="section-header">
                            <h2>Órdenes</h2>
                        </div>
                        
                        {orders.length === 0 ? (
                            <p className="empty-message">No hay órdenes registradas</p>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Usuario ID</th>
                                            <th>Total</th>
                                            <th>Estado</th>
                                            <th>Items</th>
                                            <th>Fecha</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id}>
                                                <td>{order.id}</td>
                                                <td>{order.userId}</td>
                                                <td>${order.total.toFixed(2)}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        order.status === 'cancelled' ? 'badge-danger' :
                                                        'badge-success'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>{order.orderItems?.length || 0} items</td>
                                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                                                <td>
                                                    <button
                                                        className="cancel-btn"
                                                        onClick={() => handleCancelClick(order)}
                                                        style={{ marginRight: '8px' }}
                                                        disabled={order.status === 'cancelled'}
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteClick(order, "order")}
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

                {/* Create Screen Confirmation Modal */}
                {showCreateScreenConfirm && (
                    <div className="modal-overlay" onClick={() => setShowCreateScreenConfirm(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Confirmar Creación de Sala</h3>
                                <button className="modal-close" onClick={() => setShowCreateScreenConfirm(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <p>¿Estás seguro que deseas crear una nueva sala?</p>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    className="cancel-btn"
                                    onClick={() => setShowCreateScreenConfirm(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    className="add-btn"
                                    onClick={handleCreateScreen}
                                >
                                    Crear Sala
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editModal.show && (
                    <div className="modal-overlay" onClick={() => setEditModal({ show: false, item: null, type: "" })}>
                        <div className={`modal-content modal-form ${editModal.type === 'movie' ? 'modal-form-large' : ''}`} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Editar {getItemTypeName(editModal.type)}</h3>
                                <button className="modal-close" onClick={() => setEditModal({ show: false, item: null, type: "" })}>×</button>
                            </div>
                            <div className="modal-body">
                                {renderEditModalContent()}
                            </div>
                            <div className="modal-footer">
                                <button 
                                    className="cancel-btn"
                                    onClick={() => setEditModal({ show: false, item: null, type: "" })}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    className="save-btn"
                                    onClick={handleConfirmEdit}
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm.show && (
                    <div className="modal-overlay" onClick={() => setDeleteConfirm({ show: false, item: null, type: "" })}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Confirmar Eliminación</h3>
                                <button className="modal-close" onClick={() => setDeleteConfirm({ show: false, item: null, type: "" })}>×</button>
                            </div>
                            <div className="modal-body">
                                <p>¿Estás seguro que deseas eliminar este {getItemTypeName(deleteConfirm.type).toLowerCase()}?</p>
                            </div>
                            <div className="modal-footer">
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

                {cancelConfirm.show && (
                <div className="delete-confirm-overlay" onClick={() => setCancelConfirm({ show: false, order: null })}>
                    <div className="delete-confirm-box" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirmar Cancelación</h3>
                        <p>¿Estás seguro que deseas cancelar esta orden #{cancelConfirm.order?.id}?</p>
                        <div className="delete-confirm-buttons">
                            <button 
                                className="cancel-btn"
                                onClick={() => setCancelConfirm({ show: false, order: null })}
                            >
                                No
                            </button>
                            <button 
                                className="delete-btn"
                                onClick={handleConfirmCancel}
                            >
                                Sí, Cancelar Orden
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};