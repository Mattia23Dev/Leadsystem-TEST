const mongoose = require('mongoose');
const { Schema } = mongoose;

const LeadWordpressSchema = new Schema({
    data: {
      type: String,
      required: true
    },
    nome: {
      type: String,
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
      required: true
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
    data: { type: Date, default: Date.now },
    assigned: {
      type: Boolean,
      default: false,
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
    universita: Boolean,
    lavoro: Boolean,
    orario: String,
    provincia: String,
  });


const LeadWordpress = mongoose.model('LeadWordpress', LeadWordpressSchema);

module.exports = LeadWordpress ;