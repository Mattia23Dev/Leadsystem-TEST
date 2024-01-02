const LeadFacebook = require('../models/leadFacebook');
const token_whatsapp = 'EAAN2JZAnVsjYBAKwP53KCE3zLSWoSrYjG6lAVvIeuz2ttiRMYPdCeJiu9elzIEfYYRWeTGpwJjZB7V4SdXZBarKk1JJ7rEZAkgZBzHlGkKW7QFLXmrAasZBmr58r7seZC0edXZAZCZArql9ZCo4ZACzANx8ZCi77UJdrElOCHtzErgItwmZBj1SmYw64Bi';
const showDebugingInfo = true; 
'use strict';
const cron = require('node-cron');
const axios = require('axios');
const LeadTag = require('../models/leadTag');
const TokenIndex = require('../models/tokenIndex');

const accessToken = 'EAAN2JZAnVsjYBOZCrlKp7tg8OK1KZB7rUmFE0GyTEqj2oYi100gOETlxm3DZAofXjZAoYBgOw4cfEjVRjGZAZBb4UblHegfkJZAezIlRmPYqYM5OocZAYYdt8qADJU734PA00umZAcg0KxXYoyUjdJqzBK5L7IV5CiNe3uXEflWIog5xZALyri7iOfY8E0sgbbo2lKjM9CrWrDl';
const accessToken2 = 'EAAN2JZAnVsjYBO8QcsbJUrVhmiqa4ESXom6S4gzjLaahCpJOsETECwRGT1um6vKNJB3g7rSYr1kHGwddzLIZCBuK7AeHUytsBniL0ExZCMH5MDgxteHpi3AoIGgHW16A4VVKaTVOLNra4wIcZCQb50DWCnoZA0p7oVhXAmbINM2Yng1aiZBRaLHyLIjsbk22HW0hKM4f05';
const apiUrl = 'https://graph.facebook.com/v12.0';
const idCampagna = '23858081191190152'; //ECP [LEAD ADS] - LAL Vendite - vantaggi VIDEO
const idCampagna2 = '23859089103880152'; //ECP - [LEAD ADS] - Master
const fields = 'id,name,objective,status,adsets{name},ads{name,leads{form_id,field_data}}';

//LEADS NORMALI
const TOKENMIO = "EAAN2JZAnVsjYBO5Jg2quqzNrlwYQWZBj7tBxZA7YYycKupfuXbZCjPzhQFFJYOsOIxdGOraeEkxwZAthemgCRtMmQQgCw5OiRrFAkgUPweUYCzdTABNtta5K9LWwU0Dp7xcTBJCqMC6dz0wJiiQnAA4gQRgAkp1XMOkyjQwHkNoUZCwqy9tPbyHEfb8sRH4c0xa6slxKDo";
const TOKEN6 = "EAAN2JZAnVsjYBOyoghmZA1aIMLL0CdkLpObaimb4KZB7arXLR8YHVasUCBCdWukAhK2lcRFaGbZCpbdjZBFzj1IqONeGZAuyqwtGUODTHTNZAfU8gVDJfSaUB0mDj4ONTXVIyOcmNOKg723ZBdpc0DHJ0XztasveWzUbpUWz8LDjruiVXpZCj08n9nMZBX";
const TOKEN2 = "EAAN2JZAnVsjYBO7v70h0hqxThHRWMSEs59JeFAweUeWFw6vzT7EDVijoWkwcdtMtHOwIhHiAFCtEGqXbFYWHZAkB16Rxp5id9RQTrSVxrD0gSZA4ufZBR7IDZBdRY3O5uanv0wPKxTvroAfA8WDTNgOLPXVVNQRm4gEoVaqntUEAme2UC62QxIAZDZD";
const TOKEN3 = "EAAN2JZAnVsjYBO4HP9oiGEoanliBVsCIi4e4M4MBSo1wz7T0iYb9X0rqkKnZA7muzjl39MXZClLvsdviiVGkCCmpBGaPB3L3bN0Gf2QDXa7ZABq4ZAP6aLTZCZBmPXocd0RJJKdvsRloHHJKrNOigbudvkN8gRoaNqNBKBfVqZAEDKJw7Rh74dMc6wZDZD";
const TOKEN4 = "EAAN2JZAnVsjYBO9pFmrCNvQHeCr8YZBlJKNHIuk2wdcZAqEhBlf0cVmTHLug1DldiIArA4OeuNRgSLvpeQulVOmmYfMsZCOiWbWEdbA5LvZC8XrzcZB5LZBL4Q1ahU4NWmZBb68u7fNCLr9OB639ZA4oNGiKGxw5b5Ok1iZA7ftz0BFesLxCymbjTTrerGAqIY1MH4lWUTZCs1k";
const TOKEN5 = "EAAN2JZAnVsjYBOwUvFMFNOQ60iP0h92b7zZAmPfIhpRxdSKdxkdLREwFh42WqidZCKWN4skQBtEnzN8MejmG7CJ8s6nv3f7ZB35aX9UjoRZBiZBLgoUzSAK3ZA87h8AZAjxIOsBqTiIIrQo9D4KZBeAztxbVhvNyWY7UCSx2I0brVF8WaKPfp14SZBYjUA";
const TOKEN1 = "EAAN2JZAnVsjYBO5p5tZB9EST7ObjNhFo9pTebPFTdSYOFttfJBVkt0GXcChS3dZCdDJbXgtfLjJqUDBQo3iM45v82xhny30hpQPWuaVg5nY1AgxvkKj458d8iwX4jSxVO8boORyWKT5pMTyAMLkrGWOuH6Qq4mQhb2jTU5ivFHHyrTTBpxCz5T4PGg6wi8kWBoJqIfE";
const { GoogleAdsApi, enums  } = require('google-ads-api');
const tokens = [TOKEN1, TOKEN2, TOKEN3, TOKEN4, TOKEN5, TOKEN6];

