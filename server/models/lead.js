const mongoose = require('mongoose');
const { Schema } = mongoose;

const LeadSchema = new Schema({
    data: {
      type: String,
      required: true
    },
    nome: {
      type: String,
      required: true
    },
    cognome: {
      type: String,
    },
    email: {
      type: String,
    },
    numeroTelefono: {
      type: String,
    },
    campagna: {
      type: String,
    },
    corsoDiLaurea: {
      type: String,
    },
    frequentiUni: {
      type: Boolean,
    },
    lavoro: {
      type: Boolean,
    },
    facolta: {
      type: String,
    },
    oreStudio: {
      type: String,
    },
    esito: {
        type: String,
        default: 'Da contattare',
    },
    orientatori: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Orientatore',
    },
    utente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
    università: {
        type: String,
      },
    provincia: {
        type: String,
      },
    note: {
        type: String,
    },
    fatturato: {
      type: String,
    },
    dataCambiamentoEsito: {
      type: Date,
      default: null,
    },
    oraChiamataRichiesto: {
      type: String,
    },
    quandoInizi: {
      type: String,
    },
    manualLead: {
      type : Boolean,
      default: false,
    },
    annunci: {
      type: String,
    },
    adsets: {
      type: String,
    },
    nameCampagna: {
      type: String,
    }, 
    utmSource: {
      type: String,
    },
    utmCampaign: {
      type: String,
    },
    utmContent: {
      type: String,
    },
    utmTerm: {
      type: String,
    },
    etichette: [String],
    idMeta: String,
  });


const Lead = mongoose.model('Lead', LeadSchema);


module.exports = Lead ;