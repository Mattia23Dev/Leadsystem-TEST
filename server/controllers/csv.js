const fs = require('fs');
const csv = require('csv-parser');
const Lead = require('../models/lead');
const results = [];


  const outputFile = 'leadData.csv';

const writeStream = fs.createWriteStream(outputFile);

// Scrivi l'intestazione del CSV
writeStream.write('Data,Nome,Cognome,Cellulare,Email,Esito\n');

exports.exportLead = async () => {
  console.log('la eseguo')
  const leads = await Lead.find();

  //const startDate = new Date('2023-11-13T00:00:00.000Z');
  //const endDate = new Date('2023-11-16T23:59:59.999Z');

  const filteredLeads = leads.filter((lead) => {
    //const leadDate = new Date(lead.data);
    //return leadDate >= startDate && leadDate <= endDate;
    return lead.campagna == "affiliati"
  });

  filteredLeads.forEach((lead) => {
    writeStream.write(`${lead.data},${lead.nome},${lead.cognome},${lead.email},${lead.numeroTelefono},${lead.esito}\n`);
  });

  console.log('Esportazione completata. Il file CSV è stato creato.');

  // Chiudi il file CSV dopo aver scritto tutti i dati
  writeStream.end();
};