const updateTokenIndex = async() => {
    try {
      const numTokens = tokens.length;
      const tokenIndex = await TokenIndex.findOne();
      if (tokenIndex) {
        tokenIndex.index = (tokenIndex.index + 1) % numTokens;
        await tokenIndex.save();
        console.log('Indice dei token aggiornato.');
      } else {
        console.log('Indice dei token non trovato');
      }
    } catch (error) {
      console.log('Errore nell\'aggiornamento dell\'indice dei token', error);
    }
}

 const saveLeadFromFacebookAndInstagram = async (logs) => {
  const leads = logs;

  if (Array.isArray(leads)) {
    const formattedLeads = leads.map((lead) => {
      return {
        formId: lead.formId,
        fieldData: Array.isArray(lead.fieldData)
          ? lead.fieldData.map((data) => {
              return {
                name: data.name,
                values: data.values,
              };
            })
          : [],
        id: lead.id ? lead.id : '',
        data: new Date(),
        annunci: lead.annunci ? lead.annunci : '',
        adsets: lead.adsets ? lead.adsets : '',
        name: lead.name ? lead.name : '',
      };
    });

    const existingLeads = await LeadFacebook.find({ id: { $in: formattedLeads.map((lead) => lead.id) } });

    const newLeads = formattedLeads.filter((lead) => {
      return !existingLeads.some((existingLead) => existingLead.id === lead.id);
    });

    // Salva i nuovi lead nel database
    if (newLeads.length > 0) {
      LeadFacebook.insertMany(newLeads)
        .then(() => {
          console.log('Dati dei lead Pegaso salvati nel database', newLeads);
        })
        .catch((error) => {
          console.error('Errore nel salvataggio dei lead Pegaso nel database:', error);
        });
    } else {
      console.log('Nessun nuovo lead Pegaso da salvare nel database');
    }
  } else {
    console.log('Dati Lead Pegaso non validi');
  }
};

  const saveLeadFromFacebookAndInstagramTag = async (response, campagnaId) => {
    if (!response.leads || !response.leads.data) {
      console.log('response.leads.data è undefined o null');
      return;
  }
    const leads = response.leads.data;
  
    if (Array.isArray(leads)) {
      const formattedLeads = leads.map((lead) => {
        return {
          formId: lead.formId,
          fieldData: Array.isArray(lead.field_data)
            ? lead.field_data.map((data) => {
                return {
                  name: data.name,
                  values: data.values,
                };
              })
            : [],
          id: lead.id,
          data: new Date(),
          annunci: lead.annunci ? lead.annunci : '',
          adsets: lead.adsets ? lead.adsets : '',
          name: lead.name ? lead.name : '',
        };
      });
  
      // Verifica se i lead esistono già nel database
      const existingLeads = await LeadTag.find({ id: { $in: formattedLeads.map((lead) => lead.id) } });
  
      const newLeads = formattedLeads.filter((lead) => {
        return !existingLeads.some((existingLead) => existingLead.id === lead.id);
      });
  
      // Salva i nuovi lead nel database
      if (newLeads.length > 0) {
        LeadTag.insertMany(newLeads)
          .then(() => {
            console.log('Dati dei lead TAG salvati nel database', newLeads);
          })
          .catch((error) => {
            console.error('Errore nel salvataggio dei lead TAG nel database:', error);
          });
      } else {
        console.log('Nessun nuovo lead TAG da salvare nel database');
      }
    } else {
      console.log('Dati dei lead TAG non validi');
    }
  };

  exports.getTagLeads = () => {
    axios
      .get(`${apiUrl}/${idCampagna}`, {
        params: {
          fields,
          access_token: accessToken,
        },
      })
      .then((response) => {
        response.data.ads.data.forEach((ad) => {
          saveLeadFromFacebookAndInstagramTag(ad, idCampagna);
        });
      })
      .catch((error) => {
        console.error('Errore nella richiesta:', error);
      });
  };

  exports.getTagLeads2 = () => {
    axios
      .get(`${apiUrl}/${idCampagna2}`, {
        params: {
          fields,
          access_token: TOKENMIO,
        },
      })
      .then((response) => {
        console.log(response.data.ads.data);
        response.data.ads.data.forEach((ad) => {
          saveLeadFromFacebookAndInstagramTag(ad, idCampagna2);
        });
      })
      .catch((error) => {
        console.error('Errore nella richiesta:', error);
      });
  };

  exports.getPegasoLeads = () => {
    const url = 'https://graph.facebook.com/v17.0/act_881135543153413/campaigns';
    const params = {
      fields: 'effective_status,account_id,id,name,objective,status,adsets{name},ads{name,leads{form_id,field_data}}',
      effective_status: "['ACTIVE']",
      access_token: TOKEN1,
    };

    axios.get(url, { params })
      .then(response => {
        const dataFromFacebook = response.data.data;
        const logs = [];
        if (Array.isArray(dataFromFacebook)) {
          for (const element of dataFromFacebook) {
            const excludedCampaignIds = [idCampagna, idCampagna2];
            //PER ESCLUDERE LE CAMPAGNE
            /*if (excludedCampaignIds.includes(element.id)) {
              console.log('Ho escluso:', element.id);
              continue;
            }*/

            const { account_id, ads, effective_status, id, name, objective, adsets, status } = element;

            if (ads && ads.data && ads.data.length > 0) {
              for (const ad of ads.data) {
                if (ad.leads && ad.leads.data && ad.leads.data.length > 0) {
                  for (const lead of ad.leads.data) {
                    if (lead && lead.field_data && Array.isArray(lead.field_data)) {
                      const fieldData = lead.field_data;
                      const id = lead.id;
                      const formId = lead.form_id;
                      const log = {
                        fieldData: fieldData,
                        name: name,
                        id: id,
                        formId: formId,
                        annunci: ad.name,
                        adsets: adsets.data[0].name,
                      };
                      logs.push(log);
                    }
                  }
                }
              }
            }
          }
        } else {
          console.error("dataFromFacebook non è un array");
        }
        //updateTokenIndex();
        saveLeadFromFacebookAndInstagram(logs);
      })
      .catch(error => {
        console.error('Errore:', error);
      });

  };

  /*const getAndUpdateTokenIndex = async () => {
    try {
      const tokenIndex = await TokenIndex.findOne();
    if (tokenIndex) {

      const selectedToken = tokens[tokenIndex];
      getPegasoLeads(selectedToken);

    } else {
      console.log('non c\'è il token');
    }
    } catch (error) {
      console.log('Errore nel recupero dell\'indice dei token:', error);
    }
  };*/





   const client = new GoogleAdsApi({
    client_id: "678629363192-330a44sjgh190ugqvpqq8qa6udk4rocs.apps.googleusercontent.com",
    client_secret: "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",
    developer_token: "h5cxrfY_byC-D0z_UANqvg",
  });

  const refreshToken = "ya29.a0AfB_byDkSdf2CRys-Sv_HqdPivTJqra3h8xHNk8rC8be18i7bk-nFIytq0xLR-JCGFng1rt5YQ1Qt6OSjs6E5hw6i0YPhoPdR14fMTlqYK8QUfh1NDB_bt_3M8J-aQXy33HzcdUPVxwlv9WRZXugLeh7x-7mw_OH-9PHaCgYKAVISARESFQGOcNnCd5Ow3LdbtNysF9r2-TxNhQ0171";
  const customer = client.Customer({
    customer_id: "8994832062", 
    login_customer_id: "6660112223",
    refresh_token: refreshToken,
  });
