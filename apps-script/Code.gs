function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // dentro del try: si expira, se responde JSON y no una página HTML de error
    const d = JSON.parse(e.postData.contents);
    if (d.botcheck) return json({ ok: true }); // honeypot: el bot cree que funcionó
    const nombre = String(d.nombre || "").trim();
    const personas = Number(d.personas);
    const mensaje = String(d.mensaje || "").trim();
    if (nombre.length < 2 || nombre.length > 80 || !Number.isInteger(personas) ||
        personas < 1 || personas > 10 || mensaje.length > 500) {
      return json({ ok: false, error: "invalid" });
    }
    SpreadsheetApp.getActive().getSheetByName("Confirmaciones")
      .appendRow([new Date(), safe(nombre), personas, safe(mensaje)]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: "server" });
  } finally {
    lock.releaseLock();
  }
}
// Evita que un texto que empiece por = + - @ tab o CR se interprete como fórmula.
const safe = (s) => (/^[=+\-@\t\r]/.test(s) ? "'" + s : s);
const json = (o) => ContentService.createTextOutput(JSON.stringify(o))
  .setMimeType(ContentService.MimeType.JSON);
