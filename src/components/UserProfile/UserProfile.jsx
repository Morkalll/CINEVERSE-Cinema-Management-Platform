
import { useAuth } from "../../context/AuthContext";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";

export const UserProfile = () => {

    const { user, loading, logout } = useAuth();

    const navigate = useNavigate()

    const handleGoToLogin = () => {
        navigate("/login")
    }

    const handleLogOut = () => {
        logout()
        navigate("/login")
    }


    if (loading) {
        return (
            <div>
                <h1>Cargando perfil...</h1>
            </div>
        )
    }

    if (!user) {
        return (
            <div>
                <h1>No has iniciado sesión.</h1>

                <section>
                    <Button variant="secondary" onClick={handleGoToLogin}>
                        Iniciar sesión
                    </Button>
                </section>
            </div>
        )
    }

    return (
        <div className="front">

            <section>
                <h1>¡Bienvenido, {user.username}!</h1>
                <h1>Tus compras recientes son las siguientes:</h1>
                <h2>(EN PROCESO)</h2>
            </section>

            <section>
                <Button variant="secondary" onClick={handleLogOut}>
                    Cerrar sesión
                </Button>
            </section>
        </div>
    );
};

