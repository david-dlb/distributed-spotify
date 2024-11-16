import { handleErrorWithSweetAlert } from "./alert";

export const baseUrl = "http://localhost:5140/api"
export async function requestToServer(method, url, data, onSuccess, onError) {
  try {
    // Opciones de la solicitud
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Solo añadir el cuerpo si hay datos (y si no es GET)
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    const urlF = baseUrl + url 
    // Hacer la solicitud con fetch
    const response = await fetch(urlF, options);
    
    // Comprobar si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    // Intentar convertir la respuesta a JSON
    const result = await response.json();
    
    // Llamar a la función de éxito pasando el resultado
    onSuccess(result);
  } catch (error) {
    // Llamar a la función de error pasando el mensaje de error
    console.log("error")
    handleErrorWithSweetAlert(error.message)
    onError(error.message);
  }
}
  

export async function requestToServerForm(method, url, data, onSuccess, onError) {
  try {
    // Opciones de la solicitud
    const options = {
      method: method,
      headers: {
        // 'accept': 'text/plain',
      },
      body: data,
    };
    const urlF = baseUrl + url 
    // Hacer la solicitud con fetch
    const response = await fetch(urlF, options);
    
      console.log(await response.json())
      // Comprobar si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    // Intentar convertir la respuesta a JSON
    const result = await response.json();
    
    // Llamar a la función de éxito pasando el resultado
    onSuccess(result);
  } catch (error) {
    // Llamar a la función de error pasando el mensaje de error
    console.log(error)
    handleErrorWithSweetAlert(error.message)
    onError(error.message);
  }
}
