#!/usr/bin/env node
/**
 * check-goriz.mjs — vigila la disponibilidad del refugio de Góriz
 *
 * ─── La fuente de verdad ───
 *
 * El calendario de alberguesyrefugios.com se alimenta de esta API pública, que es la
 * que consulta el propio widget al cargarse (descubierta capturando su tráfico):
 *
 *   GET https://api.alberguesyrefugios.com/refugios/get/5/getPlazas2/
 *
 * Devuelve, por tipo de alojamiento y por día:
 *
 *   "2026-08-25": { "plazasUsadas": 81, "plazasDisponibles": 85, "plazas": 4,
 *                   "habitacion": 6, "estado": 1 }
 *
 *   plazas = plazasDisponibles − plazasUsadas = HUECOS LIBRES.  ← el dato que importa
 *
 * Ojo con "estado": no es fiable como indicador de disponibilidad (el día de hoy sale
 * con estado 3 y 7 plazas libres, porque no se puede reservar online el mismo día).
 * Se ignora a propósito.
 *
 * Antes esto se hacía abriendo el navegador y leyendo el color de la celda del
 * calendario. Funcionaba, pero era frágil e indirecto. Con la API sobra Chromium:
 * la comprobación es una petición HTTP, tarda milisegundos y da el número exacto.
 *
 * Uso:
 *   node check-goriz.mjs           una comprobación y sale
 *   node check-goriz.mjs --watch   bucle cada INTERVALO_MIN minutos
 *   node check-goriz.mjs --tabla   muestra un mes entero de disponibilidad
 *
 * Requiere Node 18+ (usa fetch nativo). Ya no hace falta Playwright.
 */

import { execFile } from 'node:child_process';
import { appendFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  api: 'https://api.alberguesyrefugios.com/refugios/get/5/getPlazas2/',
  web: 'https://www.alberguesyrefugios.com/goriz/reservar',
  fecha: '2026-08-25',     // noche del 25 al 26 de agosto de 2026
  personas: 4,
  intervaloMin: 20,        // la consulta es un JSON minúsculo; 20 min es razonable
  jitterMin: 5,
  pararAlEncontrar: true,

  email: {
    destinatario: 'pabloscs3@gmail.com',
    metodo: 'auto',        // 'auto' | 'mail-app' | 'smtp' | 'off'
    smtp: {
      host: process.env.GORIZ_SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.GORIZ_SMTP_PORT || 465),
      usuario: process.env.GORIZ_SMTP_USER || '',
      // Contraseña de aplicación, SOLO por variable de entorno. Nunca la escribas aquí.
      clave: process.env.GORIZ_SMTP_PASS || '',
    },
  },
};

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const LOG = join(RAIZ, 'goriz-disponibilidad.log');
const AVISO = join(RAIZ, 'GORIZ-DISPONIBLE.txt');

const args = new Set(process.argv.slice(2));
const MODO = { watch: args.has('--watch'), tabla: args.has('--tabla') };

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ahora = () => new Date().toLocaleString('es-ES', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
});

const log = (msg) => console.log(`[${ahora()}] ${msg}`);
const registrar = (linea) => appendFile(LOG, `${ahora()} · ${linea}\n`, 'utf8').catch(() => {});

