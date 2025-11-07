# Shop Sale API

> Proyecto v1 desarrollado con **NestJS + TypeORM + PostgreSQL** que gestiona productos, variantes, clientes y ventas, implementando relaciones complejas y transacciones seguras.

---

## 🚀 Características principales

✅ CRUD completo de **productos** con variantes (color, talla, stock)  
✅ Módulo de **ventas** con detalles e impacto automático en el inventario  
✅ **Transacciones** con `QueryRunner` para consistencia de datos  
✅ **Clientes** asociados a ventas  
✅ **Soft Delete** (borrado lógico)  
✅ Listo para integrar **autenticación con JWT y roles**

---

## Características a implementar

❗**Autenticación con JWT Y roles**
❗**Implementación de IA**
❗**Desliegue completo dockerizando**

---

## 🧱 Arquitectura del Proyecto

El sistema sigue una arquitectura **modular** inspirada en el **Domain-Driven Design (DDD)**.

```bash
src/
|-- categories/
|   ├── dto/
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
