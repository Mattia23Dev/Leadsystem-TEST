const Lead = require('../models/lead');
const User = require('../models/user');
const crypto = require('crypto-js');
'use strict';
const fs = require('fs');
const Chat = require('../models/chat');
const Session = require('../models/session');
const axios = require('axios');
const LeadWhatsapp = require('../models/leadWhatsapp');

const WHATSAPP_PAGE_ACCESS_TOKEN = 'EAAN2JZAnVsjYBAMzjknI6TxWpWTptmbmsHTo0L1MwlcKUzNQlP6QupictOmCa0VYOZAzHpzMq33xI8cZB04R5vXFmvTz3UZBGiFxgScQdrsZAs68uhWaJ29tKsQDEaAPOrk3Ez4QUgGWrJ3ssBMLA3httUOreV6ZA4BxvCesUjqzFvoaLbLHXc6iOFH5WsZAPwZD';
const FACEBOOK_USER_ACCESS_TOKEN = 'EAAN2JZAnVsjYBAPLagvYX4jsN69WDc2hYUZAZAfr0knhSLpP17lhwICUhtwZACKcPb1PzQR5HuaGu0xn7Ec0W1Y6J6T2XZBBklKvZBL4fYEKGLa15JnDViI7fd6bGSNN3KLSrGZBweqBTJ8Nx2z7DKThOkrb2gRz5uEZBPzJkMvtVwwxbUvT4bbk';
const token_webhook = '123abc123abc';
const APP_TOKEN = '974328796918326|bmC5qJbAVVUWO55uCqmc2Mh26iM';
const app_secret = '16ae7d42162c0a2189d3709f6abf84a0';
const app_id = '974328796918326';
const page_id = '100405676306923';
const accessToken = 'EAAN2JZAnVsjYBACWOyUmXzSuqtwfpBnPFI3kJWuZAWZCZAWrOBGY8T8JV4QOxg3FrwafO81GDSpKqHGPf56WYKGeenoKEVLZCRua8Ih8oOebVtVBbcj31RSl61GVUa49yIVzJtmIpjvt4j6V1s2IUu16ehmZBkxvAoZA6dhZCNCff0l4kun9BCtMX7fuTqwLchq3kjG8UmAa0ld3jVBtdnQB'
const accessToken2 = 'EAAN2JZAnVsjYBAFTxqFlX3TDnSVvugZCM4mlB2pRpvU6Xh0W5pKLTgF7VvAnf0eh1MUjsZBTJVuersPw4JrV0ZCFeqLrL4teAFfHcVSaGlCmmpea4uIZBEvD9QZBcuoDoSZA7VECg1QuZAkg2FD3ecgFTpQa6ukvq1iz9cwauGE7QQjx1ErPdpXktFBZA7CGg8WEZD'
exports.getWebhookWhats = async(req, res) => {
    // Questo è l'endpoint che Facebook utilizzerà per la verifica
  
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
  
    if (mode === 'subscribe' && token === token_webhook) {
      // Verifica riuscita, restituisci la challenge a Facebook
      res.status(200).send(challenge);
    } else {
      // Verifica fallita, restituisci un errore
      res.sendStatus(403);
    }
  };

 /* exports.postWebhookWhats = async (req, res) => {
    console.log(req.body.entry[0].changes);
    if (!req.body.entry) {
      return res.status(500).send({ error: 'Invalid POST data received' });
    }
  
    const body_params = req.body;
  
    if (body_params.object) {
      if (body_params.entry && body_params.entry[0].changes) {
        console.log(body_params.entry[0].changes.messages[0]);
        const incomingMessages = body_params.entry[0].messages;
  
        incomingMessages.forEach((message) => {
          const phoneNumberId = message.phone_number_id;
          const from = message.from;
          const text = message.text.body;
  
          // Esegui le operazioni desiderate con i dati del messaggio
          // Ad esempio, salva il messaggio nel database o invia una risposta
  
          console.log('Messaggio in arrivo:', {
            phoneNumberId,
            from,
            text,
          });
        });
  
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }
    }
  };*/

  exports.postWebhookWhats = async(req, res) =>{
    try {

        var entry = (req.body["entry"])[0];
        var changes = (entry["changes"])[0];
        var value = changes["value"];
        var messageObject = value["messages"][0];
        var contactsObject = value["contacts"][0];
        var profile = contactsObject["profile"];
        var name = profile["name"];
        var phoneNumber = messageObject["from"];
        var text = messageObject["text"];
        var textContent = text["body"];

        const formattedPhoneNumber = phoneNumber.replace("+39", "").replace(/\s/g, "");
        console.log(formattedPhoneNumber, textContent, name);

        const chat = await Chat.findOne({ numeroTelefono: formattedPhoneNumber });

    if (chat) {

      chat.messages.push({
        content: textContent,
        sender: 'lead',
        timestamp: new Date()
      });

      await chat.save();
      console.log('chat salvata');
    } else {
      const existingLead = await LeadWhatsapp.findOne({ number: formattedPhoneNumber });
    
      if (existingLead) {
        // Se esiste già un lead con lo stesso numero, aggiungi il messaggio all'array dei messaggi
        existingLead.messages.push(textContent);
        existingLead.timestamp = new Date();
        await existingLead.save();
        console.log('Messaggio aggiunto al lead esistente');
      } else {
        // Se non esiste un lead con lo stesso numero, crea un nuovo lead con il messaggio
        const lead = new LeadWhatsapp({
          number: formattedPhoneNumber,
          name: name,
          messages: [textContent],
          timestamp: new Date(),
        });
    
        await lead.save();
        console.log('Nuovo lead salvato');
      }
    }

        res.send("EVENT_RECEIVED"); //ALWAYS RETURN THIS
    } catch (e) {
        console.log(e);
        res.send("EVENT_RECEIVED"); //ALWAYS RETURN THIS
    }
}


  exports.getChatsByUserId = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const chats = await Chat.find({ userId: userId }).populate('leadId');
  
      res.json({ success: true, chats });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, error: 'Failed to retrieve chats' });
    }
  };

  exports.sendAndSaveMessage = async (req, res) => {
    console.log(req.body); 
    const { message, phoneNumber, leadId, userId } = req.body;
    const url = 'https://graph.facebook.com/v16.0/110634705392398/messages';     
    const config = {
        headers: {
          'Authorization': `Bearer ${accessToken2}`,
          'Content-Type': 'application/json'
        }
      };
      
      const data = {
        recipient_type: "individual",
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      };
    try {


      // Invia il messaggio tramite WhatsApp Business API
      const response = await axios.post(url, data, config);
      console.log('Messaggio inviato con successo!', response.data);
      // Verifica se l'invio del messaggio è stato eseguito con successo
      if (response.status === 200) {
        // Aggiorna la chat nel database con il nuovo messaggio
        const chat = await Chat.findOneAndUpdate(
          { userId, leadId, numeroTelefono: phoneNumber  },
          {
            $push: {
              messages: {
                content: message,
                sender: 'user',
                timestamp: new Date()
              }
            }
          },
          { upsert: true, new: true }
        );
  
        console.log('Messaggio inviato con successo e chat aggiornata:', chat);
        res.json(200);
      } else {
        console.log('Si è verificato un errore durante l\'invio del messaggio');
      }
    } catch (error) {
      console.error('Errore durante l\'invio del messaggio:', error);
    }
  };


 /* exports.handleIncomingMessage = async (req, res) => {
    const { contacts, messages } = req.body;
  
    try {
      // Estrai il numero del mittente dal primo messaggio
      const senderNumber = messages[0].from;
  
      // Trova la chat corrispondente nel database
      const chat = await Chat.findOne({ 'leadId.numeroTelefono': senderNumber });
  
      if (chat) {
        // Aggiungi il messaggio alla chat esistente
        chat.messages.push({
          content: messages[0].text.body,
          sender: 'lead',
          timestamp: new Date()
        });
  
        // Salva la chat aggiornata nel database
        await chat.save();
  
        res.json({ success: true, message: 'Messaggio salvato correttamente' });
      } else {
        res.status(404).json({ success: false, error: 'Chat non trovata' });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, error: 'Errore durante la gestione del messaggio' });
    }
  };*/




