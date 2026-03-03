Fase 2 – Estabilización y extensiones

- [x] features: Internacionalización (carpetas docs/es/, docs/en/, etc.) mas componente para cambiar de idioma
- [ ] features: Soporte para versionado de documentación (ej. docs/v1/, docs/v2/) mas componente para cambiar de version
- [x] features: Modo oscuro nativo – Toggle con detección de preferencia del sistema y persistencia
- [x] features: Sidebar colapsable – Permitir ocultar/mostrar la sidebar para más espacio de lectura
- [x] features: Badge "Powered by LiteDocs" – Para que los sitios puedan mostrar que usan el framework.
- [ ] features: Agregar config para cambiar el tema del resaltado de sintaxis en los snippets de codigo
- [x] features: agregar cuando una seccion es nueva y poner como bagdes New o Experimental - (Opcional): Colocar una para quitarse automaticamente cuando pasa un tiempo
- [ ] features: Múltiples layouts – Diferentes diseños para páginas de inicio, documentación, blog, etc
- [ ] features: Componente Playground (sandbox con React live)
- [ ] features: Ejemplos en vivo con CodeSandbox/Stackblitz – Botón para abrir un ejemplo en un entorno sandbox.
- [ ] features: Mejora de componentes MDX: cards, listas, alertas, tabs, badges, buttons, Admoniciones / cajas de aviso – Notas, warnings, etc
- [ ] features: Sistema de plugins (hooks en el ciclo de vida de Vite)

Fase 2.5 - Mejoras de Codigo y Rendimiento

- [ ] Metadatos Open Graph – Imagen, título y descripción por página (desde frontmatter).
- [x] Precarga de recursos – Carga inteligente de páginas vecinas para navegación instantánea.
- [x] Compresión de imágenes y assets – Automática durante el build, hacer un plan
- [x] Soporte para assets estáticos – Videos, con manejo optimizado.
- [ ] Optimizaciones de rendimiento (code splitting, lazy loading)
- [ ] Tests automatizados (Vitest + Testing Library)
- [ ] Variables de entorno – Soportar .env para personalizar builds por entorno
- [x] Bug fix: Al generar los sitemap no se agregan las rutas internacionales y coloca como ruta example.com lo cual no deberia eso tiene que ser configurable en el litedocs.config.js
- [ ] Bug fix: Al instalar la core o el frameword utilizar un preinstall para instalar la cli como bin para que pueda funcionar el comando litedocs en cualquier parte del proyecto
- [x] Separar el styles.css en varios archivos para cada componente y tener un variables.css para los estilos globales

Fase 3 – Release estable (v1.0)

- [ ] Linting de markdown – Validar links rotos, formato, etc.
- [ ] Documentación completa del framework (dogfooding)
- [ ] RSS feed – Para secciones tipo blog o changelog.
- [ ] Accesibilidad (a11y) en el tema por defecto
- [ ] Publicación estable en npm
