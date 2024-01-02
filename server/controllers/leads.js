const xlsx = require('xlsx');
const User = require('../models/user');
const AdminUser = require('../models/adminUser');
const LeadFacebook = require('../models/leadFacebook');
//const chokidar = require('chokidar');
//const filePath = '';
//const watcher = chokidar.watch(filePath);
const Orientatore = require('../models/orientatori');
const Lead = require('../models/lead');
const Etichette = require('../models/etichette');
const mongoose = require('mongoose');

/*exports.getLeadToDatabase = async (userId, numLeads) => {
    try {
      const workbook = xlsx.readFile('');
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const leads = [];
  
      for (let i = 2; i <= numLeads + 1 ; i++) {
        const row = {};
        for (let j = 65; j <= 90; j++) { // Loop through columns A to Z
          const cell = worksheet[String.fromCharCode(j) + i];
          if (cell) {
            row[String.fromCharCode(j)] = cell.v;
          } else {
            break;
          }
        }
        leads.push(row);
      }
  
      const user = await User.findByIdAndUpdate(
        userId,
        { $push: { leads: { $each: leads } } },
        { new: true }
      );
  
      console.log(user.leads);
      return user.leads;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };*/

 /* const sendLeadsToAdmin = async (adminId, numLeads) => {
    try {
      const workbook = xlsx.readFile('C:/Users/matti/OneDrive/Desktop/subscription-stripe/LeadsWebApp/server/Lead-Ads.xlsx');
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const leads = [];
  
      for (let i = 2; i <= numLeads + 1; i++) {
        const row = {};
        for (let j = 65; j <= 90; j++) { // Loop through columns A to Z
          const cell = worksheet[String.fromCharCode(j) + i];
          if (cell) {
            row[String.fromCharCode(j)] = cell.v;
          } else {
            break;
          }
        }
        leads.push(row);
      }
  
      const admin = await AdminUser.findByIdAndUpdate(
        adminId,
        { $push: { leads: { $each: leads } } },
        { new: true }
      );
  
      console.log(admin.leads);
      return admin.leads;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };*/

  const sendLeadsToAdmin = async (adminId, leads) => {
    try {
      const admin = await AdminUser.findByIdAndUpdate(
        adminId,
        { $push: { leads: { $each: leads } } },
        { new: true }
      );
  
      //console.log(admin.leads);
      return admin.leads;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  exports.getLeadsFb = async (req, res) => {
    try {
      const userId = req.body._id;
      const leads = await LeadFacebook.find({ utente: userId });
      res.json(leads);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Errore nel recupero dei lead" });
    }
  };

  exports.getLeadsAdmin = async (req, res) => {
    try {
      const user = await AdminUser.findById(req.body._id);
      const leads = user.leads;
      res.json(leads);
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  exports.getLeadsManual = async (req, res) => {
    try {
      const userId = req.body._id;
  
      // Cerca tutti i lead che hanno l'ID dell'utente nel campo "utente"
      const leads = await Lead.find({ utente: userId }).populate('orientatori');
  
      res.json(leads);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Errore nel recupero dei lead' });
    }
  };

  exports.getLeadsManualWhatsapp = async (req, res) => {
    try {
      const userId = req.body._id;
  
      // Cerca tutti i lead che hanno l'ID dell'utente nel campo "utente"
      const leads = await Lead.find({ utente: userId, campagna:'Whatsapp' }).populate('orientatori');
  
      res.json(leads);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Errore nel recupero dei lead' });
    }
  };
  exports.getAllLead = async (req, res) => {
    try {
      //const leads = await Lead.find().populate('orientatori').populate('utente');
      const leads = await Lead.find()
    
      res.json(leads);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Errore nel recupero dei lead' });
    }
  };

  exports.calculateFatturatoByUtente = async (req, res) => {
    try {
      // Recupera tutti gli utenti
      const users = await User.find({});
    
      const fatturatoByUtente = [];
    
      // Per ogni utente, filtra i lead corrispondenti e calcola la somma del fatturato
      for (const user of users) {
        const leads = await Lead.find({ utente: user._id, esito: 'Venduto' });
    
        const sommaFatturato = leads.reduce((sum, lead) => sum + parseInt(lead.fatturato), 0);
    
        const utenteData = {
          utente: user,
          sommaFatturato: sommaFatturato,
        };
    
        fatturatoByUtente.push(utenteData);
      }
    
      res.json(fatturatoByUtente);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Errore nel calcolo del fatturato per utente' });
    }
  };

  exports.calculateFatturatoByOrientatore = async (req, res) => {
    try {
      // Recupera tutti gli orientatori distinti presenti nei lead
      const orientatori = await Lead.distinct('orientatori');
    
      const fatturatoByOrientatore = [];
    
      // Per ogni orientatore, filtra i lead corrispondenti e calcola la somma del fatturato
      for (const orientatoreId of orientatori) {
        if (!orientatoreId) {
          continue; 
        }
        const leads = await Lead.find({ orientatori: orientatoreId, esito: 'Venduto' });
    
        const sommaFatturato = leads.reduce((sum, lead) => sum + parseInt(lead.fatturato), 0);
    
        const orientatore = await Orientatore.findById(orientatoreId);
    
        const orientatoreData = {
          orientatore: orientatore,
          sommaFatturato: sommaFatturato,
        };
    
        fatturatoByOrientatore.push(orientatoreData);
      }
    
      res.json(fatturatoByOrientatore);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Errore nel calcolo del fatturato per orientatore' });
    }
  };

  exports.calculateFatturatoByOrientatoreUser = async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Recupera tutti gli orientatori distinti presenti nei lead dell'utente
      const orientatori = await Lead.distinct('orientatori', { utente: userId });
  
      const fatturatoByOrientatore = [];
  
      // Per ogni orientatore, filtra i lead corrispondenti e calcola la somma del fatturato
      for (const orientatoreId of orientatori) {
        if (!orientatoreId) {
          continue;
        }
        const leads = await Lead.find({ orientatori: orientatoreId, esito: 'Venduto' });
  
        const sommaFatturato = leads.reduce((sum, lead) => sum + parseInt(lead.fatturato), 0);
  
        const orientatore = await Orientatore.findById(orientatoreId);
  
        const orientatoreData = {
          orientatore: orientatore,
          sommaFatturato: sommaFatturato,
        };
  
        fatturatoByOrientatore.push(orientatoreData);
      }
  
      res.json(fatturatoByOrientatore);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Errore nel calcolo del fatturato per orientatore' });
    }
  };

  exports.salvaEtichetta = async (req, res) => {
    try {
      const { nomeEtichetta, utente, operation, etichettaId, leadId } = req.body;
      let nuovaEtichetta;

      if (operation === 'aggiunta') {
        const lead = await Lead.findById(leadId);
  
        if (!lead) {
          return res.status(408).json({ error: 'Lead non trovato' });
        }
        nuovaEtichetta = new Etichette({
          nomeEtichetta,
          utente,
        });

        lead.etichette.push(nomeEtichetta);

        await nuovaEtichetta.save();
        await lead.save();
      } else if (operation === 'eliminazione') {
        const etichetta = Etichette.findById(etichettaId);
        
        await etichetta.deleteOne();
      }
    
      res.status(201).json({ message: 'Etichetta salvata con successo', etichetta: nuovaEtichetta });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Si è verificato un errore durante il salvataggio dell\'etichetta' });
    }
  };

  exports.getEtichettaUser = async (req, res) => {
    try {
      const userId = req.params.id;

      const etichette = await Etichette.find();
      const etichetteUtente = etichette.filter(eti => {
        return eti.utente && eti.utente.toString() !== userId;
      });
      //console.log(etichetteUtente);
      res.status(200).json({etichette: etichetteUtente});
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Si è verificato un errore durante il recupero delle etichette.' });
    }
  }


 /* const handleExcelChanges = async () => {
    try {
      const filePath = '';
      const workbook = xlsx.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const adminId = '645ce6ce7a79bc7af9464aa9';

      let currentRowCount = 0;

      for (const cell in worksheet) {
        if (cell.startsWith('A') && worksheet[cell].v) {
          currentRowCount = Math.max(currentRowCount, parseInt(cell.substring(1)));
        }
      }
      console.log(currentRowCount);

      const adminUser = await AdminUser.findById(adminId);
      let previousRowCount = adminUser.leads.length;
      console.log(previousRowCount);
  
      if (currentRowCount > previousRowCount) {
        const adminId = '645ce6ce7a79bc7af9464aa9';
        const leads = [];
  
        for (let i = previousRowCount; i <= currentRowCount; i++) {
          const row = {};
  
          for (const [key, value] of Object.entries(worksheet)) {
            const matchResult = key.match(/\d+/);

            if (matchResult && matchResult.length > 0) {
              const cellRowIndex = parseInt(matchResult[0]);
          
              if (cellRowIndex === i && value && value.v) {
                console.log('Cella:', key);
                console.log('Valore:', value.v);
                row[key.replace(/[0-9]/g, '')] = value.v;
              }
            }
  
          }
  
          if (Object.keys(row).length > 0) {
            leads.push(row);
          }
        }
  
        // Chiamata alla funzione sendLeadsToAdmin
        await sendLeadsToAdmin(adminId, leads);
  
        // Aggiorna il numero di righe precedenti
        previousRowCount = currentRowCount;
      }
    } catch (err) {
      console.log(err);
    }
  };
  
  handleExcelChanges();
  watcher.on('change', handleExcelChanges);*/