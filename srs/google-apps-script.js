// ============================================================
//  GOOGLE APPS SCRIPT v5 — OPERATRICI + BONUS
// ============================================================

const SHEET_NAME = "Report";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); writeHeaders(sheet, data); }
    if (sheet.getLastRow() === 0) writeHeaders(sheet, data);
    sheet.appendRow(buildRow(data));
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return jsonResponse({ rows: [] });
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
    return jsonResponse({ rows });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function writeHeaders(sheet, data) {
  // Intestazioni base — NUOVO: Tipo e Registrato da
  const headers = [
    "Data", "Operatrice", "Tipo", "Registrato da",
    "Ore presenza", "Ore assenza", "Tipo assenza",
    "Ore extra SRS", "Attività extra", "Ore SRS pure",
  ];
  // Una colonna per ogni categoria di ogni sezione
  data.sezioni.forEach(sez => {
    sez.categorie.forEach(cat => {
      headers.push(`${sez.label} - ${cat.label}`);
    });
  });
  headers.push("Totale Tagliandi", "Totale SRS", "Chiamate totali", "Note");

  sheet.appendRow(headers);
  const r = sheet.getRange(1, 1, 1, headers.length);
  r.setBackground("#0f1117");
  r.setFontColor("#ffffff");
  r.setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function buildRow(data) {
  const row = [
    data.data, 
    data.operatrice, 
    data.tipo || "Operatrice",      // ← NUOVO: Tipo (Operatrice o Bonus)
    data.registrato_da || "",         // ← NUOVO: Chi ha registrato il bonus
    data.ore_presenza || "",
    data.ore_assenza || "",
    data.tipo_assenza || "",
    data.ore_extra || "",
    data.attivita_extra || "",
    data.ore_srs || "",
  ];
  data.sezioni.forEach(sez => {
    sez.categorie.forEach(cat => {
      row.push(data.valori[cat.id] || 0);
    });
  });
  row.push(
    data.totale_tagliandi || 0,
    data.totale_srs || 0,
    data.chiamate_totali || 0,
    data.note || ""
  );
  return row;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
