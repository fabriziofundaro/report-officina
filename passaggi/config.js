// ============================================================
//  CONFIG.JS — PASSAGGI OFFICINA — L'UNICO FILE DA MODIFICARE
// ============================================================

const CONFIG = {

  sede: "Via Biagi",
  
  // --- ACCETTATORI TOYOTA ---
  accettatori_toyota: [
    "Epifanio",
    "Lipari",
    "Modica",
    "Parisi",
    "Cipolla",
    "Tarantino"
  ],

  // --- ACCETTATORI CARROZZERIA ---
  accettatori_carrozzeria: [
    "Guardì",
    "Colletti",
    "Corsale",
    "Orlando",
    "Marrone"
  ],

  // --- GOOGLE SHEETS ---
  googleSheets: {
    scriptUrl: "https://script.google.com/macros/s/AKfycbxaMj5JAwEQeC1keaelcFDNU6ux2458ROv0myPzZ3cdptzGkPuClu0Uc7J_t2bc17lR/exec",
  }

};

// ══ HELPERS (non modificare) ══════════════════════════════════

function getTotalePassaggi(accettatori) {
  let totale = 0;
  accettatori.forEach(acc => {
    const passaggi = parseInt(document.getElementById(`${acc}-passaggi`)?.value) || 0;
    totale += passaggi;
  });
  return totale;
}

function getTotaleGomme(accettatori) {
  let totale = 0;
  accettatori.forEach(acc => {
    const gomme = parseInt(document.getElementById(`${acc}-gomme`)?.value) || 0;
    totale += gomme;
  });
  return totale;
}

function getTotaleTappetini(accettatori) {
  let totale = 0;
  accettatori.forEach(acc => {
    const tappetini = parseInt(document.getElementById(`${acc}-tappetini`)?.value) || 0;
    totale += tappetini;
  });
  return totale;
}

function getTotaleEasypay(accettatori) {
  let totale = 0;
  accettatori.forEach(acc => {
    const easypay = parseInt(document.getElementById(`${acc}-easypay`)?.value) || 0;
    totale += easypay;
  });
  return totale;
}
