# Instrucciones para función de búsqueda (con índice JSON)

1) **Generar/Actualizar índice**
   - Ejecutar desde la raíz del proyecto el script correspondiente:
     node tools\generate_index.js
   - Se generará (o actualizará) `knacks-index.json` con títulos y extractos de cada knack.

2) **Uso en navegador**
   - Abrir `index.html` y escribir en el cuadro de búsqueda en el panel izquierdo.
   - La búsqueda es case-insensitive y normaliza acentos ("`a`" = "`á`").

3) **Notas técnicas**
   - El índice contiene la clave `text` con extracto del contenido (hasta 2000 caracteres) para acelerar la búsqueda.
   - Al añadir o modificar knacks, volver a ejecutar el script.
