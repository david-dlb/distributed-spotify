import { handleErrorWithSweetAlert } from "./alert";
import archivoTexto from '../../server/ip.txt';

export async function requestToServer(method, url, data, onSuccess, onError) {
  try {
    console.log("SERVER DE UTILS ")
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
    const urlF = "http://10.0.11.2:8080/api" + url 
    // Hacer la solicitud con fetch
    const response = await fetch(urlF, options);
    
      // Comprobar si la respuesta fue exitosa
console.log(response, "r")
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
    data = ipAddress
  })
  .catch(error => {
    console.error('Error al leer el archivo:', error);
  });
  return data
}

export async function request(method, url, data, onSuccess, onError) {
  console.log("request", url)
  try {
    // Opciones de la solicitud
    const options = {
      method: method,
    };  
    if (method == "POST" || method == "PUT") {
      console.log("hola", data.get("Name"))
    }
    if (data && (method !== 'GET' && method != "DELETE")) {
      console.log("hola", url)
      // options.body = JSON.stringify(data);
      options.body = data;
    }
    
    const ip = await read() 
    let result = null
    if (url.startsWith("/Song/download/indexed")) {
      
      const response = await fetch(ip + ":8000/api" + url, options) 
      if (!response.ok) {
        onError('Error al obtener el segmento de audio')
        throw new Error('Error al obtener el segmento de audio');
      }
      const d = await response.arrayBuffer()
      onSuccess(d)
      return d
    } else { console.log(options)
      const response = await fetch(ip + ":8000/api" + url, options) 
      result = await response.json()
      if (!response.ok) {
        console.log(result)
        handleErrorWithSweetAlert(result.title || result.message)
        throw new Error(`Error en la solicitud: ${response.status}`)
      }
    }
    
    
    // Llamar a la función de éxito pasando el resultado
    onSuccess(result)
  } catch (error) {
    // Llamar a la función de error pasando el mensaje de error
    onError(error.message)
  }
}


 