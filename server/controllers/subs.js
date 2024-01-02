const User = require('../models/user');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
//const {getLeadToDatabase} = require('./leads');
const AdminUser = require('../models/adminUser');
const { ObjectId } = require('mongoose').Types;
const LeadFacebook = require('../models/leadFacebook');
const LeadPaymentWaiting = require('../models/leadPaymentWaiting');
const LeadWhatsapp = require('../models/leadWhatsapp');
const LeadWordpress = require("../models/leadWordpress");
const Chat = require('../models/chat');
const { sendMailLeadInsufficienti, sendMailConfirmPayment } = require('./sendEmail');
const Lead = require('../models/lead');
var cron = require('node-cron');
const moment = require('moment');
const LastLeadUser = require('../models/lastLeadUser');
const ms = require('ms');
const nodemailer = require('nodemailer');
const { sendNotification, sendEmailLeadArrivati } = require('../middlewares');
const { getPegasoLeads, getTagLeads, getTagLeads2 } = require('./Facebook');
const LeadTag = require('../models/leadTag');
exports.prices = async (req, res) => {
  const prices = await stripe.prices.list({ limit: 100 });
  const filteredPrices = prices.data.filter((price) => {
    return price.nickname && price.nickname.includes('Leadsystem');
  });
     res.json(filteredPrices.reverse());
};

exports.createSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let session;

    const productId = req.body.priceId;
    const price = await stripe.prices.retrieve(productId);
    const customer = await stripe.customers.retrieve(user.stripe_customer_id);
    const defaultPaymentMethodId = customer.invoice_settings.default_payment_method;

      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        billing_address_collection: 'required',
        payment_method_types: ['card', 'sepa_debit'], //"paypal",  'sepa_debit'
        line_items: [
          {
            price: req.body.priceId,
            quantity: 1,
          },
        ],
        automatic_tax: {
          enabled: true,
        },
        custom_fields: [
          {
            key: 'IVA',
            label: {
              type: 'custom',
              custom: 'Partita IVA/cod. fiscale',
            },
            type: 'text',
          },
          {
            key: 'CodeSdi',
            label: {
              type: 'custom',
              custom: 'Codice destinatario per fatturazione elettronica',
            },
            type: 'text',
          },
        ],
        customer: user.stripe_customer_id,
        customer_update: {
          address: "auto", 
        },
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_CANCEL_URL,
        allow_promotion_codes: true,
      });
      res.json(session.url);

  } catch (err) {
    console.log(err);
  }
};

exports.createPayment = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const numLeads = req.body.numLeads;
    const price = req.body.priceId;
    const priceObject = await stripe.prices.retrieve(req.body.priceId);
    const priceNum = (priceObject.unit_amount / 100);
   // console.log(priceNum);
   // console.log(price);

   // const halfPrice = priceObject.unit_amount / 2;
   // console.log(halfPrice);
    // Crea la sessione di pagamento per l'utente corrente
      const userSession = await stripe.checkout.sessions.create({
      mode: "payment",
      billing_address_collection: 'required',
      payment_method_types: ["card", 'sepa_debit'], // "paypal", "sepa_debit"
      line_items: [
        {
          price: price,
          quantity: 1,
        },
      ],
      custom_fields: [
        {
          key: 'IVA',
          label: {
            type: 'custom',
            custom: 'Partita IVA/cod. fiscale',
          },
          type: 'text',
        },
        {
          key: 'CodeSdi',
          label: {
            type: 'custom',
            custom: 'Codice destinatario per fatturazione elettronica',
          },
          type: 'text',
        },
      ],
      automatic_tax: {
        enabled: true,
      },
      customer: user.stripe_customer_id,
      customer_update: {
        address: "auto", 
      },
      success_url: process.env.STRIPE_SUCCESS_URL_BOOST,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      allow_promotion_codes: true,
    });

    res.json(
      userSession.url,
    );

    sendMailConfirmPayment(user.email, numLeads);
    const leadPaymentWaiting = new LeadPaymentWaiting({
      userId: user._id,
      numLeads: numLeads,
      createdAt: new Date(),
      userSessionId: userSession.id,
    });
    await leadPaymentWaiting.save();
    // Crea la sessione di pagamento per l'utente fisso che paga l'altra metà
   /* const fixedUserSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price,
          quantity: 1,
        },
      ],
      customer: 'cus_NscQSKZuBBUDwO',
      success_url: process.env.STRIPE_SUCCESS_URL_ADMIN,
      cancel_url: process.env.STRIPE_CANCEL_URL_ADMIN,
    });

    const admin = await AdminUser.findOne({ role: 'admin' });
    admin.paymentSessions.push({
      idAdminSession: fixedUserSession.id,
      sessionUrl: fixedUserSession.url,
      halfPrice: priceNum,
      idUserSession: userSession.id,
    });
    await admin.save();*/

    //checkPaymentWaiting2();
  } catch (err) {
    console.log(err);
  }
};

