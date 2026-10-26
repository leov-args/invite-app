import { content } from "../content.ts";

/**
 * Validates RSVP form data.
 * Returns an object whose keys are the failing field names and whose values
 * are the translation keys for the corresponding error messages.
 */
export function validarRsvp(datos: {
  nombre: unknown;
  personas: unknown;
  mensaje: unknown;
}): { nombre?: string; personas?: string; mensaje?: string } {
  const errores: { nombre?: string; personas?: string; mensaje?: string } = {};
  const nombre = String(datos.nombre ?? "").trim();
  if (nombre.length < 2 || nombre.length > 80) {
    errores.nombre = "errorNombre";
  }

  const personas = Number(datos.personas);
  if (!Number.isInteger(personas) || personas < 1 || personas > 10) {
    errores.personas = "errorPersonas";
  }

  const mensaje = String(datos.mensaje ?? "").trim();
  if (mensaje.length > 500) {
    errores.mensaje = "errorMensaje";
  }

  return errores;
}

const STORAGE_KEY = "invite-app:rsvp";

export type StoredConfirmation = {
  nombre: string;
  personas: number;
  fecha: string;
};

/**
 * Reads the stored RSVP confirmation from the provided storage object.
 * Returns null when the key is missing, the storage throws, the JSON is
 * invalid, or the stored shape does not match the expected contract.
 */
export function leerConfirmacion(
  storage: Pick<Storage, "getItem" | "setItem">,
): StoredConfirmation | null {
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (parsed === null || typeof parsed !== "object") return null;
  const record = parsed as Record<string, unknown>;

  if (typeof record.nombre !== "string" || record.nombre.trim() === "") {
    return null;
  }
  if (typeof record.fecha !== "string" || record.fecha.trim() === "") {
    return null;
  }
  if (
    !Number.isInteger(record.personas) ||
    (record.personas as number) < 1 ||
    (record.personas as number) > 10
  ) {
    return null;
  }

  return {
    nombre: record.nombre.trim(),
    personas: record.personas as number,
    fecha: record.fecha,
  };
}

/**
 * Saves the RSVP confirmation to the provided storage object. Never throws:
 * failures such as Safari private mode are silently ignored.
 */
export function guardarConfirmacion(
  storage: Pick<Storage, "getItem" | "setItem">,
  datos: StoredConfirmation,
): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(datos));
  } catch {
    // Ignore storage errors.
  }
}

type RsvpState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "error" }
  | { status: "success"; nombre: string };

type RsvpElements = {
  dialog: HTMLDialogElement;
  closeButton: HTMLButtonElement;
  form: HTMLFormElement;
  nameInput: HTMLInputElement;
  peopleSelect: HTMLSelectElement;
  messageInput: HTMLTextAreaElement;
  submitButton: HTMLButtonElement;
  submitText: HTMLElement;
  spinner: HTMLElement;
  nameError: HTMLElement;
  peopleError: HTMLElement;
  messageError: HTMLElement;
  status: HTMLElement;
  successView: HTMLElement;
  thanks: HTMLElement;
  closeSuccessButton: HTMLButtonElement;
  text: HTMLElement;
  openButton: HTMLButtonElement;
  confirmedText: HTMLElement;
  anotherButton: HTMLButtonElement;
};

let elements: RsvpElements | null = null;
let opener: HTMLElement | null = null;
let currentState: RsvpState = { status: "idle" };
let storedConfirmation: { nombre: string; personas: number } | null = null;
let shareButton: HTMLButtonElement | null = null;
let shareNotice: HTMLElement | null = null;
let shareNoticeTimer: ReturnType<typeof setTimeout> | null = null;

function $(selector: string, context: ParentNode = document): HTMLElement | null {
  return context.querySelector(selector);
}

function send(endpoint: string, body: string, signal: AbortSignal): Promise<Response> {
  return fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body,
    signal,
  });
}

