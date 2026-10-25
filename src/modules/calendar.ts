import { content } from "../content.ts";

export type Evento = {
  inicio: number; // epoch ms
  duracionMin: number;
  titulo: string;
  lugar: string;
};

const MINUTO_MS = 60_000;

function toUtcTimestamp(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Folds an iCalendar content line so each physical line is at most 75 UTF-8 octets.
 * Continuation lines begin with a single space, which counts toward the limit.
 * Multi-byte characters are never split.
 */
function fold(line: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(line);
  if (bytes.length <= 75) {
    return line;
  }

  const lines: string[] = [];
  let current = "";
  let currentBytes = 0;
  let isFirst = true;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    const limit = isFirst ? 75 : 74;

    if (currentBytes + charBytes > limit) {
      lines.push(isFirst ? current : ` ${current}`);
      current = char;
      currentBytes = charBytes;
      isFirst = false;
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }

  if (current !== "") {
    lines.push(isFirst ? current : ` ${current}`);
  }

  return lines.join("\r\n");
}

/**
 * Builds a deterministic RFC 5545 iCalendar string for a single event.
 * DTSTAMP equals DTSTART so the output does not depend on the system clock.
 */
export function ics(evento: Evento): string {
  const start = toUtcTimestamp(evento.inicio);
  const end = toUtcTimestamp(evento.inicio + evento.duracionMin * MINUTO_MS);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//invite-app//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${start}@invite-app`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText(evento.titulo)}`,
    `LOCATION:${escapeText(evento.lugar)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.map(fold).join("\r\n") + "\r\n";
}

/**
 * Builds a Google Calendar "add event" URL for the given event.
 */
export function googleCalendarUrl(evento: Evento): string {
  const start = toUtcTimestamp(evento.inicio);
  const end = toUtcTimestamp(evento.inicio + evento.duracionMin * MINUTO_MS);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: evento.titulo,
    dates: `${start}/${end}`,
    location: evento.lugar,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Wires the calendar buttons in the mass card.
 * Hides the button group if the mass date cannot be parsed.
 */
export function initCalendar(): void {
  const container = document.querySelector<HTMLElement>(".misa__botones");
  const primary = document.querySelector<HTMLAnchorElement>(".misa__boton:not(.misa__boton--contorno)");
  const secondary = document.querySelector<HTMLAnchorElement>(".misa__boton--contorno");

  if (!container || !primary || !secondary) {
    return;
  }

  const inicio = Date.parse(content.misa.fechaISO);
  if (Number.isNaN(inicio)) {
    container.hidden = true;
    return;
  }

  const lugar = [content.misa.lugarNombre, content.misa.lugarDireccion]
    .filter((part) => part.trim() !== "")
    .join(", ");

  const evento: Evento = {
    inicio,
    duracionMin: 60,
    titulo: content.textos.misa.calendarioTitulo,
    lugar,
  };

  const primaryText = primary.querySelector<HTMLElement>("span");
  const secondaryText = secondary.querySelector<HTMLElement>("span");

  if (primaryText) {
    primaryText.textContent = content.textos.misa.calendario;
  }
  if (secondaryText) {
    secondaryText.textContent = content.textos.misa.googleCalendar;
  }

  primary.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics(evento))}`;
  secondary.href = googleCalendarUrl(evento);
}
