import { content } from "../content.ts";

export type EstadoCuenta = {
  tipo: "cuenta";
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
};

export type EstadoHoy = { tipo: "hoy" };
export type EstadoGracias = { tipo: "gracias" };
export type Estado = EstadoCuenta | EstadoHoy | EstadoGracias;

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

/**
 * Pure state machine for the countdown around a single event start.
 *
 * @param ahora - Current epoch milliseconds.
 * @param inicio - Event start epoch milliseconds.
 * @returns The current countdown state.
 */
export function estado(ahora: number, inicio: number): Estado {
  if (ahora < inicio) {
    const restoMs = inicio - ahora;
    const totalSegundos = Math.floor(restoMs / 1000);

    const dias = Math.floor(totalSegundos / 86_400);
    const horas = Math.floor((totalSegundos % 86_400) / 3_600);
    const minutos = Math.floor((totalSegundos % 3_600) / 60);
    const segundos = totalSegundos % 60;

    return { tipo: "cuenta", dias, horas, minutos, segundos };
  }

  if (ahora < inicio + THREE_HOURS_MS) {
    return { tipo: "hoy" };
  }

  return { tipo: "gracias" };
}

/**
 * Wires the countdown UI in the mass card and updates it every second.
 * Stops ticking once the event is over (`gracias` state).
 */
export function initCountdown(): void {
  const cuenta = document.querySelector<HTMLElement>(".misa__cuenta");
  const celdas = document.querySelectorAll<HTMLElement>(".misa__cuenta-celda");
  const numeros = document.querySelectorAll<HTMLElement>(".misa__cuenta-numero");
  const etiquetas = document.querySelectorAll<HTMLElement>(".misa__cuenta-etiqueta");
  const mensaje = document.querySelector<HTMLElement>(".misa__cuenta-mensaje");

  if (!cuenta || celdas.length !== 4 || numeros.length !== 4 || etiquetas.length !== 4 || !mensaje) {
    return;
  }

  const messageEl = mensaje;

  const labelTexts = [
    content.textos.misa.dias,
    content.textos.misa.horas,
    content.textos.misa.minutos,
    content.textos.misa.segundos,
  ];

  etiquetas.forEach((etiqueta, index) => {
    etiqueta.textContent = labelTexts[index] ?? "";
  });

  const inicio = Date.parse(content.misa.fechaISO);
  if (Number.isNaN(inicio)) {
    return;
  }

  function render(state: Estado): void {
    if (state.tipo === "cuenta") {
      celdas.forEach((celda) => {
        celda.hidden = false;
      });
      messageEl.hidden = true;

      numeros[0].textContent = String(state.dias);
      numeros[1].textContent = String(state.horas);
      numeros[2].textContent = String(state.minutos);
      numeros[3].textContent = String(state.segundos);
      return;
    }

    celdas.forEach((celda) => {
      celda.hidden = true;
    });
    messageEl.hidden = false;
    messageEl.textContent = state.tipo === "hoy"
      ? content.textos.misa.hoy
      : content.textos.misa.gracias;
  }

  function tick(): void {
    const state = estado(Date.now(), inicio);
    render(state);

    if (state.tipo === "gracias") {
      clearInterval(interval);
    }
  }

  tick();
  const interval = setInterval(tick, 1000);
}