function notificarMac(titulo, mensaje) {
  if (process.platform !== 'darwin') return;
  const esc = (s) => s.replace(/["\\]/g, '\\$&');
  execFile('osascript', ['-e',
    `display notification "${esc(mensaje)}" with title "${esc(titulo)}" sound name "Glass"`], () => {});
  execFile('afplay', ['/System/Library/Sounds/Hero.aiff'], () => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL
// ─────────────────────────────────────────────────────────────────────────────
async function emailPorSmtp(asunto, cuerpo) {
  const { host, port, usuario, clave } = CONFIG.email.smtp;
  if (!usuario || !clave) throw new Error('Faltan GORIZ_SMTP_USER / GORIZ_SMTP_PASS en el entorno');
  const { default: nodemailer } = await import('nodemailer');
  const transporte = nodemailer.createTransport({
    host, port, secure: port === 465, auth: { user: usuario, pass: clave },
  });
  await transporte.sendMail({
    from: `"Vigía de Góriz" <${usuario}>`, to: CONFIG.email.destinatario,
    subject: asunto, text: cuerpo,
  });
}

function emailPorMailApp(asunto, cuerpo) {
  return new Promise((resolver, rechazar) => {
    if (process.platform !== 'darwin') return rechazar(new Error('Mail.app solo existe en macOS'));
    const esc = (s) => s.replace(/["\\]/g, '\\$&').replace(/\n/g, '\\n');
    execFile('osascript', ['-e', `
      tell application "Mail"
        set nuevo to make new outgoing message with properties {subject:"${esc(asunto)}", content:"${esc(cuerpo)}", visible:false}
        tell nuevo
          make new to recipient at end of to recipients with properties {address:"${CONFIG.email.destinatario}"}
          send
        end tell
      end tell`], (err) => (err ? rechazar(err) : resolver()));
  });
}

async function enviarEmail(asunto, cuerpo) {
  const { metodo, smtp } = CONFIG.email;
  if (metodo === 'off') return;
  const usarSmtp = metodo === 'smtp' || (metodo === 'auto' && smtp.usuario && smtp.clave);
  try {
    if (usarSmtp) { await emailPorSmtp(asunto, cuerpo); log(`Email enviado por SMTP a ${CONFIG.email.destinatario}`); }
    else { await emailPorMailApp(asunto, cuerpo); log(`Email enviado por Mail.app a ${CONFIG.email.destinatario}`); }
  } catch (err) {
    log(`⚠ No se pudo enviar el email (${err.message}). El aviso sigue en la notificación y en GORIZ-DISPONIBLE.txt.`);
    await registrar(`aviso · email fallido: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSULTA
// ─────────────────────────────────────────────────────────────────────────────

/** Devuelve [{ id, nombre, maxPlazas, dias: { 'YYYY-MM-DD': {...} } }]. */
async function consultarAlojamientos() {
  const res = await fetch(CONFIG.api, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'es-ES,es;q=0.9',
      Referer: CONFIG.web,
      'User-Agent': 'goriz-watch/2.0 (uso personal; consulta cada 20 min)',
    },
  });
  if (!res.ok) throw new Error(`La API respondió ${res.status}`);

  const json = await res.json();
  const result = json?.result;
  if (!result || typeof result !== 'object') throw new Error('Respuesta de la API sin "result"');

  return Object.values(result).map((h) => ({
    id: h.id,
    nombre: h.nombre,
    maxPlazas: h.maxPlazas,
    dias: h.plazas || {},
  }));
}

/** Huecos libres de un alojamiento en una fecha. null si la API no trae ese día. */
function huecos(alojamiento, fecha) {
  const d = alojamiento.dias[fecha];
  if (!d) return null;
  // "plazas" ya viene calculado, pero lo recomprobamos por si acaso
  const calculado = Number(d.plazasDisponibles) - Number(d.plazasUsadas);
  const declarado = Number(d.plazas);
  return Number.isFinite(declarado) ? declarado : calculado;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODO TABLA
// ─────────────────────────────────────────────────────────────────────────────
async function mostrarTabla() {
  const alojamientos = await consultarAlojamientos();
  const mes = CONFIG.fecha.slice(0, 7);

  for (const a of alojamientos) {
    log(`── ${a.nombre} (id ${a.id}, máximo ${a.maxPlazas} por reserva) ──`);
    const fechas = Object.keys(a.dias).filter((f) => f.startsWith(mes)).sort();
    for (const f of fechas) {
      const libres = huecos(a, f);
      const marca = f === CONFIG.fecha ? ' ←' : '';
      const barra = libres > 0 ? '█'.repeat(Math.min(libres, 40)) : '·';
      console.log(`   ${f}  ${String(libres).padStart(3)} libres  ${barra}${marca}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PASADA
// ─────────────────────────────────────────────────────────────────────────────
async function unaPasada() {
  let alojamientos;
  try {
    alojamientos = await consultarAlojamientos();
  } catch (err) {
    log(`Error: ${err.message}`);
    await registrar(`error · ${err.message}`);
    return false;
  }

  const lecturas = alojamientos.map((a) => ({
    nombre: a.nombre,
    libres: huecos(a, CONFIG.fecha),
  }));

  const resumen = lecturas
    .map((l) => `${l.nombre}: ${l.libres === null ? 'sin dato' : `${l.libres} libres`}`)
    .join(' · ');
  await registrar(`${CONFIG.fecha} · ${resumen}`);

  const suficientes = lecturas.filter((l) => l.libres !== null && l.libres >= CONFIG.personas);

  if (suficientes.length) {
    const detalle = suficientes.map((l) => `${l.nombre}: ${l.libres} plazas`).join(' · ');
    const msg = `Góriz ${CONFIG.fecha}: ${detalle}. Reserva ya: ${CONFIG.web}`;
    log(`🎉 ${msg}`);
    notificarMac('Góriz: hay plazas', msg);
    await writeFile(AVISO, `${ahora()}\n\n${msg}\n\nTodas las lecturas:\n${resumen}\n`, 'utf8');

    await enviarEmail(
      `🏔 Góriz: ${suficientes[0].libres} plazas el ${CONFIG.fecha}`,
      [
        `Detectado el ${ahora()}.`,
        '',
        `Hay sitio para ${CONFIG.personas} personas la noche del ${CONFIG.fecha}:`,
        `  ${detalle}`,
        '',
        `Reserva: ${CONFIG.web}`,
        'Teléfono del refugio: 974 341 201 · goriz@goriz.es',
        '',
        `Lectura completa: ${resumen}`,
        '',
        'Dato tomado de la API que alimenta el calendario oficial (plazasDisponibles − plazasUsadas).',
      ].join('\n')
    );
    return true;
  }

  log(`Sin sitio para ${CONFIG.personas} el ${CONFIG.fecha} — ${resumen}`);
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
if (MODO.tabla) {
  await mostrarTabla();
} else if (MODO.watch) {
  log(`Vigilando Góriz para el ${CONFIG.fecha}, ${CONFIG.personas} personas. ` +
      `Cada ~${CONFIG.intervaloMin} min. Ctrl+C para parar.`);
  for (;;) {
    if (await unaPasada() && CONFIG.pararAlEncontrar) {
      log('Paro la vigilancia. Reserva tú desde la web.');
      break;
    }
    await sleep((CONFIG.intervaloMin + Math.random() * CONFIG.jitterMin) * 60_000);
  }
} else {
  process.exit(await unaPasada() ? 0 : 1);
}