function setError(field: "nombre" | "personas" | "mensaje", key: string | undefined): void {
  if (!elements) return;

  const map = {
    nombre: { input: elements.nameInput, error: elements.nameError },
    personas: { input: elements.peopleSelect, error: elements.peopleError },
    mensaje: { input: elements.messageInput, error: elements.messageError },
  };
  const { input, error } = map[field];

  if (key) {
    error.textContent = content.textos.rsvp[key as keyof typeof content.textos.rsvp] as string;
    input.setAttribute("aria-invalid", "true");
  } else {
    error.textContent = "";
    input.removeAttribute("aria-invalid");
  }
}

function clearAllErrors(): void {
  setError("nombre", undefined);
  setError("personas", undefined);
  setError("mensaje", undefined);
}

function renderState(): void {
  if (!elements) return;

  if (currentState.status === "sending") {
    elements.submitButton.disabled = true;
    elements.spinner.hidden = false;
    elements.submitText.textContent = content.textos.rsvp.enviando;
    elements.status.textContent = content.textos.rsvp.enviando;
  } else if (currentState.status === "error") {
    elements.submitButton.disabled = false;
    elements.spinner.hidden = true;
    elements.submitText.textContent = content.textos.rsvp.enviar;
    elements.status.textContent = content.textos.rsvp.error;
  } else if (currentState.status === "success") {
    elements.submitButton.disabled = true;
    elements.spinner.hidden = true;
    elements.submitText.textContent = content.textos.rsvp.enviar;
    elements.status.textContent = "";
    elements.form.classList.add("is-oculto");
    elements.successView.classList.add("is-visible");
    const name = currentState.nombre;
    elements.thanks.textContent = content.textos.rsvp.gracias.replace("{nombre}", name);
    requestAnimationFrame(() => {
      elements?.closeSuccessButton.focus();
    });
  } else {
    elements.submitButton.disabled = false;
    elements.spinner.hidden = true;
    elements.submitText.textContent = content.textos.rsvp.enviar;
    elements.status.textContent = "";
    elements.form.classList.remove("is-oculto");
    elements.successView.classList.remove("is-visible");
  }
}

function resetForm(): void {
  if (!elements) return;
  elements.form.reset();
  clearAllErrors();
  currentState = { status: "idle" };
  renderState();
}

function isFocusable(el: HTMLElement | null): el is HTMLElement {
  return el !== null && el.isConnected && !el.hidden && el.closest("[hidden]") === null;
}

function renderCardState(): void {
  if (!elements) return;
  const texts = content.textos.rsvp;

  if (storedConfirmation) {
    elements.confirmedText.textContent = texts.yaConfirmaste
      .replace("{nombre}", storedConfirmation.nombre)
      .replace("{personas}", String(storedConfirmation.personas));
    elements.confirmedText.hidden = false;
    elements.anotherButton.hidden = false;
    elements.text.hidden = true;
    elements.openButton.hidden = true;
  } else {
    elements.confirmedText.hidden = true;
    elements.anotherButton.hidden = true;
    elements.text.hidden = false;
    elements.openButton.hidden = false;
  }
}

function showShareNotice(message: string): void {
  if (!shareNotice) return;
  shareNotice.textContent = message;
  shareNotice.classList.add("rsvp__aviso--visible");
  if (shareNoticeTimer !== null) {
    clearTimeout(shareNoticeTimer);
  }
  shareNoticeTimer = setTimeout(() => {
    shareNotice?.classList.remove("rsvp__aviso--visible");
    shareNoticeTimer = null;
  }, 2500);
}

