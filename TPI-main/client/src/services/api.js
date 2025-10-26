
export const API_URL = "http://localhost:3000/api"


export async function apiRequest(endpoint, method = "GET", data = null, token = null)
{
    const options =
    {
        method,
        headers: 
        {
            "Content-Type": "application/json"
        }
    }


    if (data) 
    {
        options.body = JSON.stringify(data)
    }   
           
    if (token) 
    {
        options.headers.Authorization = `Bearer ${token}`
    }

    
    const response = await fetch(`${API_URL}${endpoint}`, options)


    if (!response.ok)
    {
        const error = await response.json()
        throw new Error(error.message || "Error en la solicitud")
    }


    return response.json()
    
}