exports.checkPaymentWaitingRoute = async (req, res) => {
  console.log('la sto eseguendo');
  try {
    // Recupera tutti i pagamenti in sospeso dal database in ordine cronologico
    const payments = await LeadPaymentWaiting.find({}).sort({ createdAt: 1 });

    if (payments === undefined || payments.length === 0) {
      console.log('Nessun pagamento trovato');
    } else {
          for (const payment of payments) {
      const userSessionPayment = await stripe.checkout.sessions.retrieve(payment.userSessionId);
      if (userSessionPayment && userSessionPayment.payment_status && userSessionPayment.payment_status === 'paid') {

          const user = await User.findById(payment.userId);
          console.log(user.monthlyLeadCounter);
          const monthlyLeadCounter = user.monthlyLeadCounter + payment.numLeads;
          console.log(monthlyLeadCounter)
          await User.findByIdAndUpdate(payment.userId, 
            { monthlyLeadCounter: monthlyLeadCounter });


          await LeadPaymentWaiting.findByIdAndDelete(payment._id);
          res.json(200);
        } else {
        console.log('non sono state pagate');
        //await LeadPaymentWaiting.findByIdAndDelete(payment._id);
      }
    }
    }

  } catch (err) {
    console.log(err);
    res.json(500);
  }
};

const checkPaymentWaiting2 = async () => {
  console.log('la sto eseguendo');
  try {
    // Recupera tutti i pagamenti in sospeso dal database in ordine cronologico
    const payments = await LeadPaymentWaiting.find({}).sort({ createdAt: 1 });

    if (payments === undefined || payments.length === 0) {
      console.log('Nessun pagamento trovato');
    } else {
          for (const payment of payments) {
      const userSessionPayment = await stripe.checkout.sessions.retrieve(payment.userSessionId);
      console.log(userSessionPayment.payment_status);
      if (userSessionPayment && userSessionPayment.payment_status && userSessionPayment.payment_status === 'paid') {

        const user = await User.findById(payment.userId);
        const monthlyLeadCounter = user.monthlyLeadCounter + payment.numLeads;
        console.log(monthlyLeadCounter)
        await User.findByIdAndUpdate(payment.userId, 
          { monthlyLeadCounter: monthlyLeadCounter });


        await LeadPaymentWaiting.findByIdAndDelete(payment._id);
        res.json(200);
      } else {
      console.log('non sono state pagate');
      await LeadPaymentWaiting.findByIdAndDelete(payment._id);
    }
    }
    }

  } catch (err) {
    console.log(err);
  }
};

exports.subscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: "active",
      expand: ["data.default_payment_method"],
    });
    const totalMonthlyLeadsNeeded = subscriptions.data.reduce(
      (total, subscription) => total + (subscription.plan.transform_usage?.divide_by ?? 0),
      0
    );

    const previousSubscriptionStatus = user.subscriptions.map(subscription => subscription.plan.id).join(',');

    const updated = await User.findByIdAndUpdate(
      user._id,
      {
        subscriptions: subscriptions.data,
        monthlyLeadFix: totalMonthlyLeadsNeeded,
      },
      { new: true }
    );

    const currentSubscriptionStatus = subscriptions.data.map(subscription => subscription.plan.id).join(',');
    if (previousSubscriptionStatus !== currentSubscriptionStatus) {
      if (currentSubscriptionStatus === undefined || currentSubscriptionStatus === '') {
        // L'utente non ha un abbonamento attivo
        await User.findByIdAndUpdate(
          user._id,
          {
            subscriptions: subscriptions.data,
            monthlyLeadCounter: 0,
            monthlyLeadFix: 0,
          },
          { new: true }
        );
        console.log('Abbonamento scaduto o non rinnovato per:', user.nameECP);
      } else {
        await User.findByIdAndUpdate(
          user._id,
          {
            subscriptions: subscriptions.data,
            monthlyLeadCounter: user.monthlyLeadCounter + totalMonthlyLeadsNeeded,
            monthlyLeadFix: totalMonthlyLeadsNeeded,
          },
          { new: true }
        );
        console.log('Nuovo abbonamento attivato per:', user.nameECP);
      }
    }

    res.json(updated);
  } catch (err) {
    console.log(err);
  }
};


exports.subscriptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: "active",
      expand: ["data.default_payment_method"],
    });

    res.json(subscriptions);
  } catch (err) {
    console.log(err);
  }
};

exports.oneTimePayments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const customerId = user.stripe_customer_id;
    const customer = await stripe.customers.retrieve(customerId);

    const payments = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 10,
    });

    const filteredPayments = payments.data.filter(payment => payment.payment_status === 'paid');

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });

    const filteredInvoices = invoices.data.filter(invoice => invoice.paid === true);

    res.json({ payments: filteredPayments, invoices: filteredInvoices });
  } catch (err) {
    console.log(err);
  }
};

exports.customerPortal = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: process.env.STRIPE_SUCCESS_URL,
    });
    
    res.json({ url: portalSession.url });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'An error occurred' });
  }
};


