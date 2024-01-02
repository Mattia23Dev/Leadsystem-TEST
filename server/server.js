const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const {readdirSync} = require('fs');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const morgan = require("morgan");
require("dotenv").config();
const path = require("path");
const LeadWhatsapp = require('./models/leadWhatsapp');
const User = require('./models/user');
var cron = require('node-cron');
const LeadTag = require('./models/leadTag');
const Lead = require('./models/lead');
const LeadFacebook = require('./models/leadFacebook');
const LeadWordpress = require('./models/leadWordpress');
const fs = require('fs');
const {exportLead} = require('./controllers/csv');
const { getAutomationtest } = require('./controllers/mailchimp');

const app = express();
//mongodb+srv://nova42:HECSQPaJNMsPmD7m@leadsystem.qmesodz.mongodb.net/?retryWrites=true&w=majority
//PRIVATE TEST = sk_test_51Lx6IYAvtCImCVVMk2TIHWdbXPr8xupCMrooy7u6rYeUruJePSTeTeE38oaL2AXyerMxDXGgiC5nQmNGrU1EXORu00c4wwzN6G
//STRIPE_SUCCESS_URL=https://leadsystem.tech/stripe/success
//STRIPE_CANCEL_URL=https://leadsystem.tech/
//STRIPE_SUCCESS_URL_ADMIN=https://leadsystem.tech/admin/impostazioni
//STRIPE_CANCEL_URL_ADMIN=https://leadsystem.tech/admin/impostazioni
//mongodb+srv://mattianorisbusiness:MAD7389gva@dbleads.96uqres.mongodb.net/?retryWrites=true&w=majority
//PRIVATE LIVE = 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
mongoose.set('strictQuery', false); 
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DB Connessoo!"))
  .catch((err) => console.log("DB Connection Error ", err));

  app.use(express.static(path.join(__dirname, 'client', 'public')));

  const deleteMany = async () => {
    try {
      await LeadTag.deleteMany({});
      console.log('Collection leadwhatsapps emptied successfully');
    } catch (error) {
      console.error('Error emptying collection:', error);
    }
  };
  const getLeadsBetweenDates = async () => {
    try {
      const startDate = new Date('2023-11-13T00:00:00.000Z');
      const endDate = new Date('2023-11-16T23:59:59.999Z');
  
      const leads = await Lead.find();
      const leadMeta = await LeadFacebook.find();
      const leadWorpdress = await LeadWordpress.find();
      const leadWhats = await LeadWhatsapp.find();
      const filteredLeadsMeta = leadMeta.filter((lead) => {
        const leadDate = new Date(lead.data);
        return leadDate >= startDate && leadDate <= endDate /* && lead.annunci == "Video ateneo migliore"*/;
      });

      const filteredLeadsWhats = leadWhats.filter((lead) => {
        const leadDate = new Date(lead.timestamp);
        return leadDate >= startDate && leadDate <= endDate;
      });

      const filteredLeadsWord = leadWorpdress.filter((lead) => {
        const leadDate = new Date(lead.data);
        return leadDate >= startDate && leadDate <= endDate;
      });
      const filteredLeads = leads.filter((lead) => {
        const leadDate = new Date(lead.data);
        return leadDate >= startDate && leadDate <= endDate && lead.campagna === "Social";
      });

      const filteredLeadsComp = leadWorpdress.filter((lead) => {
        const leadDate = new Date(lead.data);
        return leadDate >= startDate && leadDate <= endDate && lead.campagna === "comparatore";
      });

      const assegnatiLeadsComp = leads.filter((lead) => {
        const leadDate = new Date(lead.data);
        return leadDate >= startDate && leadDate <= endDate && lead.campagna === "comparatore";
      });

      const filteredLeadsWor = leads.filter((lead) => {
        const leadDate = new Date(lead.data);
        return leadDate >= startDate && leadDate <= endDate && lead.campagna === "Wordpress";
      });

      const filteredLeadsWhatsapp = leads.filter((lead) => {
        const leadDate = new Date(lead.data);
        return leadDate >= startDate && leadDate <= endDate && lead.campagna === "Whatsapp";
      });
  
      console.log('Whatsapp Entrati:  ' + filteredLeadsWhats.length);
      console.log('Whatsapp Assegnati:  ' + filteredLeadsWhatsapp.length);

      console.log('Wordpress Entrati:  ' + filteredLeadsWord.length);
      console.log('Wordpress Assegnati:  ' + filteredLeadsWor.length);

      console.log('Facebook Entrati:  ' + filteredLeadsMeta.length);
      console.log('Facebook Assegnati:  ' + filteredLeads.length);

      console.log("Comparatore Entrati:", filteredLeadsComp.length);
      console.log("Comparatore Assegnati:", assegnatiLeadsComp.length);

      /*if (Array.isArray(filteredLeadsMeta[0].fieldData)) {
        for (const field of filteredLeadsMeta[0].fieldData) {
          console.log(`Nome del campo: ${field.name}`);
          console.log(`Valori del campo: ${field.values.join(', ')}`);
          // Altre operazioni che desideri eseguire per ciascun campo
        }
      } else {
        console.log('fieldData non è un array');
      }*/

      function findDuplicateLeads() {
        const uniqueEmails = new Set();
        const duplicateLeads = [];
      
        assegnatiLeadsComp.forEach((lead) => {
          if (uniqueEmails.has(lead.email)) {
            duplicateLeads.push(lead);
          } else {
            uniqueEmails.add(lead.email);
          }
        });
      
        return duplicateLeads;
      }

      const filteredLeadsNonUnici = findDuplicateLeads();
      //console.log('Lead Meta doppi:', filteredLeadsNonUnici);
    } catch (error) {
      console.error(error);
    }
  };

  const outputFile = 'leadData.csv';

  const writeStream = fs.createWriteStream(outputFile);
  
  // Scrivi l'intestazione del CSV
  writeStream.write('Nome,Cognome,Email,NumeroTelefono,Esito\n');
  
  /*const exportLead = () => {
    console.log('la eseguo')
    // Query per recuperare tutti i documenti dalla collezione Lead
  Lead.find({}, (err, leads) => {
    if (err) {
      console.error('Errore nella query al database:', err);
      return;
    }
  
    // Per ciascun documento Lead, scrivi i dati nel file CSV
    leads.forEach((lead) => {
      writeStream.write(`${lead.nome},${lead.cognome},${lead.email},${lead.numeroTelefono},${lead.esito}\n`);
    });
  
    console.log('Esportazione completata. Il file CSV è stato creato.');
  
    // Chiudi il file CSV dopo aver scritto tutti i dati
    writeStream.end();
  });
  };*/
  
  //getLeadsBetweenDates();
  //deleteMany();
  //exportLead();
  //getAutomationtest();


  //notification
    //"soggetto": "mailto: <info@funnelconsulting.it>",
 const publicVapidKey = "BA4JFmsO2AigZr9o4BH8lqQerqz2NKytP2nsxOcHIKbl5g98kbOzLECvxXYrQyMTfV_W7sHTUG6_GuWtTzwLlCw";
 const privateVapidKey = "f33Ot0HGNfYCJRR69tW_LwRsbDQtS0Jk9Ya57l0XWQQ";

