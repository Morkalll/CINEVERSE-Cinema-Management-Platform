
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Card, Col, Form, FormGroup, Row } from "react-bootstrap"
import './Login.css'
import cineverseLogo from '../../../assets/images/cineverse-logo-without-name.png'
import TatinAlien1 from '../../../assets/images/Alien 3.png'
import { successToast, errorToast } from "../../../utils/toast"
import { useAuth } from "../../../context/AuthContext";
import { NavBar } from "../../navBar/NavBar"


export const Login = () => 
{

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const { login } = useAuth();
    const navigate = useNavigate();


    const handleSubmit = async (e) => 
    {
        e.preventDefault();

        const result = await login(email, password);


        if (result.success) 
        {
            successToast("¡Inicio de sesión exitoso!");
            const userRole = result.data?.user?.role;
            
            if (userRole === "sysadmin" || userRole === "admin") {
                navigate("/sysadmin");
            } else {
                navigate("/home");
            }
        } 
        
        else 
        {
            errorToast(result.error || "Error al iniciar sesión");
        }

    };


    const goToRegisterHandler = () => 
    {
        navigate("/register")
    }


    return (

        <div className="NavBar">

            <NavBar />

            <Card className="mt-5 mx-3 p-3 px-5 shadow">

                <Card.Body>

                    <Row className="mb-3 justify-content-center">

                        <img src={cineverseLogo} alt="Cineverse Logo" className="login-logo" />
                        <img src={TatinAlien1} alt="Alien" className="Alien-image" />

                    </Row>


                    <Row className="mb-2">

                        <h5>
                            
                            ¡Bienvenido a CINEVERSE!

                        </h5>

                    </Row>


                    <Row>

                        <Form onSubmit={handleSubmit} noValidate>


                            <FormGroup className="mb-4">

                                <Form.Control
                                    name="email"
                                    placeholder="Ingresar email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                            </FormGroup>


                            <FormGroup className="mb-4">

                                <Form.Control
                                    name="password"
                                    type="password"
                                    placeholder="Ingresar contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}

                                />

                            </FormGroup>


                            <Row>


                                <Col md={6} className="d-flex-justify-content-end">

                                    <Button variant="secondary" type="submit">

                                        Iniciar sesión

                                    </Button>

                                    <section>­</section>

                                </Col>


                                <Col>

                                    <section className="mb-2">

                                        ¿No tienes cuenta?

                                    </section>


                                    <Button variant="secondary" onClick={goToRegisterHandler} className="mb-3">

                                        Registrarse

                                    </Button>

                                    <div style={{ marginTop: "20px" }}>
                                        <span 
                                            className="text-muted" 
                                            style={{cursor: "pointer", fontSize: "14px"}} 
                                            onClick={() => navigate("/forgot-password")}
                                            onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                                            onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </span>
                                    </div>

                                </Col>

                            </Row>


                        </Form>

                    </Row>


                </Card.Body>

            </Card>

        </div>
    )

}
