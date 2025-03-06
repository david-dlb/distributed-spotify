import socket


def write_simple(file, value):
    try: 
        with open(file, 'w') as file:
            file.write(value)
        return value
    except Exception as e:
        print(f"Error al leer o procesar el archivo: {str(e)}")
        return []
    
def read(filename):
    try:
        with open(filename, 'r') as file:
            content = file.read()
        return content
    except Exception as e:
        print(f"Error al leer o procesar el archivo: {str(e)}")
        return ""

def write(filename, value):
    try:
        with open(filename, 'r') as file:
            content = file.read()
        
        parts = content.split('"')
        
        # Eliminar elementos vacíos (si hay)
        parts = [parte for parte in parts if parte.strip()]
        
        parts[1] = "http://" + value[0]
        text = ''

        for i in range(len(parts)):
            if i == len(parts) - 1:
                text += parts[i]
                continue
            text += parts[i] + "\""

        with open(filename, 'w') as file:
            file.write(text)
        return text
    
    except Exception as e:
        print(f"Error al leer o procesar el archivo: {str(e)}")
        return []

# Configurar la IP y puerto del servidor multicast
MULTICAST_GROUP = "224.0.0.1"
MULTICAST_PORT = 10000

# Dirección y puerto donde el cliente escuchará la respuesta
CLIENT_PORT = 8080  # Puerto donde recibirá la respuesta

# Obtener la dirección IP del cliente
sock_temp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock_temp.connect(("8.8.8.8", 80))  # Conexión a un servidor externo para obtener la IP local
CLIENT_IP = sock_temp.getsockname()[0]
sock_temp.close()
# No lo necesitas porque sabes que esta en el localhost
# write_simple("server/ip.txt", "http://" + CLIENT_IP)

# Crear socket UDP para enviar solicitud
sock_send = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
sock_send.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

# Crear socket UDP para recibir respuesta
sock_recv = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock_recv.bind((CLIENT_IP, CLIENT_PORT))

while True:
    # Enviar mensaje multicast con IP y puerto del cliente
    message = f"{CLIENT_IP}:{CLIENT_PORT}"  # Enviar IP y puerto
    sock_send.sendto(message.encode(), (MULTICAST_GROUP, MULTICAST_PORT))
    # print(f"Mensaje enviado a {MULTICAST_GROUP}:{MULTICAST_PORT}, esperando respuesta en {CLIENT_IP}:{CLIENT_PORT}")

    # Esperar respuesta del servidor
    sock_recv.settimeout(5)  # Esperar hasta 5 segundos
    try:
        response, server_addr = sock_recv.recvfrom(1024)
        # print(f"Respuesta del servidor {server_addr}: {response.decode()}")
        # write('public/config.js', server_addr)
        write_simple("ts-proxy/url.txt", "http://" + server_addr[0] + ":" + read("ts-proxy/port.txt"))
    except socket.timeout:
        print("No se recibió respuesta del servidor.")


# Cerrar sockets
sock_send.close()
sock_recv.close()