//Sessioni di pagamento per l'admin
exports.getConfirmedPaymentSessions = async (req, res) => {
  try {
    const confirmedUserSessions = [];

    // Recupera tutti gli utenti
    const users = await User.find({});

    for (const user of users) {
      // Recupera tutte le spese dell'utente da Stripe
      const customer = await stripe.customers.retrieve(user.stripe_customer_id);
      const charges = await stripe.charges.list({ customer: customer.id });

      // Calcola la somma delle spese
      const totalAmount = charges.data.reduce((sum, charge) => sum + charge.amount, 0);

      confirmedUserSessions.push({
        user: user,
        totalAmount: totalAmount,
      });
    }

    res.json({ confirmedUserSessions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Errore nel recupero delle sessioni di pagamento confermate' });
  }
};

const getActiveSubscriptions = async () => {
  try {
    const users = await User.find(); // Ottieni tutti gli utenti registrati nel sistema

    const activeSubscriptions = [];
    // Itera su tutti gli utenti per ottenere le iscrizioni attive
    for (const user of users) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: "active", // Filtra solo le iscrizioni attive
        expand: ["data.default_payment_method"],
      });

      for (const subscription of subscriptions.data) {
        // Calcola i prodotti corrispondenti alla quantità dell'abbonamento

        if (subscription.plan && 
          subscription.plan.transform_usage && 
          subscription.plan.transform_usage.divide_by !== null) {
              const divideBy = subscription.plan.transform_usage.divide_by;

              activeSubscriptions.push({
                userId: user._id,
                subscriptionId: subscription.id,
                divideBy: divideBy,
              });
        } else {
          activeSubscriptions.push({
            userId: user._id,
            subscriptionId: subscription.id,
            divideBy: 0,
          })
        }
      }
    }

    return activeSubscriptions;

  } catch (error) {
    console.log(error.message);
  }
};

const calculateAndAssignLeadsEveryDayWhatsapp = async () => {
  try {
    let users = await User.find({ monthlyLeadCounter: { $gt: 0 } });
    let leads = await LeadWhatsapp.find({ $or: [{ assigned: false }, { assigned: { $exists: false } }] });

    const totalLeads = leads.length;
    console.log('Iscrizioni whatsapp:', totalLeads);

    if (totalLeads === 0) {
      console.log('Nessun lead whatsapp disponibile');
      return;
    }

    let userIndex = 0;

    while (leads.length > 0 && users.some(user => user.monthlyLeadCounter > 0)) {
      const user = users[userIndex];

      if (!user) {
        console.log('Tutti gli utenti hanno il contatore a 0');
        break;
      }

      if (user.dailyCap !== undefined && user.dailyCap !== null) {
    
        if (user.dailyLead >= user.dailyCap) {
          console.log(`L'utente ${user.nameECP} ha raggiunto il dailyCap per oggi.`);
          userIndex++;
          continue;
        }
      }

      const leadsNeeded = Math.min(user.monthlyLeadCounter, 1);

      if (leadsNeeded === 0) {
        console.log(`Il contatore mensile dell'utente ${user._id} è insufficiente. Non vengono assegnati ulteriori lead.`);
        userIndex++;
        continue;
      }

      const leadsForUser = leads.splice(0, leadsNeeded);

      for (const leadWithoutUser of leadsForUser) {

        const newLead = new Lead({
          data: new Date(),
          nome: leadWithoutUser.name || '',
          cognome: leadWithoutUser.cognome || '',
          email: leadWithoutUser.email || '',
          numeroTelefono: leadWithoutUser.number || '',
          campagna: 'Whatsapp',
          corsoDiLaurea: leadWithoutUser.corsoDiLaurea || '',
          frequentiUni: false,
          lavoro: false,
          facolta: '',
          oreStudio: '',
          esito: 'Da contattare',
          orientatori: null,
          utente: user._id,
          università: leadWithoutUser.università || '',
          provincia: '',
          note: '',
          fatturato: '',
        });

        const chatMessages = leadWithoutUser.messages.map(leadMessage => {
          return {
            content: leadMessage,
            sender: 'lead',
            timestamp: leadWithoutUser.timestamp,
          };
        });

        try {
          await newLead.validate();
          const savedLead = await newLead.save();

          
        const chat = new Chat({
          userId: user._id,
          leadId: savedLead._id,
          messages: chatMessages,
          createdAt: new Date(),
          numeroTelefono: leadWithoutUser.number,
        });


          await chat.save();

          user.monthlyLeadCounter -= 1;
          user.dailyLead += 1;
          await user.save();

          console.log(`Assegnato il lead ${leadWithoutUser._id} all'utente con ID ${user._id}`);
        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }

        const leadIndex = leads.findIndex(lead => lead._id.toString() === leadWithoutUser._id.toString());
        if (leadIndex !== -1) {
          leads.splice(leadIndex, 1);
        }

        leadWithoutUser.assigned = true;
        await leadWithoutUser.save();
      }

      userIndex++;
      if (userIndex >= users.length) {
        userIndex = 0;
      }
    }

    if (totalLeads === 0) {
      console.log('LeadWordpress terminati prima che tutti gli utenti abbiano il contatore a 0');
    }
  } catch (error) {
    console.log(error.message);
  }
};

let lastUserReceivedLead = null;

