/* ============================================================================
   DATOS DEL VIAJE — 10 jornadas.
   Cada día y cada plan son datos puros (sin JSX ni SVG). Las ilustraciones se
   referencian por CLAVE (art/profile → ficheros en assets/svg/{landscapes,profiles})
   y los iconos por NOMBRE (icon → registro de <Icon>).
   Texto con negritas: string con <strong>, renderizado por <RichText>.
   ----------------------------------------------------------------------------
   El día 1 vive inline aquí; los días 2–10 en ./dias/dia-N.js (un fichero por
   día → más fácil de editar). Para cambiar un día, abre su fichero; sus SVG
   están en assets/svg/{landscapes,profiles}. Todos los días están portados.
   ========================================================================== */

import dia2 from './dias/dia-2.js'
import dia3 from './dias/dia-3.js'
import dia4 from './dias/dia-4.js'
import dia5 from './dias/dia-5.js'
import dia6 from './dias/dia-6.js'
import dia7 from './dias/dia-7.js'
import dia8 from './dias/dia-8.js'
import dia9 from './dias/dia-9.js'
import dia10 from './dias/dia-10.js'

const dia1 = {
    id: 'dia-1',
    num: '01',
    day: 1,
    date: 'Vie 21 ago',
    zone: 'Valle de Tena · Huesca',
    title: 'Salida de Teruel y llegada a Sallent',
    tabN: 'D01 · Vie 21',
    tabLabel: 'Sallent',
    summaryTitle: 'Sallent de Gállego',
    rest: false,
    desc: [
      'Día de transición: casi cuatro horas de coche subiendo desde Teruel hasta el corazón del Valle de Tena. La idea es llegar sin prisa, montar el campamento con luz y guardar fuerzas para lo que viene.',
      'Sallent es un buen campo base para los primeros días: pueblo con servicios, gasolinera cerca y acceso rápido a Formigal y Anayet. Nada de madrugones hoy; el viaje ya es suficiente.',
    ],
    callout: {
      eyebrow: 'Mi recomendación',
      body: 'Llega, monta y descansa. Si el cielo está limpio a última hora, no te pierdas el <strong>mirador de Lanuza</strong> (Plan C): con los reflejos del atardecer en el embalse es la mejor bienvenida posible al Pirineo.',
    },
    tips: [
      'Reposta antes de subir al valle',
      'Compra víveres en Sabiñánigo o Biescas',
      'Cena pronto para madrugar el día 2',
    ],
    gear: [
      'Documentación y reserva del camping',
      'Snacks para el coche',
      'Calzado cómodo',
      'Chaqueta ligera para la tarde',
    ],
    photo: { art: 'day-01', tag: 'Día 01', caption: 'Embalse de Lanuza · atardecer' },
    datasheet: [
      { icon: 'car', label: 'Coche · llegada', value: '≈ 3 h 45 min desde Teruel · 290 km' },
      { icon: 'car', label: 'Coche · salida', value: '0 min · duermes en Sallent de Gállego' },
      { icon: 'bed', label: 'Dónde dormir', value: 'Camping en Sallent de Gállego' },
      { icon: 'flame', label: 'Esfuerzo', rating: 1 },
      { icon: 'landscape', label: 'Paisaje', rating: 3 },
      { icon: 'waves', label: 'Baño / ibón', value: 'Embalse de Lanuza (agua fría, no apto para baño)' },
      { icon: 'parking', label: 'Parking', value: 'Fácil en el pueblo y junto al embalse' },
      { icon: 'gauge', label: 'Dificultad', value: 'Fácil' },
      { icon: 'people', label: 'Masificación', value: 'Baja–Media' },
      { icon: 'sun', label: 'Hora de salida', value: 'Tarde libre' },
      { icon: 'drop', label: 'Agua en ruta', value: 'Sí, fuentes en el pueblo' },
      { icon: 'signal', label: 'Cobertura móvil', value: 'Buena en Sallent' },
      { icon: 'calendar', label: 'Mejor época', value: 'Jun–Sep' },
      { icon: 'camera', label: 'Fotografía', value: 'Atardecer sobre el embalse de Lanuza' },
    ],
    plans: [
      {
        plan: 'A',
        type: 'Descanso · aclimatación',
        name: 'Llegar y descansar',
        desc: 'Montar el campamento con luz, ducha, cena tranquila y a la cama. Cero exigencia.',
        rate: '3.4',
        art: 'd1a',
        profile: 'd1a',
        profileDplus: '0 m D+',
        stats: [
          { icon: 'ruler', value: '0–1 km', label: 'Distancia' },
          { icon: 'trend', value: '0 m', label: 'Desnivel' },
          { icon: 'clock', value: '1 h', label: 'Tiempo' },
          { icon: 'route', value: 'Aclimatación', label: 'Tipo' },
        ],
        pros: ['Recuperas del viaje largo', 'Montas todo con luz de día', 'Cena y descanso sin agobios'],
        cons: ['Te pierdes el atardecer', 'Poco movimiento tras horas de coche'],
        when: 'Si sales tarde de Teruel o llegas cansado del volante.',
      },
      {
        plan: 'B',
        type: 'Paseo urbano · río',
        name: 'Paseo por Sallent',
        desc: 'Vuelta por el casco de Sallent y la orilla del Aguas Limpias para estirar piernas.',
        rate: '3.8',
        art: 'd1b',
        profile: 'd1b',
        profileDplus: '60 m D+',
        stats: [
          { icon: 'ruler', value: '2–3 km', label: 'Distancia' },
          { icon: 'trend', value: '60 m', label: 'Desnivel' },
          { icon: 'clock', value: '45 min', label: 'Tiempo' },
          { icon: 'route', value: 'Río', label: 'Tipo' },
        ],
        pros: ['Estiras piernas tras el coche', 'Conoces el pueblo', 'Muy fácil y accesible'],
        cons: ['Poco desnivel', 'Nada exigente'],
        when: 'Si llegas con la tarde por delante y buen tiempo.',
      },
      {
        plan: 'C',
        type: 'Ida y vuelta · foto',
        name: 'Mirador de Lanuza al atardecer',
        desc: "Corto acercamiento al embalse de Lanuza para ver el Midi d'Ossau y el pueblo reflejados al caer el sol.",
        rate: '4.5',
        art: 'd1c',
        profile: 'd1c',
        profileDplus: '120 m D+',
        stats: [
          { icon: 'ruler', value: '4 km', label: 'Distancia' },
          { icon: 'trend', value: '120 m', label: 'Desnivel' },
          { icon: 'clock', value: '1 h 15', label: 'Tiempo' },
          { icon: 'route', value: 'Foto', label: 'Tipo' },
        ],
        pros: ['Reflejos y luz de atardecer', 'Fotón sin apenas esfuerzo', 'Ambiente tranquilo'],
        cons: ['Depende de la luz y el viento', 'Trayecto en coche corto extra'],
        when: 'Si el cielo está limpio a última hora de la tarde.',
      },
      {
        plan: 'D',
        type: 'Paseo · agua',
        name: 'Embalse de La Sarra',
        desc: 'Circular junto al río Aguas Limpias por el arranque del GR-11, con desvío a la cascada de El Salto. Reconocimiento perfecto para el día 2.',
        rate: '4.0',
        art: 'd1d',
        profile: 'd1d',
        profileDplus: '200 m D+',
        stats: [
          { icon: 'ruler', value: '6–8 km', label: 'Distancia' },
          { icon: 'trend', value: '≈200 m', label: 'Desnivel' },
          { icon: 'clock', value: '2–3 h', label: 'Tiempo' },
          { icon: 'route', value: 'Circular', label: 'Tipo' },
        ],
        pros: ['Muy cerca de Sallent', 'Pozas y embalse para refrescarse', 'Sombra junto al río'],
        cons: ['El parking se llena en agosto', 'Algún tramo de pista'],
        when: 'Si llegáis a mediodía y queréis algo corto y con encanto sin coger altura.',
      },
      {
        plan: 'E',
        type: 'Ibón · pista',
        name: 'Ibón de Tramacastilla',
        desc: 'Paseo cómodo por pista de alta montaña hasta un ibón a 1.675 m rodeado de praderas. Baño asegurado el primer día.',
        rate: '3.7',
        art: 'd1e',
        profile: 'd1e',
        profileDplus: '250 m D+',
        stats: [
          { icon: 'ruler', value: '≈8 km', label: 'Distancia' },
          { icon: 'trend', value: '≈250 m', label: 'Desnivel' },
          { icon: 'clock', value: '2–3 h', label: 'Tiempo' },
          { icon: 'route', value: 'Ida y vuelta', label: 'Tipo' },
        ],
        pros: ['Ibón para bañarse asegurado', 'Apto para todos', 'Buen picnic junto al agua'],
        cons: ['Es pista, poco salvaje', 'Comparte espacio con el tren turístico'],
        when: 'Si preferís un ibón llano y seguro el primer día.',
      },
    ],
    compare: {
      caption: 'Comparativa · Día 01',
      columns: [
        { plan: 'A', name: 'Llegar y descansar' },
        { plan: 'B', name: 'Paseo por Sallent' },
        { plan: 'C', name: 'Mirador de Lanuza al atardecer' },
        { plan: 'D', name: 'Embalse de La Sarra' },
        { plan: 'E', name: 'Ibón de Tramacastilla' },
      ],
      rows: [
        { criterio: 'Paisaje', type: 'rating', values: [2, 3, 5, 3, 3] },
        { criterio: 'Esfuerzo', type: 'text', values: ['Nulo', 'Muy bajo', 'Bajo', 'Bajo', 'Bajo'] },
        { criterio: 'Tiempo', type: 'text', values: ['1 h', '45 min', '1 h 15', '2–3 h', '2–3 h'] },
        { criterio: 'Coche', type: 'text', values: ['0 min', '0 min', '10 min', '10 min', '15 min'] },
        { criterio: 'Masificación', type: 'text', values: ['Baja', 'Baja', 'Baja', 'Media', 'Media'] },
        {
          criterio: 'Baño',
          type: 'bool',
          values: [
            { ok: false, text: 'No' },
            { ok: false, text: 'No' },
            { ok: false, text: 'No' },
            { ok: true, text: 'Sí (frío)' },
            { ok: true, text: 'Sí (frío)' },
          ],
        },
        { criterio: 'Mi recomendación', type: 'reco', values: [null, null, 'Recomendado', null, null] },
      ],
    },
    nearby: {
      eyebrow: 'Cerca de aquí',
      title: 'Pueblos y paradas cerca',
      sub: 'Para la tarde de llegada o si el tiempo acompaña.',
      towns: [
        {
          name: 'Lanuza',
          meta: [{ icon: 'car', text: '5 min' }, { icon: 'clock', text: '30–45 min' }],
          desc: 'Pueblo de piedra reconstruido a orillas del embalse; casas rehabilitadas y escenario del festival Pirineos Sur. Reflejos al atardecer.',
          when: 'Atardecer',
        },
        {
          name: 'Panticosa',
          meta: [{ icon: 'car', text: '15 min' }, { icon: 'clock', text: '1–2 h' }],
          desc: 'Pueblo con encanto y balneario histórico al fondo de un circo de montañas y cascadas.',
          when: 'Tarde libre',
        },
        {
          name: 'El Pueyo de Jaca y Búbal',
          meta: [{ icon: 'car', text: '15 min' }, { icon: 'clock', text: '30 min' }],
          desc: 'Miradores del embalse de Búbal y un pueblo semiabandonado muy fotogénico junto a la carretera.',
          when: 'Foto',
        },
      ],
    },
}

export const dias = [dia1, dia2, dia3, dia4, dia5, dia6, dia7, dia8, dia9, dia10]

/* Mapa día(number) → título de resumen (reemplaza DAY_TITLES del IIFE). */
export const DAY_TITLES = Object.fromEntries(dias.map((d) => [String(d.day), d.summaryTitle]))

export const TOTAL_DIAS = dias.length
