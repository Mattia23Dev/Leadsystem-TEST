import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import PriceCard from "../components/cards/PriceCard";
import { UserContext } from "../context";
import MainDash from "../components/MainDash/MainDash";
import Sidebar from "../components/SideBar/Sidebar";
import '../components/MainDash/MainDash.scss';
import { SyncOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

const Home = ({ history }) => {
  const [state, setState] = useContext(UserContext);
  const [prices, setPrices] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const subStatus = localStorage.getItem("sub");
  const [codeVerifyEmail, setCodeVerifyEmail] = useState('');
  const [emailToVerify, setEmailToVerify] = useState('');
  const [emailIsVerify, setEmailIsVerify] = useState('');
  const [otherPrices, setOtherPrices] = useState([]);
  const [saltaAbbonamento , setSaltaAbbonamento] = useState('');

  const TOKEN6 = "EAAN2JZAnVsjYBOyoghmZA1aIMLL0CdkLpObaimb4KZB7arXLR8YHVasUCBCdWukAhK2lcRFaGbZCpbdjZBFzj1IqONeGZAuyqwtGUODTHTNZAfU8gVDJfSaUB0mDj4ONTXVIyOcmNOKg723ZBdpc0DHJ0XztasveWzUbpUWz8LDjruiVXpZCj08n9nMZBX";
  const TOKEN2 = "EAAN2JZAnVsjYBO7v70h0hqxThHRWMSEs59JeFAweUeWFw6vzT7EDVijoWkwcdtMtHOwIhHiAFCtEGqXbFYWHZAkB16Rxp5id9RQTrSVxrD0gSZA4ufZBR7IDZBdRY3O5uanv0wPKxTvroAfA8WDTNgOLPXVVNQRm4gEoVaqntUEAme2UC62QxIAZDZD";
  const TOKEN3 = "EAAN2JZAnVsjYBO4HP9oiGEoanliBVsCIi4e4M4MBSo1wz7T0iYb9X0rqkKnZA7muzjl39MXZClLvsdviiVGkCCmpBGaPB3L3bN0Gf2QDXa7ZABq4ZAP6aLTZCZBmPXocd0RJJKdvsRloHHJKrNOigbudvkN8gRoaNqNBKBfVqZAEDKJw7Rh74dMc6wZDZD";
  const TOKEN4 = "EAAN2JZAnVsjYBO9pFmrCNvQHeCr8YZBlJKNHIuk2wdcZAqEhBlf0cVmTHLug1DldiIArA4OeuNRgSLvpeQulVOmmYfMsZCOiWbWEdbA5LvZC8XrzcZB5LZBL4Q1ahU4NWmZBb68u7fNCLr9OB639ZA4oNGiKGxw5b5Ok1iZA7ftz0BFesLxCymbjTTrerGAqIY1MH4lWUTZCs1k";
  const TOKEN5 = "EAAN2JZAnVsjYBOwUvFMFNOQ60iP0h92b7zZAmPfIhpRxdSKdxkdLREwFh42WqidZCKWN4skQBtEnzN8MejmG7CJ8s6nv3f7ZB35aX9UjoRZBiZBLgoUzSAK3ZA87h8AZAjxIOsBqTiIIrQo9D4KZBeAztxbVhvNyWY7UCSx2I0brVF8WaKPfp14SZBYjUA";
  const TOKEN1 = "EAAN2JZAnVsjYBO5p5tZB9EST7ObjNhFo9pTebPFTdSYOFttfJBVkt0GXcChS3dZCdDJbXgtfLjJqUDBQo3iM45v82xhny30hpQPWuaVg5nY1AgxvkKj458d8iwX4jSxVO8boORyWKT5pMTyAMLkrGWOuH6Qq4mQhb2jTU5ivFHHyrTTBpxCz5T4PGg6wi8kWBoJqIfE";

  const tokens = [TOKEN1, TOKEN2, TOKEN3, TOKEN4, TOKEN5, TOKEN6];
  const updateTokenIndex = async () => {
    try {
      await axios.post('/update-token-index', { numTokens: tokens.length });
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'indice dei token:', error);
    }
  };

  useEffect(() => {
    let result = [];
    const check = () =>
      state &&
      state.user &&
      state.user.subscriptions &&
      state.user.subscriptions.map((sub) => {
        result.push(sub.plan.id);
      });
    check();
    setUserSubscriptions(result);
  }, [state && state.user]);

  useEffect(() => {
    const isPaused = () => {
      state &&
        state.user &&
        state.user.subscriptions &&
        state.user.subscriptions.resumes_at &&
        history.push("/account");
    };

    state && state.user && isPaused();
  }, [state && state.user]);

  const fetchPrices = async () => {
    const { data } = await axios.get("/prices");
    console.log(data);
    const oneTimePrices = data.filter(price => price.type === "one_time");
    const filteredPrices = oneTimePrices.filter(price => {
      return (
        price.transform_quantity &&
        price.transform_quantity.divide_by
      );
    });
    const recurringPrices = data.filter(price => price.type === "recurring");
    localStorage.setItem("prices", JSON.stringify(filteredPrices));
    localStorage.setItem("priceRecurring", JSON.stringify(recurringPrices));
    const basePrice = recurringPrices.filter(price => price.nickname == "Leadsystem - Base Minima");
    const otherPrice = recurringPrices.filter(price => price.nickname !== "Leadsystem - Base Minima");
    setOtherPrices(otherPrice);
    setPrices(basePrice);
    console.log('prezzi', recurringPrices);
  };

  const handleVerifyEmail = async () => {
    try {
      const response = await axios.post('/verify-email', {
        email: emailToVerify,
        codeVerifyEmail: codeVerifyEmail,
      });
  
      toast.success('Email verificata correttamente');
      const user = response.data.user;
      const existingToken = JSON.parse(localStorage.getItem('auth')).token;
      const emailIsVerify200 = user.codeVerifyEmail;

      const updatedAuth = {
        token: existingToken,
        user: user
      };
      setEmailIsVerify(emailIsVerify200);
      localStorage.setItem('auth', JSON.stringify(updatedAuth));
      window.location.reload();
    } catch (error) {
      console.error(error.response.data.error); 
      toast.error('Email non verificata');
    }
  };

  const handleClick = async (e, price) => {
    e.preventDefault();
    if (userSubscriptions && userSubscriptions.includes(price.id)) {
      history.push(`/${price.nickname.toLowerCase()}`);
      return;
    }
    // console.log("plan clicked", price.id);
    if (state && state.token) {
      const { data } = await axios.post("/create-subscription", {
        priceId: price.id,
      });
      window.open(data);
    } else {
      history.push("/register");
    }
  };
//act_881135543153413/campaigns?fields=id,name,objective,status,adsets{name},ads{name,leads{form_id,field_data}}&effective_status=["ACTIVE"]&id=23858081191190152
//23858081191190152?fields=id,name,objective,status,adsets{name},ads{name,leads{form_id,field_data}}
  /*const getRequestFromFacebook = (selectedToken) => {
    const url = 'https://graph.facebook.com/v17.0/act_881135543153413/campaigns';
    const params = {
      fields: 'effective_status,account_id,id,name,objective,status,adsets{name},ads{name,leads{form_id,field_data}}',
      effective_status: "['ACTIVE']",
      access_token: selectedToken,
    };

    axios.get(url, { params })
      .then(response => {
        updateTokenIndex();
        const dataFromFacebook = response.data.data;
        const logs = [];
        if (Array.isArray(dataFromFacebook)) {
          for (const element of dataFromFacebook) {
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
        
        axios.post('/save-leads-facebook', { leads: logs })
          .then(response => {
            console.log('Dati dei lead inviati con successo al backend.', response);
          })
          .catch(error => {
            console.error('Si è verificato un errore durante l\'invio dei dati dei lead:', error);
          });
      })
      .catch(error => {
        console.error('Errore:', error);
      });

  };*/

  useEffect(() => {
    setIsLoading(true);
    const getSubscriptions = async () => {
      const { data } = await axios.get("/subscriptions");
      setSubscriptions(data.data);
      localStorage.setItem("sub", data.data.length);
      const emailIsVerify = state.user.codeVerifyEmail;
      const salta_abbonamento = state.user.saltaAbbonamento;
      console.log(salta_abbonamento);
      setSaltaAbbonamento(salta_abbonamento);
      setEmailIsVerify(emailIsVerify);
      setIsLoading(false);
    };

        //getRequestFromFacebook();

        const getSubscriptionStatus = async () => {
          const { data } = await axios.get("/subscription-status");
          console.log("SUBSCRIPTION STATUS => ", data);
          if (data && data.length === 0) {
            history.push("/");
          } else {
            // update user in local storage
            const auth = JSON.parse(localStorage.getItem("auth"));
            auth.user = data;
            localStorage.setItem("auth", JSON.stringify(auth));
            // update user in context
            setState(auth);
          }
        };
    
        getSubscriptionStatus();

    if (state && state.token) getSubscriptions();
  }, [state && state.token]);

  /*const getAndUpdateTokenIndex = async () => {
    try {
      const response = await axios.get('/get-token-index');
      console.log('RISPOSTA DEL SERVER:' + response);
      const tokenIndex = response.data.index;
  
      const selectedToken = tokens[tokenIndex];
  
  
      getRequestFromFacebook(selectedToken);
    } catch (error) {
      console.error('Errore nel recupero dell\'indice dei token:', error);
    }
  };*/

  useEffect(() => {
    //getAndUpdateTokenIndex();
    fetchPrices();
  }, []);

  const handleSaltaAbbonamento = async() => {
    try {
      const response = await axios.post('/salta-abbonamento', {
        email: state.user.email,
      });
      setState(prevState => ({
        ...prevState,
        user: {
          ...prevState.user,
          saltaAbbonamento: "si"
        }
      }));
      console.log(response);
      setSaltaAbbonamento("si");
    } catch (error) {
      console.error(error); 
    }
  }


  return (
    <div>
    {isLoading ? 
        <div
        className="d-flex justify-content-center fw-bold"
        style={{ height: "90vh" }}
      >
          <div className="d-flex align-items-center">
            <SyncOutlined spin style={{ fontSize: "50px" }} />
          </div>
      </div>
      :
      <div className="big-container">
      {emailIsVerify === 'Verificata' ? 
      subStatus > 0 ?  
      saltaAbbonamento == 'no' ?
      <div className="MainDash-abbonamento">
        <div className="row col-md-6 offset-md-3 text-center">
          <h1 className="pt-5 fw-bold">
           Fai un piano di <font color='#3471CC'>abbonamento con i Lead</font> 
          </h1>
          <p className="lead pb-4">Scegli il tuo piano aggiuntivo.</p>
        </div>

        <div className="plan-price" style={{marginTop: '-0px'}}>
          {otherPrices &&
            otherPrices.map((price) => (
              <PriceCard
                key={price.id}
                price={price}
                handleSubscription={handleClick}
                userSubscriptions={userSubscriptions}
              />
            ))}
        </div>
        <button className="btn-orie" style={{marginTop: '50px'}} onClick={handleSaltaAbbonamento}>Salta abbonamento aggiuntivo</button>
      </div>
      :
      <div>
        <Sidebar />
        <MainDash />
      </div>
      : (
      <div className="MainDash-abbonamento">
        <div className="row col-md-6 offset-md-3 text-center">
          <h1 className="pt-5 fw-bold">
           Fai un piano di <font color='#3471CC'>abbonamento</font> 
          </h1>
          <p className="lead pb-4">Scegli il tuo piano per le tue esigenze, ricorda che senza abbonamento non potrai visualizzare la tabella.</p>
        </div>

        <div className="plan-price home-price-first">
          {prices &&
            prices.map((price) => (
              <PriceCard
                key={price.id}
                price={price}
                handleSubscription={handleClick}
                userSubscriptions={userSubscriptions}
              />
            ))}
        </div>
      </div>
      ) 
      :(
      <div className="form-goup" style={{margin: '0 auto', marginTop: '80px', width: '60%', textAlign: 'center'}}>
      <h2>Verifica l'email</h2>
      <input
        type="text"
        placeholder="Email"
        value={emailToVerify}
        onChange={(e) => setEmailToVerify(e.target.value)}
        className="form-control"
        style={{border: 'none', marginBottom: '10px', borderBottom: '1px solid black', borderRadius: 0, fontSize: '13px'}}
      />
      <input
        type="text"
        placeholder="Code"
        value={codeVerifyEmail}
        onChange={(e) => setCodeVerifyEmail(e.target.value)}
        className="form-control"
        style={{border: 'none', marginBottom: '10px', borderBottom: '1px solid black', borderRadius: 0, fontSize: '13px'}}
      />
      <button className="button-reg" style={{margin:'20px 0px'}}  onClick={handleVerifyEmail}>Verifica l'email</button>
    </div>
    )}
    </div>
  }
  </div>
  );
};

export default Home;
