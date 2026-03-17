# ARQUITECTURA — Vitrina Doce de Octubre

## Repositorio del Proyecto

Repositorio público GitHub:

https://github.com/samtorres21/arquitectura.md

---

##  Descripción General

**Vitrina Doce de Octubre** es una plataforma web comunitaria diseñada para:

- Visibilizar habilidades y emprendimientos locales.
- Permitir la publicación de servicios.
- Facilitar la búsqueda de ofertas de empleo dentro del barrio Doce de Octubre.

El sistema busca fortalecer la economía local mediante tecnología accesible.

---

##  Arquitectura Seleccionada

Se decidió utilizar una **Arquitectura Monolítica**.

### Definición

Una arquitectura monolítica integra todas las funcionalidades del sistema dentro de una única aplicación desplegable.

---

### Justificación de la decisión

Se eligió arquitectura monolítica porque:

- Reduce la complejidad inicial del desarrollo.
- Facilita el aprendizaje y mantenimiento.
- Permite despliegue sencillo.
- Es ideal para proyectos pequeños y medianos.
- Menor costo de infraestructura.

---

##  Estructura Arquitectónica

arquitectura monolitica


---

##  Modelado del Sistema

El sistema se organiza en capas:

### Capa de Presentación
- Interfaces visuales.
- Formularios.
- Navegación del usuario.

### Capa de Negocio
- Validaciones.
- Gestión de usuarios.
- Publicación de emprendimientos.
- Gestión de empleos.

###  Capa de Datos
- Persistencia de información.
- Consultas a base de datos.

---

## Lógica del Sistema

Flujo básico

- Usuario accede a la plataforma.
- Realiza registro o inicio de sesión.
- Publica emprendimiento u oferta laboral.
- El sistema valida la información.
- Los datos se almacenan en la base de datos.
- Otros usuarios pueden visualizar la información.

## 🗄️ Modelado de Datos (Diagrama Entidad-Relación)

```mermaid
erDiagram

    USUARIO ||--o{ EMPRENDIMIENTO : publica
    USUARIO ||--o{ OFERTA_EMPLEO : crea

    USUARIO {
        int id
        string nombre
        string correo
        string contrasena
        string rol
    }

    EMPRENDIMIENTO {
        int id
        string nombre
        string descripcion
        string categoria
        string contacto
        string imagen
        int usuario_id
    }

    OFERTA_EMPLEO {
        int id
        string titulo
        string descripcion
        string tipo_empleo
        string contacto
        date fecha_publicacion
        int usuario_id
    }



  


