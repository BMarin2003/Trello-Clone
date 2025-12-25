# Trello Clone (Enterprise Edition)

> Una aplicación de gestión de proyectos estilo Kanban altamente interactiva, diseñada con **Arquitectura Hexagonal** y las mejores prácticas de **Angular 18+**.

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)

## Descripción del Proyecto

Este proyecto es una implementación robusta de un sistema de gestión de tareas centrado en la **escalabilidad** y la **experiencia de usuario (UX)**.

El objetivo principal es demostrar la implementación de patrones de diseño avanzados en el frontend, desacoplando la lógica de negocio de la interfaz de usuario mediante una arquitectura limpia.

### Características Clave (En Progreso)
* **Gestión de Tableros:** Creación, edición y eliminación de espacios de trabajo.
* **Drag & Drop Nativo:** Implementado con Angular CDK para un rendimiento fluido (60fps).
* **Arquitectura Hexagonal:**
  **Domain:** Reglas de negocio puras y Modelos (Agnóstico al framework).
  **Actions/Application:** Casos de uso (Lógica de la aplicación).
  **Infra:** Implementación de repositorios y adaptadores externos.
  **UI:** Componentes visuales organizados por Atomic Design.
* **Estado Reactivo:** Uso de Signals y RxJS para una gestión de estado predecible.

## Stack Tecnológico

| Tecnología | Propósito |
|------------|-----------|
| **Angular 18+** | Framework SPA |
| **Angular CDK** | Primitivas para Drag & Drop y Overlay |
| **Tailwind CSS** | Estilizado utilitario y responsive |
| **RxJS & Signals** | Manejo de asincronía y reactividad fina |
| **Jest / Karma** | Testing Unitario (Próximamente) |

## Instalación y Uso

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/BMarin2003/Trello-Clone.git
    cd Trello-Clone
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Ejecutar servidor de desarrollo**
    ```bash
    ng serve
    ```
    Navega a `http://localhost:4200/`.

---
Hecho ️ por [Bryan Marin Yupanqui]