const getCamp = async () => {
  async function getCampaignsData(customer) {
    try {
      const campaigns = await customer.report({
        entity: "campaign",
        attributes: [
          "campaign.id",
          "campaign.name",
          "campaign.bidding_strategy_type",
          "campaign_budget.amount_micros",
        ],
        metrics: [
          "metrics.cost_micros",
          "metrics.clicks",
          "metrics.impressions",
          "metrics.all_conversions",
        ],
        constraints: {
          "campaign.status": enums.CampaignStatus.ENABLED,
        },
        limit: 20,
      });
  
      return campaigns;
    } catch (error) {
      console.error("Errore nel recupero dei dati delle campagne:", error);
      throw error;
    }
  };

  const campaignsData = await getCampaignsData(customer);
  console.log(campaignsData);
  /*const accessToken = 'ya29.a0AfB_byC3POm6uXUDAD_VGodpz5hLP94XmmGeusyAV35N4s-vBtiV2mDUoH6kjLASohm7pkEi7wRxLkjS9gVY18SnSRPY0Dkfo_QIPPa2STfUfWeAYiKJZPxnUleLaltjGgJTEuBOCVkpck6PFF3PYr9AkEleqdo5Ra_HaCgYKAT4SARESFQGOcNnCfOajDmATT8c_o-BwYneT4A0171';
const developerToken = 'h5cxrfY_byC-D0z_UANqvg';

const headers = {
  Authorization: `Bearer ${accessToken}`,
  'developer-token': developerToken,
};

axios.get('https://googleads.googleapis.com/v1/customers:listAccessibleCustomers', { headers })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    // Gestisci gli errori qui
    console.error('Errore nella richiesta:', error.message);
  });*/
};

