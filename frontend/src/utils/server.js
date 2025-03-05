import { handleErrorWithSweetAlert } from "./alert";

const read = async () => {
  // Aumimos que sabemos de antemano la ip del frontend. 
  return "http://10.0.10.2"
};


const readA = async (filePath = '../../server/url.txt') => {
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
    
    const ip = await readA('../../server/ip.txt') 
    const baseUrl = ip + ":8000/api"; 
    let result = null
    if (url.startsWith("/Song/download/indexed")) {
      
      const response = await fetch(baseUrl + url, options) 
      if (!response.ok) {
        onError('Error al obtener el segmento de audio')
        throw new Error('Error al obtener el segmento de audio');
      }
      const d = await response.arrayBuffer()
      onSuccess(d)
      return d
    } else { 
      const response = await fetch(baseUrl + url, options) 
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


export async function requestPost(method, url, data, onSuccess, onError) {
  while (true) {
    try {
      // Opciones de la solicitud
      const options = {
        method: method,
      };  
      
      options.body = data; 
      const ip = await readA('../../server/url.txt') 
      const baseUrl = ip + "/api";  
      let result = null 
        const response = await fetch(baseUrl + url, options) 
        if (!response.ok) {
          // console.log({result})
          // handleErrorWithSweetAlert(result.title || result.message)
          throw new Error(`Error en la solicitud: ${response.status}`)
        }
        result = await response.json()
        
      onSuccess(result)
      return
    } catch (error) {
      // Llamar a la función de error pasando el mensaje de error
      // onError(error.message)
    }
}
}