const calculateAndAssignLeadsEveryDayTag = async () => {
  try {
    let users = await User.find({
      $and: [
        { monthlyLeadCounter: { $gt: 0 } },
        { tag: "Tag" }
      ]
    });
    let leads = await LeadTag.find({ $or: [{ assigned: false }, { assigned: { $exists: false } }] });

    const totalLeads = leads.length;
    console.log('Iscrizioni:', totalLeads);

    if (totalLeads === 0) {
      console.log('Nessun lead Tag disponibile');
      return;
    }

    const lastUserLeadData = await LastLeadUser.findOne({});
    if (lastUserLeadData) {
      lastUserReceivedLead = lastUserLeadData.userId;
    }

    let userIndex = 0;

    const lastUser = users.find(user => user._id.toString() === lastUserReceivedLead.toString());

    /*if (lastUser) {
      console.log('ultimo utente' + lastUser.nameECP);
      userIndex = users.indexOf(lastUser) + 1;
      lastUserReceivedLead = null;
    }*/

    while (leads.length > 0 && users.some(user => user.monthlyLeadCounter > 0)) {
      const user = users[userIndex];

      if (!user) {
        console.log('Tutti gli utenti hanno il contatore a 0');
        break;
      }

      if (user.dailyCap !== undefined && user.dailyCap !== null) {
    
        if (user.dailyLead >= user.dailyCap) {
          console.log(`L'utente ${user.nameECP} ha raggiunto il dailyCap per oggi.`);
          userIndex++;
          continue;
        }
      }

      const leadsNeeded = Math.min(user.monthlyLeadCounter, 1);

      if (leadsNeeded === 0) {
        console.log(`Il contatore mensile dell'utente ${user._id} è insufficiente. Non vengono assegnati ulteriori lead.`);
        userIndex++;
        continue;
      }

      const leadsForUser = leads.splice(0, leadsNeeded);

      for (const leadWithoutUser of leadsForUser) {
        const userData = {
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          frequentiUni: false,
          oraChiamataRichiesto: '',
          provincia: '',
          corsoDiLaurea: "",
        };

        for (const field of leadWithoutUser.fieldData) {
          if (field.name === "first_name") {
            userData.first_name = field.values[0];
          } else if (field.name === "last_name") {
            userData.last_name = field.values[0];
          } else if (field.name === "email") {
            userData.email = field.values[0];
          } else if (field.name === "phone_number") {
            userData.phone_number = field.values[0];
          } else if (field.name === "frequenti_già_l'università?"){
            const value = field.values[0];
            if (value == "no"){
              userData.frequentiUni === false;
            } else if (value == "sì" || value == "si" || value == "si_") {
              userData.frequentiUni === true;
            }
          } else if (field.name === "stai_già_lavorando?"){
            const value = field.values[0];
            if (value == "no"){
              userData.lavoro === false;
            } else if (value == "sì" || value == "si" || value == "si_") {
              userData.lavoro === true;
            }
          } else if ( field.name == "prenota_senza_impegno_il_tuo_appuntamento_telefonico._seleziona_la_fascia_d'orario_in_cui_sei_disponibile_:" ){
            userData.oraChiamataRichiesto = field.values[0];
          } else if ( field.name == "quale_percorso_di_studi_ti_interessa?"){
            userData.corsoDiLaurea = field.values[0];
          } else if ( field.name == "indica_la_tua_provincia_di_appartenenza"){
            userData.provincia = field.values[0];
          }
        } 

        const newLead = new Lead({
          data: new Date(),
          nome: userData.first_name,
          cognome: userData.last_name,
          email: userData.email,
          numeroTelefono: userData.phone_number,
          campagna: 'Social',
          corsoDiLaurea: userData.corsoDiLaurea ? userData.corsoDiLaurea : '',
          frequentiUni: userData.frequentiUni ? userData.frequentiUni : false,
          lavoro: false,
          facolta: '',
          oreStudio: "",
          esito: "Da contattare",
          orientatori: null,
          utente: user._id,
          università: "",
          provincia: userData.provincia ? userData.provincia : "",
          note: "",
          fatturato: "",
          oraChiamataRichiesto: userData.oraChiamataRichiesto ? userData.oraChiamataRichiesto : '',
          annunci: leadWithoutUser.annunci ? leadWithoutUser.annunci : '',
          adsets: leadWithoutUser.adsets ? leadWithoutUser.adsets : '',
          nameCampagna: leadWithoutUser.name ? leadWithoutUser.name : '', 
        });

        try {
          await newLead.save();

          lastUserReceivedLead = user._id;

          user.monthlyLeadCounter -= 1;
          user.dailyLead += 1;
          await user.save();

          leadWithoutUser.assigned = true;
          await leadWithoutUser.save();

          await sendNotification(user._id);

          await sendEmailLeadArrivati(user._id);

          console.log(`Assegnato il lead ${leadWithoutUser._id} all'utente ${user.nameECP}`);
        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }

        const leadIndex = leads.findIndex(lead => lead._id.toString() === leadWithoutUser._id.toString());
        if (leadIndex !== -1) {
          leads.splice(leadIndex, 1);
        }

      }

      userIndex++;
      if (userIndex >= users.length) {
        userIndex = 0;
      }
    }

    if (totalLeads === 0) {
      console.log('LeadFacebook terminati prima che tutti gli utenti abbiano il contatore a 0');
    }
    if (lastUserReceivedLead == null || lastUserReceivedLead == undefined) {
      await LastLeadUser.findOneAndUpdate({}, { userId: '651acf7e7ccf14d8d809fc5c' }, { upsert: true });
    } else {
       await LastLeadUser.findOneAndUpdate({}, { userId: lastUserReceivedLead }, { upsert: true });
    }

  } catch (error) {
    console.log(error.message);
  }
};

