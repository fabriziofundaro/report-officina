// ============================================================
// GOOGLE APPS SCRIPT - PASSAGGI OFFICINA v1
// Scrittura + lettura della sola scheda "Passaggi"
// ============================================================

const SHEET_NAME = "Passaggi";
const HEADERS = [
  "Data",
  "Sezione",
  "Accettatore",
  "Passaggi",
  "Gomme",
  "Tappetini",
  "EasyPay",
  "ODL",
  "Timestamp"
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Payload POST mancante");
    }

    const data = JSON.parse(e.postData.contents);
    validatePayload(data);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error("Spreadsheet attivo non disponibile");

    const sheet = getOrCreatePassaggiSheet(ss);
    const timestamp = Utilities.formatDate(
      new Date(),
      ss.getSpreadsheetTimeZone(),
      "dd/MM/yyyy, HH:mm:ss"
    );

    const rows = buildRows(data, timestamp);
    if (!rows.length) throw new Error("Nessuna riga da registrare");

    sheet
      .getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length)
      .setValues(rows);

    return jsonResponse({
      success: true,
      rowsAdded: rows.length
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.message
    });
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error("Spreadsheet attivo non disponibile");

    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) {
      return jsonResponse({ rows: [] });
    }

    validateExistingHeaders(sheet);

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data
      .slice(1)
      .filter(row => row.some(value => value !== "" && value !== null))
      .map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = serializeValue(row[index]);
        });
        return obj;
      });

    return jsonResponse({ rows });
  } catch (err) {
    return jsonResponse({
      rows: [],
      error: err.message
    });
  }
}

function validatePayload(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Payload non valido");
  }
  if (!data.data) {
    throw new Error("Data di riferimento mancante");
  }
  if (!data.toyota || typeof data.toyota !== "object") {
    throw new Error("Dati Toyota mancanti");
  }
  if (!data.carrozzeria || typeof data.carrozzeria !== "object") {
    throw new Error("Dati Carrozzeria mancanti");
  }
}

function getOrCreatePassaggiSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    writeHeaders(sheet);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    writeHeaders(sheet);
    return sheet;
  }

  validateExistingHeaders(sheet);
  return sheet;
}

function validateExistingHeaders(sheet) {
  const existing = sheet
    .getRange(1, 1, 1, HEADERS.length)
    .getValues()[0]
    .map(value => String(value || "").trim());

  const mismatch = HEADERS.some((header, index) => existing[index] !== header);
  if (mismatch) {
    throw new Error(
      'La scheda "Passaggi" non ha le intestazioni attese. Scrittura interrotta per proteggere i dati.'
    );
  }
}

function writeHeaders(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet
    .getRange(1, 1, 1, HEADERS.length)
    .setBackground("#0052CC")
    .setFontColor("#ffffff")
    .setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function buildRows(data, timestamp) {
  const rows = [];

  // Toyota: una riga per ogni accettatore, incluso l'eventuale bonus.
  Object.keys(data.toyota || {}).forEach(accettatore => {
    const valori = data.toyota[accettatore] || {};
    rows.push([
      data.data,
      "Toyota",
      accettatore,
      toNumber(valori.passaggi),
      toNumber(valori.gomme),
      toNumber(valori.tappetini),
      toNumber(valori.easypay),
      "",
      timestamp
    ]);
  });

  // Volvo: totale giornaliero, senza accettatore.
  rows.push([
    data.data,
    "Volvo",
    "-",
    toNumber(data.volvo),
    "",
    "",
    "",
    "",
    timestamp
  ]);

  // Revisioni: nel file reale il valore viene salvato nella colonna Passaggi.
  // La dashboard lo tratta comunque come KPI separato e lo esclude dal Totale Passaggi.
  rows.push([
    data.data,
    "Revisioni",
    "-",
    toNumber(data.revisioni),
    "",
    "",
    "",
    "",
    timestamp
  ]);

  // Carrozzeria: una riga per ogni accettatore.
  Object.keys(data.carrozzeria || {}).forEach(accettatore => {
    const valori = data.carrozzeria[accettatore] || {};
    rows.push([
      data.data,
      "Carrozzeria",
      accettatore,
      toNumber(valori.passaggi),
      "",
      "",
      toNumber(valori.easypay),
      "",
      timestamp
    ]);
  });

  // ODL Carrozzeria: riga separata, come nel file già prodotto oggi.
  rows.push([
    data.data,
    "Carrozzeria",
    "ODL Totali",
    "",
    "",
    "",
    "",
    toNumber(data.carrozzeria_odl),
    timestamp
  ]);

  return rows;
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function serializeValue(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(
      value,
      SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(),
      "yyyy-MM-dd"
    );
  }
  return value;
}

function testConfigurazione() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Spreadsheet attivo non disponibile");
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Scheda "Passaggi" non trovata');
  validateExistingHeaders(sheet);
  Logger.log(
    'OK - Scheda Passaggi valida. Righe dati presenti: ' +
    Math.max(sheet.getLastRow() - 1, 0)
  );
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
