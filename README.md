# LanHua Club - Planificador de Clases (To-Do & Agenda Project)

Este proyecto forma parte del desarrollo de software del **Club Deportivo LanHua**. Se trata de una aplicación web móvil optimizada para entrenadores y administradores, permitiendo organizar la agenda de clases marciales, gestionar perfiles de usuario y sincronizar sesiones directamente con una base de datos relacional en la nube.

---

## Enlaces del Proyecto

* **Frontend (GitHub Pages):** [Ver Aplicación en Vivo](https://michaelec19.github.io/to-do-agenda/)
* **Backend API (Render):** [Servidor Activo](https://to-do-agenda.onrender.com)
* **Tablero de Trello:** [Ver tablero en Trello](https://trello.com/b/VQ7A2L54/todo-project)
* **Diseño y Wireframes (Figma):** [Ver diseño en Figma](https://www.figma.com/design/2xU7e3RuBXb6ZY3AiBdYAy/ToDo-Project?node-id=0-1&t=NImvjPQC5ANHs1et-1)

---

## Tecnologías y Herramientas Utilizadas

### Frontend:
* **HTML5** (Estructura semántica)
* **CSS / Bootstrap 5** (Estilos responsivos y componentes adaptados al Manual de Marca Lan Hua)
* **JavaScript (Vanilla)** (Lógica de vistas, consumo de API con `fetch` y manipulación del DOM)
* **SweetAlert2** (Alertas interactivas)

### Backend y Base de Datos:
* **Java 21 & Spring Boot** (Arquitectura REST API)
* **Spring Data JPA / Hibernate** (Mapeo objeto-relacional)
* **PostgreSQL (Supabase)** (Base de datos en la nube optimizada con pooler)
* **Docker** (Contenedorización para despliegue)
* **Render** (Hosting del servidor backend)

---

## Funcionalidades Principales

1. **Autenticación y Perfil de Usuario:** 
   * Sistema de inicio de sesión y registro vinculado directamente a la base de datos central de Reserve-One.
   * Gestión y actualización de perfil (nombre, apellido, correo y cambio de contraseña con validación de seguridad).
2. **Sincronización en la Nube (`/api/sessions/sync`):** 
   * Botón de sincronización interactivo que importa automáticamente las clases programadas desde la tabla principal `schedule` para los administradores/profesores (`id_rol = 1`).
3. **Gestión de Sesiones de Práctica:** 
   * Registro y control de disciplinas marciales (Wushu General, Sanda, Taolu, Tai Chi).
   * Selección de niveles (Principiante, Intermedio, Avanzado) y sedes (Laureles, Haru No Hinata, Monterrey).
   * Detección de conflictos de horario en tiempo real y selector de modalidad (Grupal o Personalizada).
4. **Validaciones e Interfaz Dinámica:** 
   * Verificación de campos obligatorios, casillas de verificación para marcar clases completadas y opciones para editar o cancelar sesiones.

---

## Credenciales de Prueba Rápida

Puedes registrar una nueva cuenta directamente en la plataforma o utilizar un usuario administrador existente para probar la sincronización de clases y la persistencia de datos en Supabase.

## Credenciales de Prueba para la Base de Datos

Puedes registrar un nuevo usuario o utilizar la cuenta de profesor configurada en la base de datos de Supabase para probar el inicio de sesión y la sincronización:

* **Correo del Profesor:** `profesor@lanhua.com` (o el usuario con rol de Administrador `id_rol = 1`)
* **Contraseña:** `123456`

> **Nota:** Al iniciar sesión con este usuario con privilegios de Administrador/Profesor, el botón de **Sincronizar** importará automáticamente las clases programadas desde la tabla central `schedule` de Reserve-One hacia tu agenda móvil.