//getCamp();































// ABBIAMO CAMBIATO LA LOGICA, NON SERVE PIù LA CHIAMATA DAL FRONTEND


    /*exports.saveLeadFromFacebookAndInstagram = async (req, res) => {
    const leads = req.body.leads;
  
    if (Array.isArray(leads)) {
      const formattedLeads = leads.map((lead) => {
        return {
          formId: lead.formId,
          fieldData: Array.isArray(lead.fieldData)
            ? lead.fieldData.map((data) => {
                return {
                  name: data.name,
                  values: data.values,
                };
              })
            : [],
          id: lead.id ? lead.id : '',
          data: new Date(),
          annunci: lead.annunci ? lead.annunci : '',
          adsets: lead.adsets ? lead.adsets : '',
          name: lead.name ? lead.name : '',
        };
      });
  
      const existingLeads = await LeadFacebook.find({ id: { $in: formattedLeads.map((lead) => lead.id) } });
  
      const newLeads = formattedLeads.filter((lead) => {
        return !existingLeads.some((existingLead) => existingLead.id === lead.id);
      });
  
      // Salva i nuovi lead nel database
      if (newLeads.length > 0) {
        LeadFacebook.insertMany(newLeads)
          .then(() => {
            console.log('Dati dei lead salvati nel database', newLeads);
            res.status(200).json({ message: 'Dati dei lead salvati nel database' });
          })
          .catch((error) => {
            console.error('Errore nel salvataggio dei lead nel database:', error);
            res.status(500).json({ error: 'Errore nel salvataggio dei lead nel database' });
          });
      } else {
        console.log('Nessun nuovo lead da salvare nel database');
        res.status(200).json({ message: 'Nessun nuovo lead da salvare nel database' });
      }
    } else {
      res.status(400).json({ error: 'Dati dei lead non validi' });
    }
  };*/