const calculateAndAssignLeadsEveryDay = async () => {
  try {
    let users = await User.find({ $and: [
      { monthlyLeadCounter: { $gt: 0 } },
      { tag: "pegaso" }
    ]});
    let leads = await LeadFacebook.find({ $or: [{ assigned: false }, { assigned: { $exists: false } }] });

    const totalLeads = leads.length;
    console.log('Iscrizioni:', totalLeads);

    if (totalLeads === 0) {
      console.log('Nessun lead disponibile');
      return;
    }

    console.log( 'Utenti:'+ users.length);

    const lastUserLeadData = await LastLeadUser.findOne({});
    if (lastUserLeadData) {
      lastUserReceivedLead = lastUserLeadData.userId;
    }

    let userIndex = 0;

    const lastUser = users.find(user => user._id.toString() === lastUserReceivedLead.toString());

    if (lastUser) {
      console.log('ultimo utente' + lastUser.nameECP);
      userIndex = users.indexOf(lastUser) + 1;
      lastUserReceivedLead = null;
    }

    while (leads.length > 0 && users.some(user => user.monthlyLeadCounter > 0)) {
      const user = users[userIndex];

      if (!user || user.monthlyLeadCounter == 0) {
        console.log('Tutti gli utenti hanno il contatore a 0');
        break;
      }

      if (user.dailyCap !== undefined && user.dailyCap !== null) {
    
        if (user.dailyLead >= user.dailyCap) {
          console.log(`L'utente ${user.nameECP} ha raggiunto il dailyCap per oggi.`);
          userIndex++;
          continue;
        }
      }

      const leadsNeeded = Math.min(user.monthlyLeadCounter, 1);

      if (leadsNeeded === 0) {
        console.log(`Il contatore mensile dell'utente ${user._id} è insufficiente. Non vengono assegnati ulteriori lead.`);
        userIndex++;
        continue;
      }

      const leadsForUser = leads.splice(0, leadsNeeded);

      for (const leadWithoutUser of leadsForUser) {
        if (leadWithoutUser.assigned) {
          console.log(`Il lead ${leadWithoutUser._id} è già stato assegnato.`);
          continue;
        }

        const userData = {
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          frequentiUni: false,
          oraChiamataRichiesto: '',
          provincia: '',
          corsoDiLaurea: "",
        };

        for (const field of leadWithoutUser.fieldData) {
          if (field.name === "first_name") {
            userData.first_name = field.values[0];
          } else if (field.name === "last_name") {
            userData.last_name = field.values[0];
          } else if (field.name === "email") {
            userData.email = field.values[0];
          } else if (field.name === "phone_number") {
            userData.phone_number = field.values[0];
          } else if (field.name === "frequenti_già_l'università?"){
            const value = field.values[0];
            if (value == "no"){
              userData.frequentiUni === false;
            } else if (value == "sì" || value == "si" || value == "si_") {
              userData.frequentiUni === true;
            }
          } else if (field.name === "stai_già_lavorando?"){
            const value = field.values[0];
            if (value == "no"){
              userData.lavoro === false;
            } else if (value == "sì" || value == "si" || value == "si_") {
              userData.lavoro === true;
            }
          } else if ( field.name == "prenota_senza_impegno_il_tuo_appuntamento_telefonico._seleziona_la_fascia_d'orario_in_cui_sei_disponibile_:" ){
            userData.oraChiamataRichiesto = field.values[0];
          } else if ( field.name == "quale_percorso_di_studi_ti_interessa?"){
            userData.corsoDiLaurea = field.values[0];
          } else if ( field.name == "province"){
            userData.provincia = field.values[0];
          }
        } 

        const newLead = new Lead({
          data: new Date(),
          nome: userData.first_name,
          cognome: userData.last_name,
          email: userData.email,
          numeroTelefono: userData.phone_number,
          campagna: 'Social',
          corsoDiLaurea: userData.corsoDiLaurea ? userData.corsoDiLaurea : '',
          frequentiUni: userData.frequentiUni ? userData.frequentiUni : false,
          lavoro: false,
          facolta: '',
          oreStudio: "",
          esito: "Da contattare",
          orientatori: null,
          utente: user._id,
          università: "",
          provincia: userData.provincia ? userData.provincia : "",
          note: "",
          fatturato: "",
          oraChiamataRichiesto: userData.oraChiamataRichiesto ? userData.oraChiamataRichiesto : '',
          annunci: leadWithoutUser.annunci ? leadWithoutUser.annunci : '',
          adsets: leadWithoutUser.adsets ? leadWithoutUser.adsets : '',
          nameCampagna: leadWithoutUser.name ? leadWithoutUser.name : '', 
          idMeta: leadWithoutUser.id ? leadWithoutUser.id : '',
        });

        try {
          await newLead.save();

          lastUserReceivedLead = user._id;

          user.monthlyLeadCounter -= 1;
          user.dailyLead += 1;
          await user.save();

          leadWithoutUser.assigned = true;
          await leadWithoutUser.save();

          //await sendNotification(user._id);

          await sendEmailLeadArrivati(user._id);

          console.log(`Assegnato il lead ${leadWithoutUser._id} all'utente ${user.nameECP}`);
        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }

        const leadIndex = leads.findIndex(lead => lead._id.toString() === leadWithoutUser._id.toString());
        if (leadIndex !== -1) {
          leads.splice(leadIndex, 1);
        }

      }

      userIndex++;
      if (userIndex >= users.length) {
        userIndex = 0;
      }
    }

    if (totalLeads === 0) {
      console.log('LeadFacebook terminati prima che tutti gli utenti abbiano il contatore a 0');
    }
    if (lastUserReceivedLead == null || lastUserReceivedLead == undefined) {
      await LastLeadUser.findOneAndUpdate({}, { userId: '651acf7e7ccf14d8d809fc5c' }, { upsert: true });
    } else {
      await LastLeadUser.findOneAndUpdate({}, { userId: lastUserReceivedLead }, { upsert: true });
    }

  } catch (error) {
    console.log(error.message);
  }
};

