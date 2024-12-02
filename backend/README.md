### Informe sobre la Descripción del Backend del Proyecto Spotify

**Introducción**  
El backend del proyecto Spotify está diseñado como una Web API utilizando la tecnología .NET, siguiendo principios de arquitecturas limpias para garantizar la escalabilidad, mantenibilidad y separación de responsabilidades. A continuación, se detalla la estructura y funcionamiento del backend, sus capas, y los procesos involucrados en el manejo de los datos y archivos.

**Arquitectura del Backend**  
El sistema está compuesto por cuatro capas principales:

1. **Capa API**:  
   Esta capa se encarga de exponer los controladores que reciben y procesan las solicitudes de los clientes a través del protocolo HTTP. Su principal responsabilidad es servir como interfaz entre los usuarios y la lógica del negocio.

2. **Capa de Aplicación**:  
   En esta capa se orquesta la lógica de negocio de la aplicación. Aquí se procesan las reglas y flujos de datos que permiten la interacción entre las entidades del sistema y los servicios disponibles.

3. **Capa de Dominio**:  
   En esta capa se modelan las entidades fundamentales que representan las interacciones dentro de la aplicación. Las entidades incluyen conceptos clave como canciones, álbumes y autores, entre otros.

4. **Capa de Infraestructura**:  
   Esta capa está dedicada a la implementación de las necesidades técnicas que permiten el funcionamiento adecuado de la aplicación. Incluye la gestión de bases de datos, sistemas de almacenamiento y otras dependencias externas.

**Entidades Definidas**  
Las principales entidades del sistema son las siguientes:

- **Song (Canción)**
- **Album (Álbum)**
- **Author (Autor)**

Cada una de estas entidades dispone de un conjunto de operaciones CRUD (Crear, Leer, Actualizar, Eliminar) que permiten interactuar con ellas. Además, se incorporan filtros basados en las relaciones entre estas entidades, facilitando consultas más complejas y eficientes.

**Gestión de Archivos de Música**  
Cuando se sube un archivo de música, el sistema utiliza el sistema de archivos del servidor para almacenar los archivos. Durante este proceso, el archivo se divide en fragmentos (chunks) y se guarda la metadata relacionada con los tamaños de los fragmentos, lo que permite gestionar la recuperación de los archivos de manera eficiente. De esta manera, se garantiza que los fragmentos del archivo sean válidos y estén correctamente indexados para su posterior uso.

**Lectura Secuencial de Canciones**  
Para la lectura de canciones, se ha implementado un endpoint específico que permite leer los archivos de música de manera secuencial. Este endpoint recibe como parámetros el identificador de la canción y el índice del fragmento a leer. Esta implementación permite a los clientes reconstruir la canción a partir de los fragmentos descargados y reproducirla de forma continua.

**Conclusión**  
El diseño del backend de este proyecto se ha basado en principios de arquitectura limpia para garantizar una estructura organizada, escalable y de fácil mantenimiento. La implementación de las distintas capas permite una clara separación de responsabilidades y facilita la evolución y adaptación del sistema a futuras necesidades.