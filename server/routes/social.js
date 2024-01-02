const express = require('express');
const router = express.Router();
const { saveFacebookLeads, saveWhatsLead, saveGoogleLead, getWebhook, postWebhook } = require('../controllers/social');
//const {saveLeadFromFacebookAndInstagram} = require('../controllers/Facebook');
const { getWebhookWhats, postWebhookWhats, getChatsByUserId, sendAndSaveMessage } = require('../controllers/whatsapp');
const { getDataFromWordpress } = require('../controllers/wordpress');

//router.post('/facebook/leads', saveFacebookLeads);
//router.post('/whatsapp/leads', saveWhatsLead);
//router.post('/google-form-webhook', verifyApiKey, saveGoogleLead);
router.get('/webhook', getWebhook);
router.post('/webhook', postWebhook);
//router.post('/save-leads-facebook', saveLeadFromFacebookAndInstagram);
router.get('/webhook-whats', getWebhookWhats);
router.post('/webhook-whats', postWebhookWhats);

/* WHATSAPP*/

router.post('/sendMessageWa', sendAndSaveMessage);
router.get('/getchats/:userId', getChatsByUserId);

/*WORDPRESS */
//https://hooks.zapier.com/hooks/catch/5079718/34zt6pc/
//https://0a2b-2001-b07-a72-213b-84eb-68bd-e7ef-bc37.ngrok-free.app/api/get-data-from-wordpress
router.post('/post-data-from-wordpress', getDataFromWordpress);
router.get('/get-data-from-wordpress', getDataFromWordpress);
module.exports = router;