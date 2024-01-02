import React, {useContext, useState} from 'react'
import Sidebar from '../../components/SideBar/Sidebar'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import './faq.css';
import { MdExpandMore } from "react-icons/md";
import TopDash from '../../components/MainDash/TopDash';
import SidebarAdmin from '../../components/SideBar/SidebarAdmin';
import { UserContext } from '../../context';
import { SidebarContext } from '../../context/SidebarContext';

const Faq = () => {
  const [state, setState] = useContext(UserContext);
  const [expanded, setExpanded] = useState("");

  const { isSidebarOpen } = useContext(SidebarContext);
  const containerStyle = {
    transition: 'width 0.3s ease',
  }

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : "");
  };

  const faqList = [
    {
      question: "Come posso aggiungere un nuovo orientatore al sistema?",
      answer:
        "L'aggiunta di un nuovo orientatore può essere effettuata attraverso la sezione dedicata 'Orientatori', dove è possibile gestire, modificare, aggiungere e rimuovere orientatori.",
    },
    {
      question: "Qual è la frequenza media di ricezione dei lead?",
      answer:
        "La nostra piattaforma fornisce in media dai 3 ai 15 lead al giorno",
    },
    {
      question: "Quali sono i passaggi per inserire un nuovo lead nel sistema?",
      answer:
        "L'aggiunta di un nuovo lead può essere effettuata attraverso il pulsante 'Aggiungi lead' situato nella sezione 'Leads'. Si prega di notare che è necessario compilare tutti i campi obbligatori, che includono: nome, cognome, telefono, email e orientatore.",
    },
    {
      question: "Perché non riesco a inserire un nuovo lead?",
      answer:
        "Se riscontri difficoltà nell'inserimento di un nuovo lead, potrebbe essere dovuto al mancato inserimento di tutti i campi obbligatori. Assicurati di aver compilato i campi relativi a nome, cognome, telefono, email e di aver indicato l'orientatore.",
    },
    {
      question: "Potreste fornire una definizione dettagliata degli esiti dei lead?",
      answer:
        "Gli esiti rappresentano le varie fasi del processo di gestione dei lead: 'Da contattare' indica un lead ancora non contattato, 'In lavorazione' indica un lead che è stato contattato, 'Non Interessato' rappresenta un lead che non ha mostrato interesse, 'Opportunità' rappresenta un lead con potenziale interesse, 'In Valutazione' indica un lead in fase di verifica dei requisiti per l'iscrizione, e 'Iscrizione' indica un lead che si è formalmente iscritto.",
    },
    {
      question: "Qual è la procedura per disconnettersi dal sistema?",
      answer:
        "La disconnessione dal sistema può essere effettuata selezionando l'opzione 'Esci' situata nella sezione 'Impostazioni'",
    },
    {
      question: "Come posso alternare tra la visualizzazione a lista e a griglia dei lead?",
      answer:
        "Per alternare tra la visualizzazione a lista e a griglia dei lead, utilizza l'apposito pulsante presente nella sezione 'Leads'. Il pulsante varia il nome a seconda della modalità attiva: 'Visualizza lista' in modalità griglia, e 'Modalità lista' in modalità a griglia.",
    },
    {
      question: "Potreste spiegare in dettaglio cosa includono i diversi piani mensili e i boost?",
      answer:
        "I piani mensili e i boost offrono diversi volumi di lead mensili. Il Piano Base include 50 lead al mese per 1250€, il Piano Intermedio 100 lead al mese per 2500€, e il Piano Avanzato 200 lead al mese per 5000€. Inoltre, l'abbonamento di base, che costa 100€, deve essere aggiunto a ciascuno di questi piani. Esistono anche diversi boost che offrono volumi extra di lead: Boost da 50 lead per 1250€, Middle Boost da 100 lead per 2500€, e Extreme Boost da 500 lead per 12500€. Tutti i prezzi sono al netto dell'IVA.",
    },
    {
      question: "Potreste illustrare le informazioni rappresentate dai vari grafici nella dashboard?",
      answer:
        "La dashboard offre una panoramica visiva del fatturato, con grafici che illustrano il 'Fatturato', la 'Spesa' e il 'Tasso di conversione' in percentuale rispetto al periodo precedente. È inoltre presente un grafico a torta che mostra una distribuzione degli esiti dei lead, oltre a un grafico che rappresenta l'andamento temporale del tasso di conversione.",
    },
    {
      question: "Qual è il processo per l'aggiornamento del mio piano mensile?",
      answer:
        "Per aggiornare il piano mensile, visita la sezione 'Piano mensile' e seleziona l'opzione di upgrade che meglio si adatta alle tue esigenze.",
    },
    {
      question: "Come posso cambiare l'esito di un lead?",
      answer:
        "Per modificare l'esito di un lead, puoi farlo attraverso la funzione 'Modifica' nel profilo del lead oppure, in modalità griglia, trascinando il lead nell'appropriata colonna di esito.",
    },
  ];

  return (
    <div className='big-container'>
       {state.user.role === 'admin' ? <SidebarAdmin /> : <Sidebar />}
       <div className={`${isSidebarOpen ? 'faq-container' : 'faq-container-closed'}`} style={containerStyle}>
          <div className='faq-top' style={{marginTop: '100px'}}>
            {/*<TopDash />*/}
            <h2>Faq</h2>
          </div>
          <div className='faq'>
              {faqList.map((faq, index) => (
              <Accordion key={index} expanded={expanded === `panel${index}`} onChange={handleChange(`panel${index}`)}>
                <AccordionSummary expandIcon={<MdExpandMore />} aria-controls={`panel${index}-content`} id={`panel${index}-header`}>
                  <Typography variant="h6">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        </div>
    </div>
  )
}

export default Faq