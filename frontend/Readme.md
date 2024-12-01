# Proyecto Distribuido Spotify

Este proyecto desarrolla una aplicación similar a Spotify con funcionalidades distribuidas, utilizando tecnologías web modernas y el framework React.js.

## Arquitectura y Tecnologías

### Plataforma
- **React**: Versión ^17.0.0
- **React Router**: Versión ^6.28.0

### Bibliotecas de UI
- **React Bootstrap**: Versión ^2.10.5
- **Bootstrap**: Versión ^5.3.3
- **SweetAlert2**: Versión ^11.14.5

### Herramienta de Construcción
- **Vite**: Versión ^1.0.0-rc.13

## Estructura del Proyecto

El proyecto está diseñado para facilitar el desarrollo y la mantenibilidad:

- Utiliza Vite como herramienta de construcción, proporcionando un reemplazo de módulos caliente y un rendimiento de construcción rápido.
- Implementa una arquitectura modular con componentes reutilizables.
- Segue las mejores prácticas de React para el manejo del estado y la gestión de efectos.

## Descripción de las Paginas

### Home
- Página inicial que muestra los álbumes populares y el menú de navegación.

### Song
- Interfaz para buscar, editar y agregar canciones.

### Album
- Vista y creación de álbumes.

### Author
- Gestión de autores y creación de nuevos artistas.

## Componentes Principales

### AudioPlayer
- Controlador visual y lógico del reproductor, implementando chunking para optimizar el streaming.

### CardAlbum
- Representación gráfica de los álbumes en formato de tarjeta.

### Filters
- Sistema de filtrado avanzado para canciones.

### Navbar
- Menú de navegación consistente en toda la aplicacion.

### Select
- Componente para paginación dinámica al hacer scroll.

### Edit
- Interfaz para editar información de canciones existentes.

### Add
- Formulario para agregar nuevas canciones al catálogo.


# Peticiones
- Para ello usamos una funcion que tiene toda la logica y el manejo de errores usando fetch requestToServer(method, url, data, onSuccess, onError) reciba el metodo, la url, los datos a enviar, una funcion para menejar cuando la peticion fue correcta y otra para manejar cuando fallo.