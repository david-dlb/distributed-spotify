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



while True:
    # Recibir solicitud
    data, addr = sock.recvfrom(1024)
    message = data.decode()
    # print(f"Solicitud recibida de {addr}: {message}")

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
    # print(f"Confirmación enviada a {client_address}:{client_port}")
# 
    # Esperar respuesta del servidor
    client_sock.settimeout(5)  # Esperar hasta 5 segundos