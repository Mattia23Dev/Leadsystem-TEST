const mongoose = require('mongoose');
const { Schema } = mongoose;

const leadSchemaTag = new Schema({
    data: {
      type: String,
    },
    formId: String,
    fieldData: [{
      name: String,
      values: [String],
    }],
    id: String,
    assigned: {
      type: Boolean,
      default: false,
    },
    utente: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    annunci: {
      type: String,
    },
    adsets: {
      type: String,
    },
    name: {
      type: String,
    }, 
  });
  
const LeadTag = mongoose.model('LeadTag', leadSchemaTag);

module.exports = LeadTag ;