
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Card, Col, Form, FormGroup, Row } from "react-bootstrap"
import { successToast, errorToast } from "../../../utils/toast";
import { apiRequest } from "../../../services/api";
import TatinAlien2 from '../../../assets/images/Alien 2.png'
import { NavBar } from "../../NavBar/NavBar";


export const Register = () => 
{
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmedPassword, setConfirmedPassword] = useState("")


    const [error, setError] = useState(
    {
        usernameError: "",
        emailError: "",
        passwordError: "",
        confirmedPasswordError: ""
    })


    const [touched, setTouched] = useState(
    {
        username: false,
        email: false,
        password: false,
        confirmedPassword: false
    });


    const navigate = useNavigate()


    const handleUsernameChange = (e) => 
    {
        setUsername(e.target.value)

        if (touched.username) 
        {
            setError({ ...error, usernameError: e.target.value.trim().length < 5 ? "El nombre de usuario debe tener mínimo 5 caracteres" : "" })
        }
    }


    const handleEmailChange = (e) => 
    {
        setEmail(e.target.value)

        if (touched.email) 
        {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            setError({ ...error, emailError: !emailRegex.test(e.target.value) ? "Ingrese un email válido" : "" })
        }
    }


    const handlePasswordChange = (e) => 
    {
        const value = e.target.value

        setPassword(value)

        if (touched.password) 
        {
            setError({ ...error, passwordError: value.trim().length < 8 ? "La contraseña debe tener mínimo 8 caracteres" : "" })
        }

        if (touched.confirmedPassword) 
        {
            setError(prev => ({ ...prev, confirmedPasswordError: confirmedPassword !== value ? "Las contraseñas deben coincidir" : "" }))
        }
    }


    const handleConfirmedPasswordChange = (e) => 
    {
        const value = e.target.value

        setConfirmedPassword(value)

        if (touched.confirmedPassword) 
        {
            setError({ ...error, confirmedPasswordError: value !== password ? "Las contraseñas deben coincidir" : "" })
        }
    }


    const handleSubmit = async (e) => 
    {
        e.preventDefault()

        setTouched(
        {
            username: true,
            email: true,
            password: true,
            confirmedPassword: true
        });


        const usernameError = username.trim().length < 5 ? "El nombre de usuario debe tener mínimo 5 caracteres" : ""
        const emailError = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) ? "" : "Ingrese un email válido"
        const passwordError = password.trim().length < 8 ? "La contraseña debe tener mínimo 8 caracteres" : ""
        const confirmedPasswordError = confirmedPassword !== password ? "Las contraseñas deben coincidir" : ""


        setError({ usernameError, emailError, passwordError, confirmedPasswordError })


        if (!usernameError && !emailError && !passwordError && !confirmedPasswordError) 
        {
            try 
            {
                await apiRequest("/auth/register", "POST", { username, email, password })
                successToast("¡Usuario registrado correctamente!");
                navigate("/login");
            } 
            
            catch (err) 
            {
                errorToast(err.message);
            }
        }
    }


    return (

        <>
        <NavBar/>

        <Card className="mt-5 mx-3 p-3 px-5 shadow">

            <Card.Body>

                <Row className="mb-2">

                    <h5>Por favor, ingrese sus datos para el registro:</h5>

                    <img src={TatinAlien2} alt="Alien" className="Alien-image" />

                </Row>


                <Row>

                    <Form onSubmit={handleSubmit} noValidate>

                        <FormGroup className="mb-4">

                            <Form.Control
                                placeholder="Ingresar nombre"
                                onChange={handleUsernameChange}
                                onBlur={() => 
                                {
                                    setTouched({ ...touched, username: true })
                                    setError({ ...error, usernameError: username.trim().length < 5 ? "El nombre de usuario debe tener mínimo 5 caracteres" : "" })
                                }}
                                value={username}
                            />

                            {touched.username && error.usernameError && (
                                <div className="text-danger">{error.usernameError}</div>
                            )}

                        </FormGroup>


                        <FormGroup className="mb-4">

                            <Form.Control
                                placeholder="Ingresar email"
                                onChange={handleEmailChange}
                                onBlur={() => 
                                {
                                    setTouched({ ...touched, email: true })
                                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
                                    setError({ ...error, emailError: !emailRegex.test(email) ? "Ingrese un email válido" : "" })
                                }}
                                value={email}
                            />

                            {touched.email && error.emailError && (
                                <div className="text-danger">{error.emailError}</div>
                            )}

                        </FormGroup>


                        <FormGroup className="mb-4">

                            <Form.Control
                                type="password"
                                placeholder="Ingresar contraseña"
                                onChange={handlePasswordChange}
                                onBlur={() => 
                                {
                                    setTouched({ ...touched, password: true })
                                    setError({ ...error, passwordError: password.trim().length < 8 ? "La contraseña debe tener mínimo 8 caracteres" : "" })
                                    if (touched.confirmedPassword) {
                                        setError(prev => ({ ...prev, confirmedPasswordError: confirmedPassword !== password ? "Las contraseñas deben coincidir" : "" }))
                                    }
                                }}
                                value={password}
                            />

                            {touched.password && error.passwordError && (
                                <div className="text-danger">{error.passwordError}</div>
                            )}

                        </FormGroup>


                        <FormGroup className="mb-4">
                            
                            <Form.Control
                                type="password"
                                placeholder="Confirmar contraseña"
                                onChange={handleConfirmedPasswordChange}
                                onBlur={() => 
                                {
                                    setTouched({ ...touched, confirmedPassword: true })
                                    setError({ ...error, confirmedPasswordError: confirmedPassword !== password ? "Las contraseñas deben coincidir" : "" })
                                }}
                                value={confirmedPassword}
                            />

                            {touched.confirmedPassword && error.confirmedPasswordError && (
                                <div className="text-danger">{error.confirmedPasswordError}</div>
                            )}

                        </FormGroup>


                        <Row>
                            
                            <Col />
                            
                            <Col md={6} className="d-flex-justify-content-end">
                                
                                <Button variant="secondary" type="submit">
                                
                                    Registrarse
                                
                                </Button>
                            
                            </Col>
                        
                        </Row>
                    
                    </Form>

                </Row>

            </Card.Body>
            
        </Card>
        </>
    )
}
