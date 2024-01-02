const mongoose = require('mongoose');
const {Schema} = mongoose;

const etichetteSchema = new Schema({
  utente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nomeEtichetta: {type: String},
});

const Etichette = mongoose.model('Etichette', etichetteSchema);

module.exports = Etichette;