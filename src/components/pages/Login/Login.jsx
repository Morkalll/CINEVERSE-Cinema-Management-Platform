
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Card, Col, Form, FormGroup, Row } from "react-bootstrap"
import './Login.css'
import cineverseLogo from '../../../assets/images/cineverse-logo-without-name.png'
import TatinAlien1 from '../../../assets/images/Alien 3.png'
import { apiRequest } from "../../../services/api"
import { successToast, errorToast } from "../../../utils/toast"


export const Login = () =>
{

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(
    {
        emailError: "",
        passwordError: "",
    })


    const handleEmailChange = (event) =>
    {
        const emailValue = event.target.value
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        setEmail(emailValue)

        if (!emailRegex.test(emailValue))
        {
            setError({...error, emailError: "Ingrese un email válido"})
        }

        else
        {
            setError({...error, emailError: ""})
        }

    }


    const handlePasswordChange = (event) =>
    {
        const passwordValue = event.target.value

        setPassword(passwordValue)

        if (passwordValue.trim().length < 8) 
        {
            setError({...error, passwordError: "La contraseña debe tener mínimo 8 caracteres"})
        }

        else 
        {
            setError({...error, passwordError: ""})
        }

    }


    const handleSubmit = async (event) =>
    {
        event.preventDefault()

        if (email.trim() !== ""
        && password.trim() !== ""
        && error.emailError === "" 
        && error.passwordError === "" )
        {
            try 
            {
                const res = await apiRequest("/auth/login", "POST", { email, password });
                localStorage.setItem("token", res.token);
                successToast("¡Inicio de sesión exitoso!");
                navigate("/home");
            } 
            
            catch (err) 
            {
                errorToast(err.message);
            }
        }
    }

    

    const navigate = useNavigate()

    
    const goToRegisterHandler = () =>
    {
        navigate("/register")
    }



    return(

        <Card className="mt-5 mx-3 p-3 px-5 shadow">

            <Card.Body>

                <Row className="mb-3 justify-content-center">
                    <img src={cineverseLogo} alt="Cineverse Logo" className="login-logo" />
                    <img src={TatinAlien1} alt="Tatin el alien" className="login-alien" />
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
                                placeholder="Ingresar email"
                                onChange={handleEmailChange}
                                value={email}
                            />

                            {error.emailError && 
                            (
                                <div className="text-danger">
                                    {error.emailError}
                                </div>
                            )}

                        </FormGroup>


                        <FormGroup className="mb-4">

                            <Form.Control 
                                type="password" 
                                placeholder="Ingresar contraseña"
                                onChange={handlePasswordChange}
                                value={password}
                            />
                            
                            {error.passwordError && 
                            (
                                <div className="text-danger">
                                    {error.passwordError}
                                </div>
                            )}

                        </FormGroup>


                        <Row>

                            <Col/>

                            <Col md={6} className="d-flex-justify-content-end">

                                <Button variant="secondary" type="submit">
                                    Iniciar sesión
                                </Button>

                                <Button variant="secondary" onClick={goToRegisterHandler}>
                                    Registrarse
                                </Button>

                            </Col>

                        </Row>


                    </Form>

                </Row>


            </Card.Body>

        </Card>

    )

}