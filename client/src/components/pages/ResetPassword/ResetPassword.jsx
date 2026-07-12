import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Col, Form, FormGroup, Row } from "react-bootstrap";
import '../Login/Login.css';
import cineverseLogo from '../../../assets/images/cineverse-logo-without-name.png';
import TatinAlien1 from '../../../assets/images/Alien 3.png';
import { successToast, errorToast } from "../../../utils/toast";
import { NavBar } from "../../NavBar/NavBar";

export const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!password || !confirmPassword) {
            errorToast("Por favor, completa todos los campos");
            return;
        }

        if (password !== confirmPassword) {
            errorToast("Las contraseñas no coinciden");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:3000/api/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword: password }),
            });

            const data = await response.json();

            if (response.ok) {
                successToast(data.message || "Contraseña actualizada exitosamente");
                navigate("/login");
            } else {
                errorToast(data.message || "Hubo un error al actualizar la contraseña");
            }
        } catch (error) {
            errorToast("Error de conexión con el servidor");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="NavBar">
            <NavBar />
            <Card className="mt-5 mx-3 p-3 px-5 shadow">
                <Card.Body>
                    <Row className="mb-3 justify-content-center">
                        <img src={cineverseLogo} alt="Cineverse Logo" className="login-logo" />
                        <img src={TatinAlien1} alt="Alien" className="Alien-image" />
                    </Row>

                    <Row className="mb-2 text-center">
                        <h5>Restablecer Contraseña</h5>
                        <p className="text-muted" style={{fontSize: "14px"}}>
                            Ingresa tu nueva contraseña para acceder a CineVerse.
                        </p>
                    </Row>

                    <Row>
                        <Form onSubmit={handleSubmit} noValidate>
                            <FormGroup className="mb-4">
                                <Form.Control
                                    name="password"
                                    type="password"
                                    placeholder="Nueva contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </FormGroup>
                            
                            <FormGroup className="mb-4">
                                <Form.Control
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirmar nueva contraseña"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </FormGroup>

                            <Row className="justify-content-center text-center">
                                <Col md={12} className="mb-3">
                                    <Button variant="secondary" type="submit" disabled={isLoading} className="w-100">
                                        {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                                    </Button>
                                </Col>
                                <Col>
                                    <Button variant="link" className="text-muted" style={{textDecoration: "none"}} onClick={() => navigate("/login")}>
                                        Cancelar
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};
