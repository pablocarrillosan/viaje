#!/usr/bin/env node
/**
 * check-refugios.mjs — vigila plazas en varios refugios y fechas a la vez
 *
 * Sustituye a check-goriz.mjs (que solo miraba Góriz). Misma fuente de verdad:
 * la API pública que alimenta el calendario de alberguesyrefugios.com.
 *
 *   GET https://api.alberguesyrefugios.com/refugios/getAll?lang=es
 *       → catálogo; de aquí se saca el id a partir del nombre de la URL
 *         (friendlyurl: "goriz" → id 5, "linza" → …, "respomuso" → …)
 *
 *   GET https://api.alberguesyrefugios.com/refugios/get/<id>/getPlazas2/
 *       → disponibilidad por tipo de alojamiento y día:
 *         "2026-08-25": { plazasUsadas: 81, plazasDisponibles: 85, plazas: 4 }
 *
 *   plazas = plazasDisponibles − plazasUsadas = HUECOS LIBRES
 *
 * ⚠ Dos avisos importantes sobre lo que significan estos números:
 *
 *   1. "0 plazas" significa COMPLETO ONLINE, no que el refugio esté lleno. El sistema
 *      de reservas por internet maneja un cupo limitado de cada establecimiento (por eso
 *      plazasDisponibles baila de un día a otro y no coincide con el aforo). El propio
 *      calendario tiene una categoría "Sin plazas online, llama por teléfono".
 *      Antes de descartar una fecha, llama al refugio.
 *
 *   2. El campo "estado" NO indica disponibilidad y se ignora a propósito: el día de hoy
 *      sale con estado 3 teniendo plazas libres, porque no se puede reservar el mismo día.
 *
 * Uso:
 *   node check-refugios.mjs           una comprobación de todos los objetivos
 *   node check-refugios.mjs --watch   bucle cada INTERVALO_MIN minutos
 *   node check-refugios.mjs --tabla   mes completo de cada refugio vigilado
 *
 * Requiere Node 18+ (fetch nativo). Sin dependencias salvo nodemailer si usas SMTP.
 */

