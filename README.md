# Shop Sale API

> Proyecto v1 desarrollado con **NestJS + TypeORM + PostgreSQL** que gestiona productos, variantes, clientes y ventas, implementando relaciones complejas, transacciones seguras y como plus una IA integrada que facilita la búsqueda de datos.

---

## 🚀 Características principales

✅ Autenticación completa con **JWT y roles**
✅ CRUD completo de **productos** con variantes (color, talla, stock)
✅ Uso de servicio de cloudinary integrado para el almacenamiento de imágenes
✅ Módulo de **ventas** con detalles e impacto automático en el inventario  
✅ **Transacciones** con `QueryRunner` para consistencia de datos  
✅ **Clientes** asociados a ventas  
✅ **Soft Delete** (borrado lógico)  

---

## Características a implementar

❗**Implementación de IA**
❗**Desliegue completo dockerizando**

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
├── products/
│   ├── entities/
│   ├── dto/
│   └── products.service.ts
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
