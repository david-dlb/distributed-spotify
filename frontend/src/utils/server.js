import { handleErrorWithSweetAlert } from "./alert";
import archivoTexto from '../../server/ip.txt';

export async function requestToServer(method, url, data, onSuccess, onError) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    // Solo añadir el cuerpo si hay datos (y si no es GET)
    if (data && (method !== 'GET' || method != "DELETE")) {
      options.body = JSON.stringify(data);
    }
    const urlF = window.env.URL + url 
    console.log(urlF)
    // Hacer la solicitud con fetch
    const response = await fetch(urlF, options);
    
    // Intentar convertir la respuesta a JSON
    const result = await response.json();
    // Comprobar si la respuesta fue exitosa
    if (!response.ok) {
      console.log(result)
      handleErrorWithSweetAlert(result.title)
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    
    // Llamar a la función de éxito pasando el resultado
    onSuccess(result);
  } catch (error) {
    // Llamar a la función de error pasando el mensaje de error
    console.log(1)
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
    const urlF = window.env.URL + url 
    // Hacer la solicitud con fetch
    const response = await fetch(urlF, options);
    
      // Comprobar si la respuesta fue exitosa

    // Intentar convertir la respuesta a JSON
    const result = await response.json();
    
    if (!response.ok) {
      console.log(result)
      handleErrorWithSweetAlert(result.title)
      throw new Error(`Error en la solicitud: ${response.status}`);
    }
    
    // Llamar a la función de éxito pasando el resultado
    onSuccess(result);
  } catch (error) {
    // Llamar a la función de error pasando el mensaje de error
    onError(error.message);
  }
}


const read = async () => {
  const filePath = '../../server/ip.txt';
  let data = ""
  try {
    let response = await fetch(filePath)
    response = await response.text()
    data = response.trim()
  } catch (error) {
    console.error('Error al leer el archivo:', error);
  }
  await fetch(filePath)
  .then(response => response.text())
  .then(data => {
    const ipAddress = data.trim(); // Elimina espacios en blanco y extrae la IP
    console.log('IP de la máquina:', ipAddress);
    data = ipAddress
  })
  .catch(error => {
    console.error('Error al leer el archivo:', error);
  });
  return data
}

export async function request(method, url, data, onSuccess, onError) {
  try {
    // Opciones de la solicitud
    const options = {
      method: method,
    }; 
    if (!method == "POST" || !method == "PUT") {
      options.headers = {
        'Content-Type': 'application/json'
      }
    }
    if (data && (method !== 'GET' || method != "DELETE")) {
      options.body = JSON.stringify(data);
    }
    const ip = await read()
    const response = await fetch(ip + ":8000/api" + url, options);
    let result = null
    if (url.startsWith("Song/download/indexed")) {
      result = await response.arrayBuffer()
    } else { 
      result = await response.json(); 
    }
    if (!response.ok) {
      console.log(result)
      handleErrorWithSweetAlert(result.title)
      throw new Error(`Error en la solicitud: ${response.status}`);
    }
    
    // Llamar a la función de éxito pasando el resultado
    onSuccess(result);
    return result
  } catch (error) {
    // Llamar a la función de error pasando el mensaje de error
    onError(error.message);
    return error.message
  }
}




export async function sequentialRequest(method, url, data, onSuccess, onError) {
  let pendingRequests = [];
  const timeout = 10000
  let responded = false

  while(!responded) {
    try {
      // Crear una promesa que se rechace después del timeout
      const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), timeout);
      });
      const fetchPromise = fetch(url, options);
      pendingRequests.push(fetchPromise);
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      if (response.ok) {
        responded = true
        onSuccess(fetchPromise)
        return response;
      } else {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Intento fallido:`, error.message);
    }
  }
}