import { execFile } from 'node:child_process';
import { appendFile, writeFile, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  apiBase: 'https://api.alberguesyrefugios.com',
  webBase: 'https://www.alberguesyrefugios.com',
  personas: 4,
  intervaloMin: 20,
  jitterMin: 5,

  // Qué vigilar. Las fechas son las NOCHES del viaje Pirineos 2026 (21–30 ago).
  // Ajusta si cambia el itinerario.
  objetivos: [
    { refugio: 'respomuso', fechas: ['2026-08-22'],               nota: 'día 2 · subida por el Aguas Limpias' },
    { refugio: 'goriz',     fechas: ['2026-08-25'],               nota: 'día 5 · Monte Perdido' },
    { refugio: 'linza',     fechas: ['2026-08-28', '2026-08-29'], nota: 'días 8-9 · Mesa de los Tres Reyes' },
  ],

  email: {
    destinatario: 'pabloscs3@gmail.com',
    metodo: 'auto',   // 'auto' | 'mail-app' | 'smtp' | 'off'
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
const LOG = join(RAIZ, 'refugios-disponibilidad.log');
const AVISO = join(RAIZ, 'REFUGIOS-DISPONIBLE.txt');
const CACHE_IDS = join(AQUI, 'refugios-ids.json');
// Recuerda lo ya avisado para no repetir el mismo email cada 20 minutos
const VISTOS = join(AQUI, '.avisos-enviados.json');

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

const leerJson = async (ruta, porDefecto) => {
  try { return JSON.parse(await readFile(ruta, 'utf8')); } catch { return porDefecto; }
};

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
    from: `"Vigía de refugios" <${usuario}>`, to: CONFIG.email.destinatario,
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
    log(`⚠ No se pudo enviar el email (${err.message}). El aviso sigue en la notificación y en el fichero.`);
    await registrar(`aviso · email fallido: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────
const CABECERAS = {
  Accept: 'application/json',
  'Accept-Language': 'es-ES,es;q=0.9',
  Referer: `${CONFIG.webBase}/`,
  'User-Agent': 'goriz-watch/3.0 (uso personal; consulta cada 20 min)',
};

async function pedirJson(url) {
  const res = await fetch(url, { headers: CABECERAS });
  if (!res.ok) throw new Error(`${url} respondió ${res.status}`);
  return res.json();
}

/**
 * Resuelve friendlyurl → id usando el catálogo. Se cachea en disco porque los ids
 * no cambian y el catálogo completo es pesado (todos los refugios de Aragón).
 */
let catalogoEnMemoria = null;
async function idDeRefugio(friendlyurl) {
  if (!catalogoEnMemoria) catalogoEnMemoria = await leerJson(CACHE_IDS, null);

  if (catalogoEnMemoria?.[friendlyurl]) return catalogoEnMemoria[friendlyurl];

  log(`Resolviendo ids desde el catálogo…`);
  const json = await pedirJson(`${CONFIG.apiBase}/refugios/getAll?lang=es`);
  const mapa = {};
  for (const r of json?.result || []) {
    if (r.friendlyurl) mapa[r.friendlyurl] = { id: r.id, nombre: r.nombre, telefono: r.telefono || '' };
  }
  catalogoEnMemoria = mapa;
  await writeFile(CACHE_IDS, JSON.stringify(mapa, null, 2), 'utf8').catch(() => {});

  if (!mapa[friendlyurl]) throw new Error(`No encuentro el refugio "${friendlyurl}" en el catálogo`);
  return mapa[friendlyurl];
}

/** Alojamientos (tipos de plaza) de un refugio, con su disponibilidad por día. */
async function plazasDeRefugio(id) {
  const json = await pedirJson(`${CONFIG.apiBase}/refugios/get/${id}/getPlazas2/`);
  const result = json?.result;
  if (!result || typeof result !== 'object') return [];
  return Object.values(result).map((h) => ({
    id: h.id,
    nombre: h.nombre,
    maxPlazas: h.maxPlazas,
    dias: h.plazas || {},
  }));
}

/** Huecos libres. null si la API no trae ese día (fuera de temporada, sin motor…). */
function huecos(alojamiento, fecha) {
  const d = alojamiento.dias[fecha];
  if (!d) return null;
  const declarado = Number(d.plazas);
  if (Number.isFinite(declarado)) return declarado;
  return Number(d.plazasDisponibles) - Number(d.plazasUsadas);
}

// ─────────────────────────────────────────────────────────────────────────────
// MODO TABLA
// ─────────────────────────────────────────────────────────────────────────────
async function mostrarTabla() {
  for (const obj of CONFIG.objetivos) {
    const ref = await idDeRefugio(obj.refugio);
    const alojamientos = await plazasDeRefugio(ref.id);
    const meses = [...new Set(obj.fechas.map((f) => f.slice(0, 7)))];

    log(`══ ${ref.nombre} (${obj.refugio}, id ${ref.id}) · ${obj.nota || ''}`);
    if (!alojamientos.length) {
      console.log('   sin datos de reserva online — consulta con el establecimiento');
      continue;
    }

    for (const a of alojamientos) {
      console.log(`   ── ${a.nombre} (máximo ${a.maxPlazas} por reserva)`);
      const fechas = Object.keys(a.dias).filter((f) => meses.includes(f.slice(0, 7))).sort();
      for (const f of fechas) {
        const libres = huecos(a, f);
        const marca = obj.fechas.includes(f) ? '  ←' : '';
        const barra = libres > 0 ? '█'.repeat(Math.min(libres, 30)) : '·';
        console.log(`      ${f}  ${String(libres).padStart(3)}  ${barra}${marca}`);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PASADA
// ─────────────────────────────────────────────────────────────────────────────
async function unaPasada() {
  const hallazgos = [];
  const lineas = [];

  for (const obj of CONFIG.objetivos) {
    let ref;
    let alojamientos;
    try {
      ref = await idDeRefugio(obj.refugio);
      alojamientos = await plazasDeRefugio(ref.id);
    } catch (err) {
      log(`⚠ ${obj.refugio}: ${err.message}`);
      await registrar(`error · ${obj.refugio} · ${err.message}`);
      continue;
    }

    for (const fecha of obj.fechas) {
      for (const a of alojamientos) {
        const libres = huecos(a, fecha);
        if (libres === null) continue;
        lineas.push(`${ref.nombre} · ${fecha} · ${a.nombre}: ${libres}`);
        if (libres >= CONFIG.personas) {
          hallazgos.push({
            clave: `${obj.refugio}|${fecha}|${a.id}|${libres}`,
            refugio: ref.nombre,
            friendlyurl: obj.refugio,
            telefono: ref.telefono,
            fecha,
            alojamiento: a.nombre,
            libres,
          });
        }
      }
    }
    // Un respiro entre refugios: no hace falta ametrallar la API
    await sleep(800);
  }

  if (!lineas.length) {
    log('No he obtenido ninguna lectura. ¿Problema de red o cambio en la API?');
    await registrar('error · sin lecturas');
    return false;
  }

  lineas.forEach((l) => console.log(`   ${l}`));
  await registrar(lineas.join(' | '));

  if (!hallazgos.length) {
    log(`Sin sitio para ${CONFIG.personas} en ninguno de los objetivos.`);
    return false;
  }

  // No repetir el mismo aviso mientras la situación no cambie
  const vistos = new Set(await leerJson(VISTOS, []));
  const nuevos = hallazgos.filter((h) => !vistos.has(h.clave));
  if (!nuevos.length) {
    log(`Hay hueco, pero ya te avisé (${hallazgos.map((h) => `${h.friendlyurl} ${h.fecha}`).join(', ')}).`);
    return true;
  }

  const detalle = nuevos
    .map((h) => `${h.refugio} · ${h.fecha} · ${h.alojamiento}: ${h.libres} plazas`)
    .join('\n  ');

  log(`🎉 Hay sitio:\n  ${detalle}`);
  notificarMac('Refugios: hay plazas', nuevos.map((h) => `${h.refugio} ${h.fecha}: ${h.libres}`).join(' · '));
  await writeFile(AVISO, `${ahora()}\n\n${detalle}\n\nTodas las lecturas:\n${lineas.join('\n')}\n`, 'utf8');

  await enviarEmail(
    `🏔 Plazas libres: ${nuevos.map((h) => `${h.refugio} ${h.fecha}`).join(' · ')}`,
    [
      `Detectado el ${ahora()}.`,
      '',
      `Hay sitio para ${CONFIG.personas} personas en:`,
      `  ${detalle}`,
      '',
      ...nuevos.map((h) => `  ${h.refugio}: ${CONFIG.webBase}/${h.friendlyurl}/reservar${h.telefono ? ` · tel. ${h.telefono}` : ''}`),
      '',
      '— Lectura completa de esta pasada —',
      lineas.join('\n'),
      '',
      'Dato tomado de la API que alimenta el calendario oficial (plazasDisponibles − plazasUsadas).',
      'Recuerda: "0 plazas" es completo ONLINE. El cupo de internet es solo una parte del',
      'aforo, así que antes de descartar una fecha merece la pena llamar al refugio.',
    ].join('\n')
  );

  await writeFile(VISTOS, JSON.stringify([...vistos, ...nuevos.map((h) => h.clave)], null, 2), 'utf8').catch(() => {});
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
if (MODO.tabla) {
  await mostrarTabla();
} else if (MODO.watch) {
  const que = CONFIG.objetivos.map((o) => `${o.refugio} (${o.fechas.join(', ')})`).join(' · ');
  log(`Vigilando ${CONFIG.personas} plazas en: ${que}. Cada ~${CONFIG.intervaloMin} min. Ctrl+C para parar.`);
  for (;;) {
    await unaPasada();
    await sleep((CONFIG.intervaloMin + Math.random() * CONFIG.jitterMin) * 60_000);
  }
} else {
  process.exit(await unaPasada() ? 0 : 1);
}
