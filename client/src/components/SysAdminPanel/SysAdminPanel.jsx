
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "../../components/NavBar/NavBar";
import { successToast, errorToast } from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";
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
    const [newScreenCapacity, setNewScreenCapacity] = useState("");

    const handleGoToRegister = () =>
    {
        navigate("/register")
    }

    const handleGoToRegisterAdmin = () =>
    {
        navigate("/register-admin")
    }

    const handleGoToRegisterSysAdmin = () =>
    {
        navigate("/register-sysadmin")
    }

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

    const handleDeleteClick = (item, type) => {
        setDeleteConfirm({ show: true, item, type });
    };

    const handleConfirmDelete = async () => {
        const { item, type } = deleteConfirm;
        
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
            console.log(" Deleting:", type, "with ID:", item.id);
            console.log(" Full URL:", url);
            console.log(" Token:", token ? "Present" : "Missing");

            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            console.log(" Response status:", response.status);
            console.log(" Response headers:", Object.fromEntries(response.headers.entries()));

            const contentType = response.headers.get("content-type");
            console.log(" Content-Type:", contentType);

            let responseData;
            const responseText = await response.text();
            console.log(" Raw response:", responseText);

            try {
                responseData = JSON.parse(responseText);
                console.log(" Parsed as JSON:", responseData);
            } catch (parseError) {
                console.error(" JSON parse error:", parseError);
                console.error(" Response was not valid JSON:", responseText);
                throw new Error(`Server returned invalid response: ${responseText}`);
            }

            if (!response.ok) {
                throw new Error(responseData.message || `Error ${response.status}`);
            }
            
            if (type === "user") {
                setUsers(users.filter((u) => u.id !== item.id));
            }
            else if (type === "movie") {
                
                setMovies(movies.filter((m) => m.id !== item.id));
                
                setShowings(showings.filter((s) => s.movieId !== item.id));
            }
            else if (type === "room") {
                
                setRooms(rooms.filter((r) => r.id !== item.id));
                
                setShowings(showings.filter((s) => s.screenId !== item.id));
            }
            else if (type === "showing") {
                setShowings(showings.filter((s) => s.id !== item.id));
            }
            else if (type === "candy") {
                setCandy(candy.filter((c) => c.id !== item.id));
            }
            else if (type === "order") {
                setOrders(orders.filter((o) => o.id !== item.id));
            }

            successToast(`${getItemTypeName(type)} eliminado correctamente`);
            setDeleteConfirm({ show: false, item: null, type: "" });
        } catch (err) {
            console.error(" DELETE ERROR:", err);
            console.error(" Error stack:", err.stack);
            errorToast(err.message || "Error al eliminar");
        }
    };

    const handleCreateScreen = async (e) => {
        e.preventDefault();
        
        const capacity = parseInt(newScreenCapacity);
        
        if (!capacity || capacity <= 0) {
            errorToast("La capacidad debe ser mayor a 0");
            return;
        }

        try {
            const token = localStorage.getItem("token");
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
            setNewScreenCapacity("");
            setShowCreateScreen(false);
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


                                <button onClick={handleGoToRegister}> Crear nuevo usuario </button>
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
                                onClick={() => setShowCreateScreen(true)}
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
                                            <th>Capacidad</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rooms.map((room) => (
                                            <tr key={room.id}>
                                                <td>{room.id}</td>
                                                <td>Sala {room.id}</td>
                                                <td>{room.capacity} asientos</td>
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
                                                    <span className={`badge ${order.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>{order.orderItems?.length || 0} items</td>
                                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                                                <td>
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

                {showCreateScreen && (
                    <div className="delete-confirm-overlay" onClick={() => setShowCreateScreen(false)}>
                        <div className="delete-confirm-box" onClick={(e) => e.stopPropagation()}>
                            <h3>Crear Nueva Sala</h3>
                            <form onSubmit={handleCreateScreen}>
                                <div className="form-group">
                                    <label>Capacidad (número de asientos):</label>
                                    <input 
                                        type="number"
                                        min="1"
                                        value={newScreenCapacity}
                                        onChange={(e) => setNewScreenCapacity(e.target.value)}
                                        placeholder="Ej: 40"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="delete-confirm-buttons">
                                    <button 
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowCreateScreen(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        className="add-btn"
                                    >
                                        Crear Sala
                                    </button>
                                </div>
                            </form>
                        </div>
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