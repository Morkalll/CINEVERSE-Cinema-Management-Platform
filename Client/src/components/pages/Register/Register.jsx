
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Card, Col, Form, FormGroup, Row } from "react-bootstrap"
import { successToast, errorToast } from "../../../utils/toast";
import { apiRequest } from "../../../services/api";


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


    const handleUsernameChange = (event) =>
    {
        const usernameValue = event.target.value

        setUsername(usernameValue)

        if (usernameValue.trim().length < 5) 
        {
            setError({...error, usernameError: "El nombre de usuario debe tener mínimo 5 caracteres"})
        }

        else 
        {
            setError({...error, usernameError: ""})
        }

    }


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


    const handleConfirmedPasswordChange = (event) =>
    {
        const confirmedPasswordValue = event.target.value

        setConfirmedPassword(confirmedPasswordValue)
        
        if (confirmedPasswordValue !== password) 
        {
            setError({...error, confirmedPasswordError: "Las contraseñas deben coincidir"})
        }

        else
        {
            setError({...error, confirmedPasswordError: ""})
        }

    }


    const navigate = useNavigate()


    const handleSubmit = async (event) =>
    {
        event.preventDefault()

        if (username.trim() !== ""
        && email.trim() !== ""
        && password.trim() !== ""
        && confirmedPassword.trim() !== ""
        && error.usernameError === ""
        && error.emailError === "" 
        && error.passwordError === "" 
        && error.confirmedPasswordError === "")
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

    
    return(

        <Card className="mt-5 mx-3 p-3 px-5 shadow">

            <Card.Body>


                
                <Row className="mb-2">
                    <h5>
                        Por favor, ingrese sus datos para el registro:
                    </h5>
                </Row>


                <Row>
                    
                    <Form onSubmit={handleSubmit} noValidate>


                        <FormGroup className="mb-4">


                            <Form.Control 
                                placeholder="Ingresar nombre de usuario"
                                onChange={handleUsernameChange}
                                value={username}
                            />
                            
                            {error.usernameError && 
                            (
                                <div className="text-danger">
                                    {error.usernameError}
                                </div>
                            )}

                        </FormGroup>


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


                        <FormGroup className="mb-4">

                            <Form.Control 
                                type="password" 
                                placeholder="Confirmar contraseña"
                                onChange={handleConfirmedPasswordChange}
                                value={confirmedPassword}
                            />
                            
                            {error.confirmedPasswordError && 
                            (
                                <div className="text-danger"> 

                                    {error.confirmedPasswordError} 

                                </div>
                            )}

                        </FormGroup>


                        <Row>

                            <Col/>

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

    )

}