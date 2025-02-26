import http from 'http';
import httpProxy from 'http-proxy';
import dgram from 'dgram'; // Para comunicación UDP (Multicast)

let targetHosts = []; // Lista de servidores backend
const targetPort = 6000;
const multicastAddress = '224.0.0.1'; // Dirección Multicast
const multicastPort = 10000; // Puerto Multicast
const localPort = 8001; // Puerto para recibir confirmaciones

const proxy = httpProxy.createProxyServer({});
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
    const urlF = "http://localhost:6002/api" + url 
    // Hacer la solicitud con fetch
    console.log(urlF)
    const response = await fetch(urlF, options);
    console.log(response)
    // Intentar convertir la respuesta a JSON
    const result = await response.json();
    // Comprobar si la respuesta fue exitosa
    console.log(result)
    if (!response.ok) {
      console.log(result) 
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    
    // Llamar a la función de éxito pasando el resultado
    onSuccess(result);
  } catch (error) {
    // Llamar a la función de error pasando el mensaje de error
    console.log(1) 
    onError(error.message);
  }
}
 


const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir CORS
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  console.log(`\n\n*********************************************************\n`);
  console.log(`Solicitud capturada por el proxy: ${req.url}`);

  let servers_count1 = req.url === '/appSolution/solution/' ? 3 : 1;
   const clientIp = process.env.CONTAINER_IP || '0.0.0.0';
  try {
 

    let responded = false; // Variable para saber si ya respondimos
    // await requestToServer("GET", `/Album?limit=10`, null, (d) => {
    //   console.log("S", d)
    //   res.writeHead(200, { 'Content-Type': 'text/plain' });
    //   res.end('funciono');
    // }, (e) => {
    //   console.log("e", e)
    //   res.writeHead(500, { 'Content-Type': 'text/plain' });
    //   res.end('NO funciono');
    // })
    console.log({
      hostname: "http://10.0.11.2",
          port: targetPort,
          path: req.url,
          method: req.method,
          headers: req.headers,
    })
      const proxyReq = http.request(
        {
          hostname: "http://localhost",
          port: 6002,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (proxyRes) => {
          if (responded) return; // Si ya respondimos, ignoramos las demás respuestas
          console.log(proxyRes)
          let responseData = '';
    
          proxyRes.on('data', (chunk) => {
            responseData += chunk; // Acumular datos de la respuesta
          });
    
          proxyRes.on('end', () => {
            if (responded) return;
            responded = true; // Marcar que ya respondimos
    
            console.log(`✅ Respuesta desde ${host}: ${responseData}`); // Loggear la respuesta
    
            res.writeHead(proxyRes.statusCode, proxyRes.headers); // Enviar headers originales
            res.end(responseData); // Enviar respuesta al cliente
          });
        }
      );
    
      proxyReq.on('error', (err) => {
        console.error(`❌ Error al reenviar la solicitud a ${"http://10.0.11.2"}:${targetPort}`, err);
      });
    
      req.pipe(proxyReq); // Enviar la solicitud al backend
    

     
  } catch (error) {
    console.error('❌ Error en la comunicación multicast:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error en la comunicación multicast.');
  }
});

server.listen(8000, () => {
  console.log(`Proxy server escuchando en http://localhost:8000`);
});
