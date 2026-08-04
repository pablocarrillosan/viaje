# goriz-watch

Vigila la disponibilidad del **refugio de Góriz** para el **25 de agosto de 2026** (4 personas).

## Cómo funciona

No hace scraping. Consulta la misma API pública que alimenta el calendario oficial de
alberguesyrefugios.com, descubierta capturando el tráfico del propio widget:

```
GET https://api.alberguesyrefugios.com/refugios/get/5/getPlazas2/
```

Devuelve, por tipo de alojamiento y por día:

```json
"2026-08-25": { "plazasUsadas": 81, "plazasDisponibles": 85, "plazas": 4, "estado": 1 }
```

`plazas` = `plazasDisponibles − plazasUsadas` = **huecos libres**. Ese es el dato bueno.

⚠ El campo `estado` **no** indica disponibilidad y se ignora a propósito: hoy mismo sale
con `estado: 3` teniendo 7 plazas libres, porque no se puede reservar online el mismo día.

La primera versión abría un Chromium y leía el **color** de la celda del calendario
(turquesa = Abierto, naranja = Completo). Funcionaba, pero era indirecto y frágil. Con la
API sobra el navegador: la comprobación es una petición HTTP y da el número exacto.

## Instalación

Solo necesitas **Node 18 o superior** (`node -v`); usa `fetch` nativo. Si quieres enviar
el aviso por SMTP en vez de por Mail.app, `npm install` añade nodemailer.

```bash
cd ~/Proyectos/viaje/scripts/goriz-watch
node check-goriz.mjs --tabla     # ver el mes entero de un vistazo
```

## Uso

```bash
node check-goriz.mjs           # una comprobación
node check-goriz.mjs --watch    # bucle cada ~20 min, para al encontrar hueco
node check-goriz.mjs --tabla    # disponibilidad día a día del mes objetivo
```

Cuando haya sitio para las 4 personas:

- email a **pabloscs3@gmail.com**,
- notificación de macOS con sonido,
- `GORIZ-DISPONIBLE.txt` en la raíz del proyecto,
- el bucle se detiene para que reserves tú.

Cada pasada deja una línea en `goriz-disponibilidad.log`.

## El email

**Mail.app** (por defecto): si ya tienes la cuenta configurada en la app Mail de macOS no
hay nada que hacer. La primera vez macOS pedirá permiso para controlar Mail.

**SMTP de Gmail**: necesitas una contraseña de aplicación de Google. Nunca va en el código:

```bash
export GORIZ_SMTP_USER="pabloscs3@gmail.com"
export GORIZ_SMTP_PASS="xxxx xxxx xxxx xxxx"
node check-goriz.mjs --watch
```

Para desactivar el correo, pon `metodo: 'off'` en `CONFIG.email`.

## En segundo plano (launchd)

```bash
cp com.pablo.goriz-watch.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.pablo.goriz-watch.plist
```

⚠ El `.plist` apunta a `/usr/local/bin/node`. En Apple Silicon suele ser
`/opt/homebrew/bin/node`: comprueba con `which node` y ajústalo.

Para pararlo: `launchctl unload ~/Library/LaunchAgents/com.pablo.goriz-watch.plist`

## Cambiar fecha o personas

En el bloque `CONFIG` de `check-goriz.mjs`:

```js
fecha: '2026-08-25',
personas: 4,
intervaloMin: 20,
```

El `5` de la URL de la API es el id de Góriz. Otros refugios tienen otro id; se ve en
`https://api.alberguesyrefugios.com/refugios/getAll?lang=es`.

## Buen ciudadano

Una petición cada ~20 minutos, con desfase aleatorio. Es un JSON pequeño y no carga el
motor de reservas, pero no bajes de ahí: es la web de una federación pequeña.

El script **nunca** avanza el asistente de reserva. El sistema bloquea las plazas
solicitadas hasta que se paga el anticipo, así que automatizar eso le quitaría sitio a
gente real. Reservar lo haces tú.