async function handleSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (!elements || currentState.status === "sending") return;

  const formData = new FormData(elements.form);
  const nombre = String(formData.get("nombre") ?? "");
  const personasRaw = String(formData.get("personas") ?? "1");
  const mensaje = String(formData.get("mensaje") ?? "");
  const botcheck = formData.get("botcheck") === "on";

  const errores = validarRsvp({ nombre, personas: Number(personasRaw), mensaje });

  clearAllErrors();

  const firstInvalid: ("nombre" | "personas" | "mensaje")[] = ["nombre", "personas", "mensaje"];
  let focused = false;
  for (const field of firstInvalid) {
    if (errores[field]) {
      setError(field, errores[field]);
      if (!focused) {
        const input = field === "nombre"
          ? elements.nameInput
          : field === "personas"
            ? elements.peopleSelect
            : elements.messageInput;
        input.focus();
        focused = true;
      }
    }
  }

  if (Object.keys(errores).length > 0) return;

  currentState = { status: "sending" };
  renderState();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await send(
      content.rsvp.endpoint,
      JSON.stringify({ nombre: nombre.trim(), personas: Number(personasRaw), mensaje: mensaje.trim(), botcheck }),
      controller.signal,
    );

    const data = (await response.json()) as { ok?: boolean };
    if (data.ok === true) {
      const nombreLimpio = nombre.trim();
      const personas = Number(personasRaw);
      const fecha = new Date().toISOString();
      currentState = { status: "success", nombre: nombreLimpio };
      storedConfirmation = { nombre: nombreLimpio, personas };
      try {
        guardarConfirmacion(window.localStorage, { nombre: nombreLimpio, personas, fecha });
      } catch {
        // Accessing window.localStorage can throw; a failure is silently ignored.
      }
      renderCardState();
    } else {
      currentState = { status: "error" };
    }
  } catch {
    currentState = { status: "error" };
  } finally {
    clearTimeout(timeoutId);
  }

  renderState();
}

function attachInputListeners(): void {
  if (!elements) return;

  elements.nameInput.addEventListener("input", () => {
    if (elements?.nameInput.getAttribute("aria-invalid") === "true") {
      setError("nombre", undefined);
    }
  });

  elements.peopleSelect.addEventListener("change", () => {
    if (elements?.peopleSelect.getAttribute("aria-invalid") === "true") {
      setError("personas", undefined);
    }
  });

  elements.messageInput.addEventListener("input", () => {
    if (elements?.messageInput.getAttribute("aria-invalid") === "true") {
      setError("mensaje", undefined);
    }
  });
}

export function abrirRsvp(trigger?: HTMLElement): void {
  if (!elements) return;

  opener = trigger ?? null;
  elements.dialog.showModal();
  if (currentState.status !== "success") {
    elements.nameInput.focus();
  } else {
    requestAnimationFrame(() => {
      elements?.closeSuccessButton.focus();
    });
  }
}

