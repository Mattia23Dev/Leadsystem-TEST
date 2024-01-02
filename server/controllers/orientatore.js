const Orientatore = require('../models/orientatori');
const Lead = require('../models/lead');
const User = require('../models/user');
const LeadDeleted = require("../models/leadDeleted");


exports.createOrientatore = async (req, res) => {
    //console.log(req.body);
    try {
      // Estrai i dati dalla richiesta
      const { nome, cognome, email, telefono } = req.body;
  
      // Controlla se l'utente è autenticato e ottieni il suo ID
      const userId = req.body.utente;
      if (!userId) {
        return res.status(400).json({ error: 'ID utente non fornito' });
      }
  
      // Crea un nuovo oggetto Orientatore con i dati forniti
      const orientatore = new Orientatore({
        nome,
        cognome,
        email,
        telefono,
        utente: userId  // Assegna l'ID dell'utente all'orientatore
      });
  
      // Salva l'orientatore nel database
      const nuovoOrientatore = await orientatore.save();
  
      res.status(201).json(nuovoOrientatore);
    } catch (err) {
      res.status(500).json({ error: err.message });
      console.log(err.message);
    }
  };


  exports.deleteOrientatore = async (req, res) => {
    //console.log(req.body.id);
    try {
      const orientatoreId = req.body.id;
      const orientatore = await Orientatore.findById(orientatoreId);
      if (!orientatore) {
        return res.status(404).json({ error: 'Orientatore non trovato' });
      }
  
      await Orientatore.findByIdAndDelete(orientatoreId);
  
      res.status(200).json({ message: 'Orientatore eliminato con successo' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  
  exports.createLead = async (req, res) => {
    //console.log(req.body.from);
    try {

      const utenteId = req.params.id;
  
      const utente = await User.findById(utenteId);
      if (!utente) {
        return res.status(404).json({ error: 'Utente non trovato' });
      }

      const orientatoreId = req.body.orientatori;
      const orientatore = await Orientatore.findById(orientatoreId);
      //console.log(orientatore);
        if (!orientatore) {
          return res.status(404).json({ error: 'Orientatore non trovato' });
        }
  
      const leadData = {
        data: req.body.data,
        nome: req.body.nome,
        cognome: req.body.cognome,
        email: req.body.email,
        numeroTelefono: req.body.numeroTelefono,
        campagna: req.body.campagna,
        corsoDiLaurea: req.body.corsoDiLaurea,
        frequentiUni: req.body.frequentiUni,
        lavoro: req.body.lavoro,
        facolta: req.body.facolta,
        oreStudio: req.body.oreStudio,
        orientatori: orientatore,
        utente: utenteId,
        esito: req.body.esito,
        università: req.body.università,
        provincia: req.body.provincia,
        note: req.body.note,
        fatturato: req.body.fatturato,
        manualLead: true,
      };
  
      const lead = new Lead(leadData);

      if (req.body.from === 'superadmin') {
        utente.monthlyLeadCounter -= 1;
        await utente.save();
    }
  
      await lead.save();
  
      res.status(201).json({ message: 'Lead aggiunto con successo', lead });
    } catch (err) {
      res.status(500).json({ error: err.message });
      console.log(err.message);
    }
  };

  exports.deleteLead = async (req, res) => {
    try {
      // Get the lead ID from the request
      const leadId = req.body.id;
  
      // Find the lead by ID and check if it exists
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(400).json({ error: 'Lead not found' });
      }

      const userId = lead.utente;
  
      const leadDeleted = {
        data: lead.data,
        nome: lead.nome,
        cognome: lead.cognome,
        email: lead.email,
        numeroTelefono: lead.numeroTelefono,
        campagna: lead.campagna,
        corsoDiLaurea: lead.corsoDiLaurea,
        frequentiUni: lead.frequentiUni,
        lavoro: lead.lavoro,
        facolta: lead.facolta,
        oreStudio: lead.oreStudio,
        orientatori: lead.orientatori ? lead.orientatori : null,
        utente: lead.utente,
        esito: lead.esito,
        università: lead.università,
        provincia: lead.provincia,
        note: lead.note,
        fatturato: lead.fatturato
      };
  
      const leadDeletedSave = new LeadDeleted(leadDeleted);
  
      await leadDeletedSave.save();
  
      await Lead.findByIdAndDelete(leadId);

      const userLeads = await Lead.find({ utente: userId, _id: { $ne: leadId } });
  
      res.status(200).json({ message: 'Lead deleted successfully', userLeads });
    } catch (err) {
      res.status(500).json({ error: err.message });
      console.log(err.message);
    }
  };

  exports.getLeadDeleted = async (req, res) => {
    try {
      // Cerca tutti i lead nel database
      const leads = await LeadDeleted.find().populate('orientatori').populate('utente');
    
      res.json(leads);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Errore nel recupero dei lead' });
    }
  };


  exports.updateLead = async (req, res) => {
    try {

      const leadId = req.params.id;
      const userId = req.params.userId;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utente non trovato' });
      }
  
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(404).json({ error: 'Lead non trovato' });
      }
  
      if (req.body.esito && req.body.esito !== lead.esito) {
        lead.dataCambiamentoEsito = new Date();
      }

      if ('orientatori' in req.body) {
        if (typeof req.body.orientatori === 'string' && req.body.orientatori.trim() === '') {
          req.body.orientatori = null;
        }
      }
  
      Object.assign(lead, req.body);
      await lead.save();
  
      if (req.body.esito === 'Non valido') {
        user.monthlyLeadCounter += 1;
        await user.save();
      }

      if (lead.esito === 'Non valido' && req.body.esito !== 'Non valido') {
        user.monthlyLeadCounter -= 1;
        await user.save();
      }
      
      const updatedLead = await lead.populate('orientatori');
  
      res.status(200).json({ message: 'Lead modificato con successo', updatedLead: updatedLead  });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ error: err.message });
    }
  };

  exports.updateLeadEtichette = async (req, res) => {
    try {
      const leadId = req.params.id;
      const { operation, etichetta } = req.body;
  
      const lead = await Lead.findById(leadId);
  
      if (!lead) {
        return res.status(404).json({ error: 'Lead non trovato' });
      }
  
      if (operation === 'aggiunta') {
        lead.etichette.push(etichetta);
      } else if (operation === 'eliminazione') {
        const index = lead.etichette.indexOf(etichetta);
        if (index !== -1) {
          lead.etichette.splice(index, 1);
        }
      } else if (operation === 'sostituzione') {
        lead.etichette = [etichetta];
      } else {
        return res.status(400).json({ error: 'Operazione non valida' });
      }
  
      await lead.save();
  
      res.status(200).json({ message: 'Operazione eseguita con successo', updatedLead: lead });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ error: err.message });
    }
  };

  exports.getOrientatori = async (req, res) => {
    try {
      console.log(req.params.id);
      const userId = req.params.id;
  
      // Cerca gli orientatori dell'utente per ID utente
      const orientatori = await Orientatore.find({ utente: userId });
  
      res.status(200).json({ orientatori });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  exports.updateOrientatore = async (req, res) => {
    try {
      const orientatoreId = req.params.id;
  
      const orientatore = await Orientatore.findById(orientatoreId);
      if (!orientatore) {
        return res.status(404).json({ error: 'Orientatore non trovato' });
      }

  
      Object.assign(orientatore, req.body);
      await orientatore.save();
  
      res.status(200).json({ message: 'Lead modificato con successo' });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ error: err.message });
    }
  };