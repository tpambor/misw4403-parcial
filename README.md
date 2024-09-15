# Parcial MISW4403 - Diseño y construcción de APIs
**Ciclo:** 2024-14  
**Desarrollado por:** Tim Ulf Pambor  
**Repositorio**: https://github.com/tpambor/misw4403-parcial  
**Reporte de sonarqube:** https://sonarcloud.io/summary/overall?id=tpambor_misw4403-parcial  
**Versión de Node.js utilizada:** v20.17.0  
**Versión de npm utilizada:** 10.8.2

# Ejectuar la aplicación
1. Clonar este repositorio
2. Instalar dependencias con `npm install`

## Opción 1: Docker Compose
1. Crear el contendor y el entorno con `docker compose build`
2. Ejecutar el API con `docker compose up`

## Opción 2: Local
Antes de iniciar la aplicación, configura la variable de entorno `DATABASE_URL` con la URL correcta para acceder a la base de datos.

- Para PostgreSQL, una URL típica se ve así: `postgres://nest:nestpw@127.0.0.1:5432/nest`. Se puede crear una instancia de PostgreSQL con docker con:
```
docker run --rm -it -p 5432:5432 -e POSTGRES_USER=nest -e POSTGRES_PASSWORD=nestpw -e POSTGRES_DB=nest postgres
```
- Para SQLite (ideal para desarrollo y pruebas), se puede usar una URL como esta: `sqlite://db.sqlite`

En sistemas Unix se puede configurar la variable de entorno con:
```sh
export DATABASE_URL="sqlite://db.sqlite"
```

En sistemas Windows con CMD:
```sh
set DATABASE_URL="sqlite://db.sqlite"
```
o con Powershell:
```sh
$env:DATABASE_URL = 'sqlite://db.sqlite'
```

Una vez configurada la variable de entorno, se puede ejecutar la aplicación utilizando el comando:
```sh
npm run start
```

# Ejecutar pruebas unitarias
Las pruebas unitarias se pueden ejecutar con:
```sh
npm run test:cov
```

# Ejectuar pruebas de postman
Antes de iniciar las pruebas de postman, es necesario ejectuar la aplicación. 

## Opción 1: Con Postman UI
Las pruebas de postman se pueden ejecutar importando las colecciones en la carpeta "collections" y definiendo un entorno con la variable `baseURL` con el valor `http://localhost:3000/api/v1`.

## Opción 2: Con npm
Las pruebas de postman también se pueden ejecutar con el comando:
```sh
npm run test:postman
```