// middlewares
app.use(express.json({ limit: "5mb" }));
app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.COMPARACORSI, process.env.APP_COMPARACORSI, "https://test-comparatore.netlify.app", "https://leadsystem-test.netlify.app"],
  })
);

// autoload routes
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

webpush.setVapidDetails( "mailto:info@funnelconsulting.it", publicVapidKey, privateVapidKey);

app.post('/api/subscribe', (req, res) => {
  console.log(req.body);
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({ title: "", body: "" });

  webpush.sendNotification(subscription, payload).catch((err) => console.log(err));
});

const sendNotification = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.notificationsEnabled || user.notificationSubscriptions.length === 0) {
      console.log('Utente non trovato o notifiche non abilitate');
      return;
    }

    const notificationPayload = JSON.stringify({
      title: "Nuovi lead assegnati",
      body: "Hai nuovi lead assegnati",
      image: "https://cdn2.vectorstock.com/i/thumb-large/94/66/emoji-smile-icon-symbol-smiley-face-vector-26119466.jpg",
    });

    const options = {
      TTL: 3600, 
      vapidDetails: {
        subject: "mailto:info@funnelconsulting.it", 
        publicKey: publicVapidKey,
        privateKey: privateVapidKey,
      },
    };

    for (const subscription of user.notificationSubscriptions) {
      const pushSub = {
        endpoint: subscription.endpoint,
        keys: {
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
        },
      };

      await webpush.sendNotification(pushSub, notificationPayload, options);
    }

    console.log('Notifica inviata con successo');
  } catch (error) {
    console.error('Errore nell\'invio della notifica:', error);
  }
};
const userId = '64ba3df7e1c3aea9bdc02785';

cron.schedule('10,30 8,9,10,11,12,13,14,15,16,17 * * *', () => {
  sendNotification(userId);
  console.log('Invio notifica');
});


// listen
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
