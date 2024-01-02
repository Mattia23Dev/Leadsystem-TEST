const express = require('express');

const router = express.Router();
const { 
  prices, 
  createSubscription, 
  subscriptionStatus, 
  subscriptions, 
  customerPortal,
  createPayment,
  oneTimePayments,
  getConfirmedPaymentSessions,
  checkPaymentWaitingRoute,
  dailyCap} = require('../controllers/subs');
  const TokenIndex = require('../models/tokenIndex');
  const User = require('../models/user');
const {requireSignin} = require('../middlewares');


router.get("/prices", prices);
router.post("/create-subscription", requireSignin, createSubscription);
router.post("/create-payment", requireSignin, createPayment);
router.get("/subscription-status", requireSignin, subscriptionStatus);
router.get("/subscriptions", requireSignin, subscriptions);
router.get("/payments", requireSignin, oneTimePayments);
router.get("/customer-portal/:userId", requireSignin, customerPortal);
router.get('/payment-session-admin', requireSignin, getConfirmedPaymentSessions);
router.get('/check-payment-waiting', checkPaymentWaitingRoute);
router.post('/modify-daily-cap', dailyCap);

router.post('/update-token-index', async (req, res) => {
  try {
    const numTokens = req.body.numTokens;
    const tokenIndex = await TokenIndex.findOne();
    if (tokenIndex) {
      tokenIndex.index = (tokenIndex.index + 1) % numTokens;
      await tokenIndex.save();
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Indice dei token non trovato' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Errore nell\'aggiornamento dell\'indice dei token' });
  }
});

router.get('/get-token-index', async (req, res) => {
  try {
    const tokenIndex = await TokenIndex.findOne();
    if (tokenIndex) {
      res.json({ index: tokenIndex.index });
    } else {
      res.status(500).json({ error: 'Indice dei token non trovato' });
    }
  } catch (error) {
    res.status(500).json({ error });
    console.log(error);
  }
});

router.post('/enable-notifications', async (req, res) => {
  try {
    const userId = req.body.userId; 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    user.notificationsEnabled = true;
    if (req.body.subscription) {
      user.notificationSubscriptions.push(req.body.subscription);
    }
    await user.save();

    return res.status(200).json({ message: 'Notifiche abilitate per l\'utente', user });
  } catch (error) {
    console.error('Errore nell\'abilitazione delle notifiche:', error);
    res.status(500).json({ message: 'Si è verificato un errore' });
  }
});

module.exports = router;
