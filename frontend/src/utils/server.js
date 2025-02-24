import { handleErrorWithSweetAlert } from "./alert";

export async function requestToServer(method, url, data, onSuccess, onError) {
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (data && (method !== 'GET' || method != "DELETE")) {
        options.body = JSON.stringify(data);
      }

      const urlF = window.env.URL + url 
      
      // Configurar un timeout de 5 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(urlF, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(result)
        handleErrorWithSweetAlert(result.title)
        throw new Error(`Error en la solicitud: ${response.status}`);
      }

      const result = await response.json();

      onSuccess(result);
      return; // Salir del bucle si la solicitud es exitosa
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('La solicitud ha sido abortada por timeout');
        retries++;
        if (retries >= MAX_RETRIES) {
          onError(`No se pudo completar la solicitud después de ${MAX_RETRIES} intentos`);
          return;
        }
        console.log(`Intentando nuevamente... Intento #${retries + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo antes del próximo intento
      } else {
        handleErrorWithSweetAlert(error.message);
        retries++;
        if (retries >= MAX_RETRIES) {
          onError(`No se pudo completar la solicitud después de ${MAX_RETRIES} intentos`);
          return;
        }
        console.log(`Intentando nuevamente... Intento #${retries + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo antes del próximo intento
      }
    }
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
