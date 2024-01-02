const express = require('express');

const router = express.Router();

const {getLeadsFb, getLeadsAdmin, getLeadsManual, getAllLead, calculateFatturatoByUtente, calculateFatturatoByOrientatore, calculateFatturatoByOrientatoreUser, getLeadsManualWhatsapp, salvaEtichetta, getEtichettaUser} = require('../controllers/leads');
const { createOrientatore, deleteOrientatore, createLead, deleteLead, updateLead, getOrientatori, getLeadDeleted, updateOrientatore, updateLeadEtichette } = require('../controllers/orientatore');
const { getAllLeadForCounter, LeadForMarketing } = require('../controllers/superAdmin');
const { getDataComparaCorsi } = require('../controllers/comparacorsi');

router.post("/get-leads-fb", getLeadsFb);
router.post("/get-leads-manual", getLeadsManual);
router.post("/get-lead-whatsapp", getLeadsManualWhatsapp);
router.post("/get-leads-admin", getLeadsAdmin);
router.post("/create-orientatore", createOrientatore);
router.delete("/delete-orientatore", deleteOrientatore);
router.post('/lead/create/:id', createLead);
router.delete("/delete-lead", deleteLead);
router.put('/lead/:userId/update/:id', updateLead);
router.put('/lead/:userId/update-etichette/:id', updateLeadEtichette);
router.get('/utenti/:id/orientatori', getOrientatori);
router.get('/getAllLeads-admin', getAllLead);
router.get('/calculateFatturatoByUtente', calculateFatturatoByUtente);
router.get('/calculateFatturatoByOrientatore', calculateFatturatoByOrientatore)
router.post('/calculateFatturatoByOrientatoreUser/:id', calculateFatturatoByOrientatoreUser);
router.get('/get-lead-deleted', getLeadDeleted);
router.put('/update-orientatore/:id', updateOrientatore);

router.get('/get-all-leads-for-counter', getAllLeadForCounter);

router.get('/leads-for-marketing', LeadForMarketing);

router.post('/crea-etichetta', salvaEtichetta);
router.get('/get-etichette/:userId', getEtichettaUser);

router.post("/lead-compara-corsi", getDataComparaCorsi);

module.exports = router;