import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Form, FormGroup, Row } from "react-bootstrap";
import '../Login/Login.css';
import cineverseLogo from '../../../assets/images/cineverse-logo-without-name.png';
import TatinAlien1 from '../../../assets/images/Alien 3.png';
import { successToast, errorToast } from "../../../utils/toast";
import { NavBar } from "../../navBar/NavBar";

export const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            errorToast("Por favor, ingresa tu email");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:3000/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                successToast(data.message || "Correo enviado exitosamente");
                navigate("/login");
            } else {
                errorToast(data.message || "Hubo un error al enviar el correo");
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
                        <h3>Recuperar Contraseña</h3>
                        <p className="text-muted" style={{fontSize: "20px"}}>
                            Ingresa tu correo electrónico para que puedas restablecer tu contraseña.
                        </p>
                    </Row>

                    <Row>
                        <Form onSubmit={handleSubmit} noValidate>
                            <FormGroup className="mb-4">
                                <Form.Control
                                    name="email"
                                    type="email"
                                    placeholder="Ingresar email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </FormGroup>

                            <Row className="justify-content-center text-center">
                                <Col md={12} className="mb-3">
                                    <Button variant="secondary" type="submit" disabled={isLoading} className="w-100">
                                        {isLoading ? "Enviando..." : "Enviar enlace"}
                                    </Button>
                                </Col>
                                <Col>
                                    <Button variant="link" className="text-muted" style={{textDecoration: "none"}} onClick={() => navigate("/login")}>
                                        Volver al Login
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
