import socket
import time
import threading
import struct

# Configurar IP y puerto multicast
MULTICAST_GROUP = "224.0.0.1"
PORT = 10000

# Crear socket UDP
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
sock.bind(("", PORT))

# Unirse al grupo multicast
mreq = struct.pack("4sl", socket.inet_aton(MULTICAST_GROUP), socket.INADDR_ANY)
sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

print(f"Servidor escuchando en {MULTICAST_GROUP}:{PORT}")

# Configuración del servidor
CLIENT_PORT = 8000  # Puerto para clientes
SERVER_PORT = 9000  # Puerto para comunicación entre servidores

# Lista de direcciones IP de los servidores en la red (actualízalas con tus IPs)
SERVERS = [("10.0.11.2", SERVER_PORT), ("10.0.11.3", SERVER_PORT), ("10.0.11.4", SERVER_PORT)]

# Crear socket UDP para clientes
client_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
client_sock.bind(("0.0.0.0", CLIENT_PORT))

# Crear socket UDP para comunicación entre servidores
server_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
server_sock.bind(("0.0.0.0", SERVER_PORT))

# Obtener la dirección IP del servidor
server_ip = socket.gethostbyname(socket.gethostname())

# Variable de control para saber si el servidor principal sigue enviando heartbeats
last_heartbeat_time = time.time()
processing_request = False
principal_server_did = False

def send_heartbeats():
    """Envía señales de vida a los demás servidores mientras se procesa una solicitud."""
    global processing_request
    while True:
        if processing_request:
            for server in SERVERS:
                if server[0] != server_ip:  # No enviarse a sí mismo
                    server_sock.sendto("HEARTBEAT".encode(), server)
            time.sleep(2)
        else:
            time.sleep(1)  # Esperar antes de verificar nuevamente

def listen_for_messages():
    """Escucha mensajes de otros servidores y maneja heartbeats y confirmaciones."""
    global last_heartbeat_time, principal_server_did
    while True:
        data, addr = server_sock.recvfrom(1024)
        message = data.decode()
        if message == "HEARTBEAT":
            print(f"Heartbeat recibido de {addr}")
            last_heartbeat_time = time.time()
        elif message.startswith("SOLICITUD:"):
            parts = message.split(":")
            if len(parts) == 4:
                solicitud = parts[1]
                client_ip = parts[2]
                client_port = int(parts[3])
                print(f"Solicitud recibida de otro servidor {addr}: {solicitud} para el cliente ({client_ip}, {client_port})")
                thread = threading.Thread(target=process_request_backup, args=(solicitud, (client_ip, client_port)))
                thread.start()
        elif message == "CONFIRMACION_PROCESO":
            print(f"Confirmación de proceso recibida de {addr}")
            principal_server_did = True

def handle_client_request(data, addr):
    """Maneja la solicitud del cliente, distribuyéndola y detectando fallos en el servidor principal."""
    global processing_request, last_heartbeat_time
    
    # Extraer datos del cliente
    client_ip, client_port = addr

    # Enviar la solicitud a los otros servidores junto con la dirección del cliente
    for server in SERVERS:
        if server[0] != server_ip:
            solicitud_mensaje = f"SOLICITUD:{data.decode()}:{client_ip}:{client_port}"
            server_sock.sendto(solicitud_mensaje.encode(), server)
    
    # Iniciar procesamiento inmediato
    processing_request = True
    print(f"El servidor {server_ip} ha empezado a procesar la solicitud del cliente {addr}")
    time.sleep(20)  # Simular procesamiento
    print(f"El servidor {server_ip} ha terminado de procesar la solicitud del cliente {addr}")
    
    response = f"Hola cliente, soy el servidor {server_ip} y terminé de procesar tu solicitud"
    client_sock.sendto(response.encode(), addr)
    
    # Notificar a los otros servidores que se terminó el procesamiento
    for server in SERVERS:
        if server[0] != server_ip:
            server_sock.sendto("CONFIRMACION_PROCESO".encode(), server)
    
    processing_request = False

def process_request_backup(data, client_addr):
    """Procesa la solicitud en servidores de respaldo en caso de falla del principal y devuelve un resultado."""
    global principal_server_did
    
    print(f"Servidor en respaldo procesando solicitud: {data} para el cliente {client_addr}")
    time.sleep(20)  # Simular procesamiento en respaldo
    print(f"Servidor en respaldo finalizó el procesamiento: {data}")
    
    if principal_server_did:
        principal_server_did = False
        return
    
    # Monitorear heartbeats del servidor principal
    while True:
        time.sleep(3)
        if time.time() - last_heartbeat_time > 6:
            print(f"No se recibieron heartbeats recientes ni confirmación. Enviando respuesta al cliente {client_addr}.")
            response = f"Hola cliente, soy el servidor {server_ip} y terminé de procesar la solicitud por fallo"
            client_sock.sendto(response.encode(), client_addr)
            break


# Iniciar hilo para enviar heartbeats
heartbeat_thread = threading.Thread(target=send_heartbeats, daemon=True)
heartbeat_thread.start()

# Iniciar hilo para escuchar mensajes de otros servidores
listener_thread = threading.Thread(target=listen_for_messages, daemon=True)
listener_thread.start()

while True:
    # Recibir solicitud
    data, addr = sock.recvfrom(1024)
    message = data.decode()
    print(f"Solicitud recibida de {addr}: {message}")

    # Extraer puerto del cliente del mensaje
    try:
        client_port = int(message.split(':')[1])
        client_address = message.split(':')[0]
    except ValueError:
        print("Error: No se pudo extraer el puerto del mensaje.")
        continue

    # Responder directamente al cliente en su IP y puerto
    response = f"Confirmacion desde {server_ip}"
    sock.sendto(response.encode(), (client_address, client_port))
    print(f"Confirmación enviada a {client_address}:{client_port}")

    # Esperar respuesta del servidor
    client_sock.settimeout(5)  # Esperar hasta 5 segundos
    try:
        data, addr = client_sock.recvfrom(1024)
        print(f'Recibí confirmación de {addr}, comenzaré a procesar')
        # Manejar la solicitud en un hilo separado
        client_thread = threading.Thread(target=handle_client_request, args=(data, (client_address, client_port)))
        client_thread.start()
    except socket.timeout:
        print("No se recibió respuesta de confirmacion del cliente.")