// ============================================================
//  CONFIG.JS — L'UNICO FILE DA MODIFICARE
// ============================================================

const CONFIG = {

  sede: "Via Biagi",
  dashboardPin: "1234",

  // --- OPERATRICI ---
  operatrici: [
    {
      nome: "Martina",
      principale: true,
      orario: [
        { dalle: "09:00", alle: "13:00" },
        { dalle: "14:00", alle: "18:00" }
      ]
    },
    {
      nome: "Matilde",
      principale: true,
      orario: [
        { dalle: "09:00", alle: "13:00" },
        { dalle: "14:00", alle: "17:00" }
      ]
    },
    {
      nome: "Amelia",
      principale: true,
      orario: [
        { dalle: "09:30", alle: "13:00" },
        { dalle: "14:00", alle: "16:30" }
      ]
    },
    {
      nome: "Nasca",
      principale: false,
      orario: []
    }
  ],

  // --- ATTIVITÀ EXTRA SRS ---
  attivitaExtra: [
    "Centralino",
    "Accoglienza",
    "Supporto diagnosi",
    "Gestione fatturati",
    "Sistemazione planner",
    "Gestione cellulare aziendale",
    "Altro"
  ],

  // --- SEZIONI CHIAMATE ---
  // Ogni sezione ha un nome, un'icona, un orario opzionale (dalle/alle)
  // e le sue categorie.
  //
  // Per ogni categoria:
  //   id:         identificatore univoco — NON cambiare se hai già dati
  //   label:      nome mostrato nel form
  //   tagliando:  true  = conta nel TOTALE TAGLIANDI
  //   srs:        true  = conta nel TOTALE SRS
  //   contato:    true  = conta nelle chiamate totali (senza contatto, risposta, ecc.)
  //
  // RIPROGRAMMAZIONI: tagliando: false — si conta ma NON entra nel totale

  sezioni: [

    // ── 1. TOSHIKO ───────────────────────────────────────────
    {
      id: "toshiko",
      label: "Toshiko",
      icon: "📋",
      categorie: [
        { id: "tos_senza_contatto", label: "Senza contatto", tagliando: false, srs: false },
        { id: "tos_senza_risposta", label: "Senza risposta",  tagliando: false, srs: false },
        { id: "tos_risposta",       label: "Risposta",        tagliando: false, srs: false },
        { id: "tos_tagliandi",      label: "Tagliandi",       tagliando: true,  srs: true  },
      ]
    },

    // ── 2. FILE ANNULLATI ─────────────────────────────────────
    {
      id: "file_annullati",
      label: "File annullati",
      icon: "🗂️",
      categorie: [
        { id: "fan_senza_contatto", label: "Senza contatto", tagliando: false, srs: false },
        { id: "fan_senza_risposta", label: "Senza risposta",  tagliando: false, srs: false },
        { id: "fan_risposta",       label: "Risposta",        tagliando: false, srs: false },
        { id: "fan_tagliandi",      label: "Tagliandi",       tagliando: true,  srs: true  },
      ]
    },

    // ── 3. FILE TAGLIANDI ─────────────────────────────────────
    {
      id: "file_tagliandi",
      label: "File tagliandi",
      icon: "📁",
      categorie: [
        { id: "fta_senza_contatto", label: "Senza contatto", tagliando: false, srs: false },
        { id: "fta_senza_risposta", label: "Senza risposta",  tagliando: false, srs: false },
        { id: "fta_risposta",       label: "Risposta",        tagliando: false, srs: false },
        { id: "fta_tagliandi",      label: "Tagliandi",       tagliando: true,  srs: true  },
      ]
    },

    // ── 4. CANALI DIRETTI ─────────────────────────────────────
    {
      id: "canali_diretti",
      label: "Canali diretti",
      icon: "📞",
      categorie: [
        { id: "cd_whatsapp",        label: "WhatsApp",        tagliando: true,  srs: true  },
        { id: "cd_centralino",      label: "Centralino",      tagliando: true,  srs: false },
        { id: "cd_presenza",        label: "Di presenza",     tagliando: true,  srs: false },
        { id: "cd_osb",             label: "OSB",             tagliando: true,  srs: false },
        { id: "cd_teams_skype",     label: "Teams / Skype",   tagliando: true,  srs: false },
        { id: "cd_riprogrammazione",label: "Riprogrammazioni",tagliando: false, srs: false }, // ⚠️ non è un tagliando
      ]
    }

  ],

  // --- GOOGLE SHEETS ---
  googleSheets: {
    scriptUrl: "https://script.google.com/macros/s/AKfycbxFA3_7QzK8soBe5JvNX7CAM7DRE4v-sAL9dh_mm4ZmE8wHFR_Hu817W-radImoKBBD/exec",
  }

};

// ══ HELPERS (non modificare) ══════════════════════════════════

// Tutte le categorie in un array piatto
function tutteLeCategorie() {
  return CONFIG.sezioni.flatMap(s => s.categorie);
}

// Calcola ore totali di presenza da array di fasce orarie
function calcolaOrePresenza(fasce) {
  let totMin = 0;
  fasce.forEach(f => {
    if (!f.dalle || !f.alle) return;
    const [dh, dm] = f.dalle.split(':').map(Number);
    const [ah, am] = f.alle.split(':').map(Number);
    totMin += (ah * 60 + am) - (dh * 60 + dm);
  });
  return totMin / 60;
}

function timeToMin(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minToOre(m) { return Math.round(m) / 60; }

function getOperatrice(nome) {
  return CONFIG.operatrici.find(o => o.nome === nome) || null;
}
