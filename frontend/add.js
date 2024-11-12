document.getElementById("album").addEventListener("submit", (e) => {
    e.preventDefault()
    console.log(e.target.name)
    requestToServer("POST", "http://localhost:5140/api/Album", {name: e.target.name.value}, (d) => {
        console.log(d)
    }, (e) => {
        console.log(d)
    })
})

document.getElementById("author").addEventListener("submit", (e) => {
    e.preventDefault()
    console.log(e.target.name)
    requestToServer("POST", "http://localhost:5140/api/Author", {name: e.target.name.value}, (d) => {
        console.log(d)
    }, (e) => {
        console.log(d)
    })
})

document.getElementById("song").addEventListener("submit", (e) => {
    e.preventDefault()
    console.log(e.target.name)
    requestToServer("POST", "http://localhost:5140/api/Song", {name: e.target.name.value}, (d) => {
        console.log(d)
    }, (e) => {
        console.log(d)
    })
})




async function requestToServer(method, url, data, onSuccess, onError) {
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
  
      // Hacer la solicitud con fetch
      const response = await fetch(url, options);
      
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
      onError(error.message);
    }
  }
  