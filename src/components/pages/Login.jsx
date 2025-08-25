
import { useState } from "react"
import { Button, Card, Col, Form, FormGroup, Row } from "react-bootstrap"


export const Login = () =>
{
// _______________________________________________________________________________________________________________________________________
// FUNCIONES Y LÓGICA
// _______________________________________________________________________________________________________________________________________


    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")


    const handleEmailChange = (event) =>
    {
        setEmail(event.target.value)
    }


    const handlePasswordChange = (event) =>
    {
        setPassword(event.target.value)
    }


    const handleSubmit = (event) =>
    {
        event.preventDefault()
        alert(`El email ingresado es: ${email} y el password es ${password}`)
    }

    
// _______________________________________________________________________________________________________________________________________
// RETURN EN NAVEGADOR
// _______________________________________________________________________________________________________________________________________


    return(

        <Card className="mt-5 mx-3 p-3 px-5 shadow">

            <Card.Body>


                <Row className="mb-2">
                    <h5>
                        ¡Bienvenido a CINEVERSE!
                    </h5>
                </Row>


                <Row>
                    
                    <Form onSubmit={handleSubmit}>


                        <FormGroup className="mb-4">
                            
                            <Form.Control 
                                type="email" 
                                required 
                                placeholder="Ingresar email"
                                onChange={handleEmailChange}
                                value={email}
                            />

                        </FormGroup>


                        <FormGroup className="mb-4">

                            <Form.Control 
                                type="password" 
                                required 
                                placeholder="Ingresar password"
                                onChange={handlePasswordChange}
                                value={password}
                            />
                            
                        </FormGroup>


                        <Row>

                            <Col/>

                            <Col md={6} className="d-flex-justify-content-end">

                                <Button variant="secondary" type="submit">
                                    Iniciar sesión
                                </Button>

                            </Col>

                        </Row>


                    </Form>

                </Row>


            </Card.Body>

        </Card>

    )

}