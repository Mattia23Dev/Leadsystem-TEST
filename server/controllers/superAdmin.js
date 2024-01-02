const Orientatore = require('../models/orientatori');
const Lead = require('../models/lead');
const User = require('../models/user');
const LeadFacebook = require("../models/leadFacebook");
const LeadWordpress = require("../models/leadWordpress");
const LeadWhatsapp = require("../models/leadWhatsapp");

exports.modifyCounter = async (req, res) => {
  console.log(req.body);
    try {
      const { userId, counterValue } = req.body;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(500).json({ success: false, message: 'Utente non trovato' });
      }
  
      user.monthlyLeadCounter = counterValue;
      await user.save();
  
      res.status(200).json({ success: true, message: 'Contatore modificato con successo' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

exports.updateUserStatus = async (req, res) => {
    try {
      const { userId, active } = req.body;
  
      const user = await User.findByIdAndUpdate(userId, { active }, { new: true });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utente non trovato' });
      }
  
      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dello stato dell\'utente:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  exports.getAllLeadForCounter = async (req, res) => {
    try {
      const allLeads = await Lead.find();
      const allFacebookLeads = await LeadFacebook.find();
      const allWordpressLeads = await LeadWordpress.find();
      const allWhatsappLeads = await LeadWhatsapp.find();
  
      const leadsData = {
        leads: allLeads,
        facebookLeads: allFacebookLeads,
        wordpressLeads: allWordpressLeads,
        whatsappLeads: allWhatsappLeads,
      };
  
      res.status(200).json(leadsData);
    } catch (error) {
      console.error('Errore nel recupero dei lead:', error);
      res.status(500).json({ error: 'Si è verificato un errore nel recupero dei lead.' });
    }
  };

  /*exports.LeadForMarketing = async (req, res) => {
    try {
      const leadTrovati = await Lead.find();

      console.log(leadTrovati.length);

      res.status(200).json({message: 'Ok', data: leadTrovati});
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };*/

  exports.LeadForMarketing = async (req, res) => {
    try {
      const startDate = new Date('2023-09-26T00:00:00.000Z');
      const endDate = new Date('2023-10-17T23:59:59.999Z');
      const leadTrovati = await Lead.find();

      const filteredLeads = leadTrovati.filter((lead) => {
        const leadDate = new Date(lead.data);
        return leadDate >= startDate && leadDate <= endDate;
      });

      const leadConId = await Promise.all(
        leadTrovati.map(async (lead) => {
          const emailDaCercare = lead.email;
      
          const leadCampagna = {
            data: lead.data,
            nome: lead.nome,
            cognome: lead.cognome,
            email: lead.email,
            telefono: lead.numeroTelefono,
            esito: lead.esito,
            dataCambiamentoEsito: lead.dataCambiamentoEsito ? lead.dataCambiamentoEsito : 'Data non specificata',
            id: null,
            nomeCampagna: "Campagna non specificata",
          };
      
          if (lead.campagna === 'Social') {

            const leadTrovato = await LeadFacebook.findOne({
              'fieldData.name': 'email',
              'fieldData.values.0': emailDaCercare,
            });
      
            leadCampagna.nomeCampagna = lead.nameCampagna;
            if (leadTrovato) {
              leadCampagna.id = leadTrovato.id;
            }
          } else if (lead.campagna === 'Wordpress') {
            leadCampagna.nomeCampagna = lead.utmCampaign;
          }
      
          return leadCampagna;
        })
      );

      res.status(200).json({message: 'Ok', data: leadConId});
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };


  exports.getEcpSuperAdmin = async (req, res) => {
    try {
      const users = await User.find();
  
      const usersWithPaymentsAndLeads = [];
  
      for (const user of users) {
        const customerId = user.stripe_customer_id;
  
        const payments = await stripe.checkout.sessions.list({
          customer: customerId,
          limit: 10,
        });
  
        const filteredPayments = payments.data.filter(payment => payment.payment_status === 'paid');
  
        const leads = await Lead.find({ utente: user._id }).populate('orientatori');
        const justLeadNotManual = leads.filter(lead => lead.manualLead !== true);
        const orientatori = await Orientatore.find({ utente: user._id });
  
        const userWithPaymentsAndLeads = {
          ...user.toObject(),
          payments: filteredPayments,
          leads: justLeadNotManual,
          orientatori: orientatori,
        };
  
        usersWithPaymentsAndLeads.push(userWithPaymentsAndLeads);
      }
  
      res.json(usersWithPaymentsAndLeads);
    } catch (err) {
      console.log(err);
      console.log(err.message)
      return res.status(500).json({ error: "Errore nel recuperare gli utenti, gli acquisti e i lead" });
    }
  };