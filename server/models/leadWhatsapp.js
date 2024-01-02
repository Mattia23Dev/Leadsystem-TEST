const mongoose = require('mongoose');
const { Schema } = mongoose;

const leadSchemaWhatsapp = new Schema({
    number: { type: String, required: true },
    name: { type: String, required: true },
    messages: [{ type: String }],
    timestamp: { type: Date, default: Date.now },
    assigned: {
      type: Boolean,
      default: false,
    },
  });


const leadWhatsapp = mongoose.model('leadWhatsapp', leadSchemaWhatsapp);

module.exports = leadWhatsapp ;  