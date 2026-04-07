# Agenda App

App de agenda personal con alertas por WhatsApp. Stack: Angular 17 + Supabase (PostgreSQL) + Express + node-cron.

---

## Requisitos previos

- [Node.js](https://nodejs.org) v18 o superior
- Cuenta en [Supabase](https://supabase.com) con la tabla `events` creada (ver `supabase-schema.sql`)
- CallMeBot configurado (ver instrucciones abajo)

---

## Configurar variables de entorno

Copiá el archivo de ejemplo:

```bash
cp .env.example .env
```

Completá el `.env` con tus valores:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
CALLMEBOT_PHONE=549XXXXXXXXXX
CALLMEBOT_APIKEY=tu-api-key
CRON_SECRET=mi-agenda-secret-2024
```

---

## Ejecutar en local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Levantar todo con un solo comando

```bash
npm run dev
```

Esto levanta en paralelo:
- **Frontend Angular** → http://localhost:4200
- **Servidor de alertas (Express)** → http://localhost:3000

El frontend ya viene configurado con un proxy: todas las llamadas a `/api/*` desde Angular se redirigen automáticamente al servidor Express en el puerto 3000.

### 3. Probar las alertas

Desde la app, usá el botón **🔔 Enviar alertas** en el dashboard.

También podés llamarlo directo desde la terminal:

```bash
curl -H "Authorization: Bearer mi-agenda-secret-2024" http://localhost:3000/api/check-alerts
```

---

## Configurar CallMeBot (WhatsApp)

1. Agregá el número **+34 644 52 74 88** a tus contactos de WhatsApp
2. Mandale el mensaje: `I allow callmebot to send me messages`
3. Te responde con tu API Key — usala en `CALLMEBOT_APIKEY`

---

## Cron de alertas

El servidor corre automáticamente el cron **de lunes a viernes a las 10:00 AM hora Venezuela**. Mientras `npm run dev` esté corriendo, el cron funciona.

---

## Estructura del proyecto

```
agenda-app/
├── src/
│   ├── proxy.conf.json          # Proxy Angular → servidor Express
│   └── app/
│       ├── components/
│       │   ├── dashboard/       # Vista principal + botón de alertas
│       │   ├── event-form/      # Formulario para crear eventos
│       │   └── event-list/      # Lista de eventos
│       ├── models/              # Interfaces TypeScript
│       └── services/            # Servicio de Supabase
├── server.js                    # Servidor Express + cron de WhatsApp
├── .env                         # Variables de entorno (no se sube a Git)
├── .env.example                 # Ejemplo de variables
└── supabase-schema.sql          # SQL para crear la tabla en Supabase
```
