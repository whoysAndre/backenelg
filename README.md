<p align="center">
  <img
    src="https://static.vecteezy.com/system/resources/previews/003/766/730/non_2x/sales-management-word-concepts-banner-vector.jpg"
    alt="Sales Management Banner"
    style="max-width: 100%; border-radius: 12px;">
</p>

# Gestión de Inventario API

> Proyecto v1 desarrollado con **NestJS + TypeORM + PostgreSQL + Docker** que gestiona productos, variantes, clientes y ventas, implementando relaciones complejas,generación de reportes dinámicos, transacciones seguras, y como plus una IA integrada que facilita la búsqueda de datos.

---

## 🚀 Características principales

### 🔐 Autenticación & Seguridad

- ✔️ Login con **JWT**
- ✔️ Roles y protección de rutas
- ✔️ Guards, Decorators y Strategies modularizadas

### 📦 Productos & Variantes

- ✔️ CRUD completo
- ✔️ Variantes: **color**, **talla**, **stock**
- ✔️ Relación 1:N totalmente optimizada
- ✔️ Subida de imágenes con **Cloudinary**

### 💲 Ventas

- ✔️ Registro de ventas con múltiples items  
- ✔️ Actualización automática del inventario
- ✔️ Relación con clientes
- ✔️ Lógica de negocio protegida con **transacciones**

### 📊 Reportes

- ✔️ Generación de **PDF dinámicos**
- ✔️ Filtros por fechas
- ✔️ Tablas estilizadas
- ✔️ Cabeceras, logos, banners e información del sistema

### 👤 Clientes

- ✔️ CRUD completo
- ✔️ Asociación directa con ventas

### 🧹 Extras

- ✔️ **Soft Delete** (borrado lógico)
- ✔️ Arquitectura escalable tipo **DDD**
- ✔️ Código limpio y modular

---

## 🧠 Próximas características

🔜 **IA integrada** para búsqueda inteligente  
🔜 **Dockerización completa del proyecto**  

---

## 🧱 Arquitectura del Proyecto

El sistema sigue una arquitectura **modular** inspirada en el **Domain-Driven Design (DDD)**.

```bash
src/
│-- auth/
│   ├── dto/
│   ├── entities/
│   ├── decorators/
│   ├── guards/
│   ├── interfaces/
│   ├── strategies/
│   └── auth.service.ts
│-- categories/
│   ├── dto/
│   ├── entities/
│   └── category.service.ts
├── clients/
│   ├── dto/
│   ├── entities/
│   └── clients.service.ts
│-- dashboard/
│   └── dashboard.service.ts
│-- files/
│   └── files.service.ts
├── products/
│   ├── entities/
│   ├── dto/
│   └── products.service.ts
│-- reports/
│   ├── dto/
│   └── reports.service.ts
├── sales/
│   ├── dto/
│   ├── entities/
│   └── sales.service.ts
└── main.ts
```

---

## Correr el proyecto

1. Instalar Dependencias

```bash
- pnpm install
```

2. Clonar el .env.template

3. Levantar la base de datos

```bash
- docker-compose up -d
```

4. Correr el Proyecto

```bash
- pnpm run start:dev
```