const calculateAndAssignLeadsEveryDayWordpress = async () => {
  try {
    let users = await User.find({ $and: [
      { monthlyLeadCounter: { $gt: 0 } },
      { tag: "pegaso" }
    ] });
    let leads = await LeadWordpress.find({ $or: [{ assigned: false }, { assigned: { $exists: false } }] });

    const totalLeads = leads.length;
    console.log('Iscrizioni Wordpress:', totalLeads);

    if (totalLeads === 0) {
      console.log('Nessun lead Wordpress disponibile');
      return;
    }

    const lastUserLeadData = await LastLeadUser.findOne({});
    if (lastUserLeadData) {
      lastUserReceivedLead = lastUserLeadData.userId;
    }

    let userIndex = 0;

    const lastUser = users.find(user => user._id.toString() === lastUserReceivedLead.toString());

    if (lastUser) {
      console.log('ultimo utente' + lastUser.nameECP);
      userIndex = users.indexOf(lastUser) + 1;
      lastUserReceivedLead = null;
    }

    while (leads.length > 0 && users.some(user => user.monthlyLeadCounter > 0)) {
      const user = users[userIndex];

      if (!user) {
        console.log('Tutti gli utenti hanno il contatore a 0');
        break;
      }

      if (user.dailyCap !== undefined && user.dailyCap !== null) {
    
        if (user.dailyLead >= user.dailyCap) {
          console.log(`L'utente ${user.nameECP} ha raggiunto il dailyCap per oggi.`);
          userIndex++;
          continue;
        }
      }

      const leadsNeeded = Math.min(user.monthlyLeadCounter, 1);

      if (leadsNeeded === 0) {
        console.log(`Il contatore mensile dell'utente ${user.nameECP} è insufficiente. Non vengono assegnati ulteriori lead.`);
        userIndex++;
        continue;
      }

      const leadsForUser = leads.splice(0, leadsNeeded);

      for (const leadWithoutUser of leadsForUser) {
        if (leadWithoutUser.assigned == true) {
          console.log(`Il lead ${leadWithoutUser.nome} è già stato assegnato.`);
          continue;
        }

        const newLead = new Lead({
          data: new Date(),
          nome: leadWithoutUser.nome || '',
          cognome: leadWithoutUser.cognome || '',
          email: leadWithoutUser.email || '',
          numeroTelefono: leadWithoutUser.numeroTelefono || '',
          campagna: leadWithoutUser.campagna ? leadWithoutUser.campagna : '',
          corsoDiLaurea: leadWithoutUser.corsoDiLaurea || '',
          frequentiUni: leadWithoutUser.universita || false,
          lavoro: leadWithoutUser.lavoro || false,
          facolta: '',
          oreStudio: '',
          esito: 'Da contattare',
          orientatori: null,
          utente: user._id,
          università: leadWithoutUser.università || '',
          provincia: leadWithoutUser.provincia || '',
          note: '',
          fatturato: '',
          utmCampaign: leadWithoutUser.utmCampaign || '',
          utmSource: leadWithoutUser.utmSource || '',
          utmContent: leadWithoutUser.utmContent || '',
          utmTerm: leadWithoutUser.utmTerm || '',
        });

        try {
          leadWithoutUser.assigned = true;
          await leadWithoutUser.save();

          const leadsVerify = await Lead.find({});
          const existingLead = leadsVerify.find(
            (lead) =>
              lead.cognome === leadWithoutUser.cognome && lead.email === leadWithoutUser.email
          );

          if (!existingLead) {
            await newLead.save();
            console.log(`Assegnato il lead ${leadWithoutUser.cognome} all'utente con ID ${user.nameECP}`);
            user.monthlyLeadCounter -= 1;
            user.dailyLead += 1;
            await user.save();

            const leadIndex = leads.findIndex(lead => lead._id.toString() === leadWithoutUser._id.toString());
            if (leadIndex !== -1) {
              leads.splice(leadIndex, 1);
            }
          } else {
            console.log(`Già assegnato il lead ${leadWithoutUser.cognome} all'utente con ID ${user.nameECP}`)
            continue;
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }

      userIndex++;
      if (userIndex >= users.length) {
        userIndex = 0;
      }
    }

    if (totalLeads === 0) {
      console.log('LeadFacebook terminati prima che tutti gli utenti abbiano il contatore a 0');
    }
    if (lastUserReceivedLead == null || lastUserReceivedLead == undefined) {
      await LastLeadUser.findOneAndUpdate({}, { userId: '651acf7e7ccf14d8d809fc5c' }, { upsert: true });
    } else {
      await LastLeadUser.findOneAndUpdate({}, { userId: lastUserReceivedLead }, { upsert: true });
    }


  } catch (error) {
    console.log(error.message);
  }
};

const calculateAndAssignLeadsEveryDayWordpressComparatore = async () => {
  try {
    const userId = '655f707143a59f06d5d4dc3b';
    let user = await User.findById(userId);
    let leads = await LeadWordpress.find({
      $or: [
        { assigned: false },
        { assigned: { $exists: false } },
      ],
      'campagna': 'comparatore',
    });

    const totalLeads = leads.length;
    console.log('Lead Comparatore:', totalLeads);

    if (totalLeads === 0) {
      console.log('Nessun lead Comparatore disponibile');
      return;
    }

    if (user.monthlyLeadCounter == 0){
      console.log('Utente ha il comparatore a 0');
      return;
    }

    while (leads.length > 0 && user.monthlyLeadCounter > 0) {

      if (!user) {
        console.log('Utente ha il contatore a 0');
        break;
      }

      if (user.dailyCap !== undefined && user.dailyCap !== null) {
    
        if (user.dailyLead >= user.dailyCap) {
          console.log(`L'utente ${user.nameECP} ha raggiunto il dailyCap per oggi.`);
          break;
        }
      }

      const leadsNeeded = Math.min(user.monthlyLeadCounter, 1);

      if (leadsNeeded === 0) {
        console.log(`Il contatore mensile dell'utente ${user.nameECP} è insufficiente. Non vengono assegnati ulteriori lead.`);
        break;
      }

      const leadsForUser = leads.splice(0, leadsNeeded);

      for (const leadWithoutUser of leadsForUser) {
        if (leadWithoutUser.assigned == true) {
          console.log(`Il lead ${leadWithoutUser.nome} è già stato assegnato.`);
          continue;
        }

        const newLead = new Lead({
          data: new Date(),
          nome: leadWithoutUser.nome || '',
          cognome: leadWithoutUser.cognome || '',
          email: leadWithoutUser.email || '',
          numeroTelefono: leadWithoutUser.numeroTelefono || '',
          campagna: leadWithoutUser.campagna ? leadWithoutUser.campagna : '',
          corsoDiLaurea: leadWithoutUser.corsoDiLaurea || '',
          frequentiUni: leadWithoutUser.universita || false,
          lavoro: leadWithoutUser.lavoro || false,
          facolta: '',
          oreStudio: '',
          esito: 'Da contattare',
          orientatori: null,
          utente: user._id,
          università: leadWithoutUser.università || '',
          provincia: leadWithoutUser.provincia || '',
          note: '',
          fatturato: '',
          utmCampaign: leadWithoutUser.utmCampaign || '',
          utmSource: leadWithoutUser.utmSource || '',
          utmContent: leadWithoutUser.utmContent || '',
          utmTerm: leadWithoutUser.utmTerm || '',
        });

        try {
          leadWithoutUser.assigned = true;
          await leadWithoutUser.save();

          const leadsVerify = await Lead.find({});
          const existingLead = leadsVerify.find(
            (lead) =>
              lead.cognome === leadWithoutUser.cognome && lead.email === leadWithoutUser.email
          );

          if (!existingLead) {
            await newLead.save();
            console.log(`Assegnato il lead ${leadWithoutUser.cognome} all'utente con ID ${user.nameECP}`);
            user.monthlyLeadCounter -= 1;
            user.dailyLead += 1;
            await user.save();

            const leadIndex = leads.findIndex(lead => lead._id.toString() === leadWithoutUser._id.toString());
            if (leadIndex !== -1) {
              leads.splice(leadIndex, 1);
            }
          } else {
            console.log(`Già assegnato il lead ${leadWithoutUser.cognome} all'utente con ID ${user.nameECP}`)
            continue;
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    }

    if (totalLeads === 0) {
      console.log('Lead Comparatore terminati prima che utente abbia il contatore a 0');
    }

  } catch (error) {
    console.log(error.message);
  }
};

const resetMonthlyLeadCounter = async () => {
  console.log('Eseguo il reset');

  try {
    const users = await User.find({ 'subscriptions.0': { $exists: true } });
    const usersWithoutSub = await User.find({ subscriptions: [] });
    console.log(users.length);

    for (const user of users) {
      const startDateInMillis = user.subscriptions[0].billing_cycle_anchor;
      const startDate = new Date(startDateInMillis * 1000);
      const subscriptionDate = startDate.getDate();

      const currentDate = moment();
      const dayOfMonth = currentDate.date();
      console.log(dayOfMonth, subscriptionDate + 1);

      if (dayOfMonth === subscriptionDate + 1 && !usersWithoutSub.includes(user._id) ) {
        user.monthlyLeadCounter = user.monthlyLeadCounter + user.monthlyLeadFix;
        await user.save();
       console.log('ok', user.nameECP)
      } else {
        console.log('non è il giorno', user.nameECP);
      }
    }

    console.log('Contatore mensile dei lead verificato');
  } catch (err) {
    console.log(err);
  }
};

const resetDailyCap = async () => {
  console.log('Eseguo il reset del cap');

  try {
    const users = await User.find();

    for (const user of users) {
      user.dailyLead = 0;
      await user.save();
    }

    console.log('Cap giornaliero resettato');
  } catch (err) {
    console.log(err);
  }
};
const subscriptionStatus = async() => {
  try {
    const users = await User.find();

    for (const user of users) {
        const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: "active",
        expand: ["data.default_payment_method"],
      });
      const totalMonthlyLeadsNeeded = subscriptions.data.reduce(
        (total, subscription) => total + (subscription.plan.transform_usage?.divide_by ?? 0),
        0
      );

      const previousSubscriptionStatus = user.subscriptions.map(subscription => subscription.plan.id).join(',');

      const updated = await User.findByIdAndUpdate(
        user._id,
        {
          subscriptions: subscriptions.data,
          monthlyLeadFix: totalMonthlyLeadsNeeded,
        },
        { new: true }
      );

      const currentSubscriptionStatus = subscriptions.data.map(subscription => subscription.plan.id).join(',');
      if (previousSubscriptionStatus !== currentSubscriptionStatus) {
        if (currentSubscriptionStatus === undefined || currentSubscriptionStatus === '') {
          // L'utente non ha un abbonamento attivo
          await User.findByIdAndUpdate(
            user._id,
            {
              subscriptions: subscriptions.data,
              monthlyLeadCounter: 0,
              monthlyLeadFix: 0,
            },
            { new: true }
          );
          console.log('Abbonamento scaduto o non rinnovato per:', user.nameECP);
        } else {
          await User.findByIdAndUpdate(
            user._id,
            {
              subscriptions: subscriptions.data,
              monthlyLeadCounter: user.monthlyLeadCounter + totalMonthlyLeadsNeeded,
              monthlyLeadFix: totalMonthlyLeadsNeeded,
            },
            { new: true }
          );
          console.log('Nuovo abbonamento attivato per:', user.nameECP);
        }
      }
    }

    await resetMonthlyLeadCounter();

  } catch (err) {
    console.log(err);
  }
};

/*cron.schedule('07,20,35,50 8,9,10,11,12,13,14,15,16,17 * * *', () => {
  calculateAndAssignLeadsEveryDayTag();
  console.log('Eseguo calculate Lead Tag di prova');
});*/

/*
cron.schedule('30 7 * * *', () => {
  subscriptionStatus();
  console.log('Eseguito il reset del counter');
});

cron.schedule('30 6 * * *', () => {
  resetDailyCap();
  console.log('Eseguito il reset del daily Lead');
});

cron.schedule('10,46,20,35,50 8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * *', () => {
  getPegasoLeads();
  console.log('Prendo i lead di pegaso');
});

cron.schedule('15,58,25,40 8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * *', () => {
  calculateAndAssignLeadsEveryDay();
  console.log('Assegno i lead di pegaso');
});

cron.schedule('24 8,9,10,11,12,14,15,16,17,18,19,20,21,22,23 * * *', () => {
  //getTagLeads2();
  //calculateAndAssignLeadsEveryDayWhatsapp();
  console.log('Eseguo calculate Whatsapp');
});

cron.schedule('01 8,9,10,11,12,14,15,16,17,18,19,20,21,22,23 * * *', () => {
  //getTagLeads();
  calculateAndAssignLeadsEveryDayWordpress();
  console.log('Eseguo calculate Wordpress');
});

cron.schedule('47 7,8,9,10,11,12,14,15,16,17,18,19,20,21,22,23 * * *', () => {
  console.log('Eseguo l\'assegnazione a Ecp solo comparatore');
  calculateAndAssignLeadsEveryDayWordpressComparatore();
});*/

exports.dailyCap = async (req, res) => {
  try {
    const userId = req.body.userId;
    const dailyCap = req.body.dailyCap;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    user.dailyCap = dailyCap;

    await user.save();

    res.status(200).json({ message: 'Daily cap aggiornato con successo', user });  
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento del daily cap' });
  }
};

//calculateAndAssignLeadsEveryDay();

//setTimeout(checkPaymentWaiting, everyDay);
//checkPaymentWaiting();
//setTimeout(calculateAndAssignLeadsEveryDay, everyDay2);