export function initRsvp(): void {
  const endpoint = content.rsvp.endpoint.trim();
  const section = $(".rsvp") as HTMLElement | null;
  const dialog = $(".rsvp-dialogo") as HTMLDialogElement | null;

  if (!section || !dialog) return;

  section.hidden = endpoint === "";
  if (endpoint === "") return;

  const label = $(".rsvp__etiqueta", section) as HTMLElement | null;
  const text = $(".rsvp__texto", section) as HTMLElement | null;
  const confirmedText = $(".rsvp__confirmado", section) as HTMLElement | null;
  const anotherButton = $(".rsvp__otra", section) as HTMLButtonElement | null;
  const deadline = $(".rsvp__fecha-limite", section) as HTMLElement | null;
  const openButton = $(".rsvp__confirmar", section) as HTMLButtonElement | null;

  shareButton = $(".rsvp__compartir", section) as HTMLButtonElement | null;
  shareNotice = $(".rsvp__aviso", section) as HTMLElement | null;

  const title = $(".rsvp-dialogo__titulo", dialog) as HTMLElement | null;
  const closeButton = $(".rsvp-dialogo__cerrar", dialog) as HTMLButtonElement | null;
  const form = $(".rsvp-dialogo__form", dialog) as HTMLFormElement | null;
  const nameInput = $("#rsvp-nombre", dialog) as HTMLInputElement | null;
  const peopleSelect = $("#rsvp-personas", dialog) as HTMLSelectElement | null;
  const messageInput = $("#rsvp-mensaje", dialog) as HTMLTextAreaElement | null;
  const submitButton = $(".rsvp-dialogo__enviar", dialog) as HTMLButtonElement | null;
  const submitText = $(".rsvp-dialogo__enviar-texto", dialog) as HTMLElement | null;
  const spinner = $(".rsvp-dialogo__spinner", dialog) as HTMLElement | null;
  const nameError = $("#rsvp-nombre-error", dialog) as HTMLElement | null;
  const peopleError = $("#rsvp-personas-error", dialog) as HTMLElement | null;
  const messageError = $("#rsvp-mensaje-error", dialog) as HTMLElement | null;
  const status = $(".rsvp-dialogo__estado", dialog) as HTMLElement | null;
  const successView = $(".rsvp-dialogo__exito", dialog) as HTMLElement | null;
  const thanks = $(".rsvp-dialogo__gracias", dialog) as HTMLElement | null;
  const closeSuccessButton = $(".rsvp-dialogo__cerrar-exito", dialog) as HTMLButtonElement | null;

  const nameLabel = $("label[for='rsvp-nombre']", dialog) as HTMLElement | null;
  const peopleLabel = $("label[for='rsvp-personas']", dialog) as HTMLElement | null;
  const messageLabelMain = $(".rsvp-dialogo__mensaje-label", dialog) as HTMLElement | null;
  const messageLabelOptional = $(".rsvp-dialogo__opcional", dialog) as HTMLElement | null;
  const peopleHelp = $("#rsvp-personas-ayuda", dialog) as HTMLElement | null;

  if (
    !label || !text || !confirmedText || !anotherButton || !deadline || !openButton ||
    !title || !closeButton || !form || !nameInput ||
    !peopleSelect || !messageInput || !submitButton ||
    !submitText || !spinner || !nameError || !peopleError || !messageError ||
    !status || !successView || !thanks || !closeSuccessButton ||
    !nameLabel || !peopleLabel || !messageLabelMain || !messageLabelOptional || !peopleHelp
  ) {
    return;
  }

  elements = {
    dialog,
    closeButton,
    form,
    nameInput,
    peopleSelect,
    messageInput,
    submitButton,
    submitText,
    spinner,
    nameError,
    peopleError,
    messageError,
    status,
    successView,
    thanks,
    closeSuccessButton,
    text,
    openButton,
    confirmedText,
    anotherButton,
  };

  try {
    const saved = leerConfirmacion(window.localStorage);
    if (saved) {
      storedConfirmation = { nombre: saved.nombre, personas: saved.personas };
    }
  } catch {
    storedConfirmation = null;
  }
  renderCardState();

  const texts = content.textos.rsvp;
  label.textContent = texts.etiqueta;
  text.textContent = texts.texto;
  openButton.querySelector("span")!.textContent = texts.confirmar;
  anotherButton.querySelector("span")!.textContent = texts.otraPersona;
  if (shareButton) {
    shareButton.querySelector("span")!.textContent = texts.compartir;
  }

  const deadlineText = content.rsvp.fechaLimiteTexto.trim();
  if (deadlineText) {
    deadline.textContent = deadlineText;
    deadline.hidden = false;
  }

  title.textContent = texts.titulo;
  nameLabel.textContent = texts.nombre;
  peopleLabel.textContent = texts.personas;
  peopleHelp.textContent = texts.personasAyuda;
  messageLabelMain.textContent = texts.mensaje;
  messageLabelOptional.textContent = texts.mensajeOpcional;
  closeButton.setAttribute("aria-label", texts.cerrar);
  closeSuccessButton.querySelector("span")!.textContent = texts.cerrar;
  submitText.textContent = texts.enviar;
  spinner.hidden = true;

  openButton.addEventListener("click", () => abrirRsvp(openButton));
  anotherButton.addEventListener("click", () => abrirRsvp(anotherButton));
  closeButton.addEventListener("click", () => dialog.close());
  closeSuccessButton.addEventListener("click", () => dialog.close());
  form.addEventListener("submit", handleSubmit);

  shareButton?.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.sitio.titulo,
          text: content.sitio.descripcion,
          url: content.sitio.url,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }

    const write = navigator.clipboard?.writeText(content.sitio.url);
    if (!write) {
      showShareNotice(texts.enlaceError);
      return;
    }

    write
      .then(() => showShareNotice(texts.enlaceCopiado))
      .catch(() => showShareNotice(texts.enlaceError));
  });

  dialog.addEventListener("close", () => {
    if (currentState.status === "success") {
      resetForm();
    }
    if (isFocusable(opener)) {
      opener.focus();
    } else if (elements && isFocusable(elements.anotherButton)) {
      elements.anotherButton.focus();
    }
    opener = null;
  });

  attachInputListeners();
}
