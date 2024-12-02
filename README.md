### Informe sobre el Proyecto *Distributed Spotify*

**Introducción**  
El proyecto *Distributed Spotify* tiene como objetivo desarrollar una versión minimalista de Spotify, centrada en la distribución eficiente de datos y la resiliencia del sistema. La aplicación está compuesta por dos componentes principales: un frontend desarrollado en **React** y un backend basado en **.NET**. A continuación, se detallan las principales características y arquitectura de cada componente, así como las decisiones técnicas que contribuyen a la escalabilidad y robustez del sistema.

**Arquitectura del Frontend**  
El frontend se construyó utilizando **React**, un marco de trabajo ampliamente utilizado para el desarrollo de interfaces de usuario interactivas y dinámicas. Durante el desarrollo, se priorizó la **modularidad** y la **reutilización de código**, lo que facilita el mantenimiento y la extensión de la aplicación en el futuro. Esto permite que las distintas funcionalidades de la interfaz de usuario sean independientes entre sí, haciendo el código más limpio y escalable.

**Arquitectura del Backend**  
El backend del proyecto se implementó siguiendo los principios de **arquitectura limpia**, un enfoque que promueve la separación de responsabilidades y facilita la evolución del sistema. En esta arquitectura, el código está dividido en capas bien definidas, lo que mejora la mantenibilidad y la flexibilidad del sistema.

**Manejo de Archivos de Música**  
En este proyecto, las canciones subidas por los usuarios se almacenan en el servidor y se recuperan de la API en fragmentos o **chunks**. Cada canción se divide en bloques más pequeños que se envían al frontend, donde son **reensamblados** para su posterior reproducción. Este enfoque tiene varias ventajas:

1. **Optimización de la transferencia de datos**: Al dividir las canciones en fragmentos, solo se descarga la porción de archivo necesaria en un momento dado, lo que reduce el uso de ancho de banda.
2. **Mejora en la resiliencia**: La capacidad de distribuir el sistema de servidores permite que el servicio sea más resistente a fallos. Si un servidor experimenta una caída, otros servidores pueden encargarse de proporcionar los fragmentos restantes, minimizando el impacto en la experiencia del usuario.