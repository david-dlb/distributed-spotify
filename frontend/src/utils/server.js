import { handleErrorWithSweetAlert } from "./alert";

const read = async () => {
  // Aumimos que sabemos de antemano la ip del frontend. 
  return "http://10.0.10.2"
};

export async function request(method, url, data, onSuccess, onError) {
  try {
    // Opciones de la solicitud
    const options = {
      method: method,
    };  
    
    if (data && (method == 'POST')) {
      options.body = data;
    }
    if (data && (method == 'PUT')) {
      options.body = JSON.stringify(data);
      options.headers = {
        'Content-Type': 'application/json'
      }
    }
    
    const ip = await read() 
    const baseUrl = ip + ":8000/api"; 
    const finalUrl = baseUrl + url; 
    console.log(options)
    console.log(`Sending request to ${finalUrl}.`)
    let result = null
    if (url.startsWith("/Song/download/indexed")) {
      
      const response = await fetch(finalUrl, options) 
      if (!response.ok) {
        onError('Error al obtener el segmento de audio')
        throw new Error('Error al obtener el segmento de audio');
      }
      const d = await response.arrayBuffer()
      onSuccess(d)
      return d
    } else { 
      const response = await fetch(finalUrl, options) 
      result = await response.json()
      if (!response.ok) {
        console.log({result})
        handleErrorWithSweetAlert(result.title || result.message)
        throw new Error(`Error en la solicitud: ${response.status}`)
      }
    }    
    onSuccess(result)
  } catch (error) {
    // Llamar a la función de error pasando el mensaje de error
    onError(error.message)
  }
}


 