import React, { useEffect, useState, useContext } from 'react'
import { SyncOutlined } from "@ant-design/icons";
import Sidebar from '../components/SideBar/Sidebar'
import TopDash from '../components/MainDash/TopDash';
import './dashboard.scss'
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { UserContext } from '../context';
import { SidebarContext } from '../context/SidebarContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';


ChartJS.register(ArcElement, Tooltip, Legend);

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);



export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [state, setState] = useContext(UserContext);
    const [subscriptions, setSubscriptions] = useState([]);
    const [payments, setPayments] = useState();
    const [leadNum, setLeadNum] = useState();
    const [leadNumVenduti, setLeadNumVenduti] = useState();
    const [totalSpending, setTotalSpending] = useState();
    const [allLeads, setAllLeads] = useState([]);
    const [fatturatoVenduti, setFatturatoVenduti] = useState();
    const [nonValidoLeads, setNonValidoLeads] = useState();
    const [nonRispondeLeads, setNonRispondeLeads] = useState();
    const [inLavorazioneLeads, setInLavorazioneLeads] = useState();
    const [opportunitàLeads, setOpportunitàLeads] = useState();
    const [inValutazioneLeads, setInValutazioneLeads] = useState();
    const [nonInteressatoLeads, setNonInteressatoLeads] = useState();
    const [daContattareLeads, setDaContattareLeads] = useState();
    const [vendutiLeads, setVendutoLeads] = useState();
    const [tassoConversione, setTassoConversione] = useState();
    const [percentualeConversione, setPercentualeConversione] = useState();
    const [costoOpportunità, setCostoOpportunità] = useState();
    const [data, setData] = useState(null);
    const [percNonRisp, setPercNonRisp] = useState();
    const [percNonValid, setPercNonValid] = useState();
    const [percVend, setPercVend] = useState();
    const [percOpp, setPercOpp] = useState();
    const [percLav, setPercLav] = useState();
    const [percDaCont, setPercDaCont] = useState();
    const [percValut, setPercValut] = useState();
    const [percNonInt, setPercNonInt] = useState();
    const [isLoadingMin, setIsLoadingMin] = useState(false);
    const [percFatturatoByDate, setPercFatturatoByDate] = useState('100');
    const [percSpesaByDate, setPercSpesaByDate] = useState('100');
    const [costoVendita, setCostoVendita] = useState();

    const [prevPercNonRisp, setPrevPercNonRisp] = useState();
    const [prevPercNonValid, setPrevPercNonValid] = useState();
    const [prevPercValut, setPrevPercValut] = useState();
    const [prevPercNonInt, setPrevPercNonInt] = useState();
    const [prevPercOpp, setPrevPercOpp] = useState();
    const [prevPercVend, setPrevPercVend] = useState();
    const [prevPercInLav, setPrevPercInLav] = useState();
    const [prevPercDaCont, setPrevPercDaCont] = useState();

    const [dataLoaded, setDataLoaded] = useState(false);

    const { isSidebarOpen } = useContext(SidebarContext);
    const containerStyle = {
        transition: 'width 0.3s ease',
    }

    const [dati, SETDati] = useState({
        percFatturato: 32,
        percSpesa: 12,
        percTasso: 12,
        valFatturato: "132.000",
        valSpesa: "12.000",
    });

    const generatePDF = () => {
        console.log('pdf');
        const doc = new jsPDF();
        doc.text('Report mensile', 10, 10);
        const leadNumVendutiPdf = leadNumVenduti > 0 ? leadNumVenduti : 0;
        const nonValidoLeadsPdf = nonValidoLeads.length > 0 ? nonValidoLeads.length : 0;
        const nonRispondeLeadsPdf = nonRispondeLeads.length > 0 ? nonRispondeLeads.length : 0;
        const inLavorazioneLeadsPdf = inLavorazioneLeads.length > 0 ? inLavorazioneLeads.length : 0;
        const daContattareLeadsPdf = daContattareLeads.length > 0 ? daContattareLeads.length : 0;
        const vendutiLeadsPdf = vendutiLeads.length > 0 ? vendutiLeads.length : 0;
        const opportunitàLeadsPdf = opportunitàLeads.length > 0 ? opportunitàLeads.length : 0;
        const tassoConversionePdf = tassoConversione > 0 ? tassoConversione : 0;
        const percentualeConversionePdf = percentualeConversione === undefined ? 'Non calcolabile' : `${percentualeConversionePdf}`;
        const costoOpportunitàPdf = costoOpportunità !== undefined ? `${costoOpportunitàPdf}€` : 'Non calcolabile';
        // Tabella 1: Informazioni generali
        const generalInfoData = [
            ['Pagamenti', `${totalSpending}€`],
            ['Lead totali', leadNum],
            ['Lead venduti', leadNumVendutiPdf],
            ['Spesa totale', `${totalSpending}€`],
            ['Fatturato venduti', `${fatturatoVenduti}€`],
        ];
        doc.text('Informazioni generali', 10, 30);
        doc.autoTable({
            startY: 35,
            head: [['Descrizione', 'Valore']],
            body: generalInfoData,
        });

        // Tabella 2: Dettaglio dei lead
        const leadDetailsData = [
            ['Non validi', nonValidoLeadsPdf],
            ['Non risponde', nonRispondeLeadsPdf],
            ['In lavorazione', inLavorazioneLeadsPdf],
            ['Da contattare', daContattareLeadsPdf],
            ['Venduti', vendutiLeadsPdf],
            ['Opportunità', opportunitàLeadsPdf],
            ['Percentuale non validi', `${percNonValid}%`],
            ['Percentuale non risponde', `${percNonRisp}%`],
            ['Percentuale in lavorazione', `${percLav}%`],
            ['Percentuale da contattare', `${percOpp}%`],
            ['Percentuale venduti', `${percVend}%`],
            ['Percentuale Da contattare', `${percDaCont}%`],
            ['Tasso di conversione', tassoConversionePdf],
            ['Percentuale di conversione', `${percentualeConversionePdf}`],
            ['Costo opportunità', `${costoOpportunitàPdf}`],
        ];
        doc.text('Dettaglio dei lead', 10, doc.autoTable.previous.finalY + 10);
        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 15,
            head: [['Descrizione', 'Valore']],
            body: leadDetailsData,
        });

        // Salva il documento come file PDF
        doc.save('report.pdf');
    };

    const fetchLeads = async (totalSpending) => {

        try {
            const response = await axios.post('/get-leads-manual', {
                _id: state.user._id
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            console.log(response.data);
            setAllLeads(response.data);

            const vendutoLeads = response.data.filter(lead => lead.esito === 'Venduto');
            const daContattareLeads = response.data.filter(lead => lead.esito === 'Da contattare');
            const inLavorazioneLeads = response.data.filter(lead => lead.esito === 'In lavorazione');
            const nonRispondeLeads = response.data.filter(lead => lead.esito === 'Non risponde');
            const nonValidoLeads = response.data.filter(lead => lead.esito === 'Non valido');
            const opportunitàLeads = response.data.filter(lead => lead.esito === 'Opportunità');
            const inValutazioneLeads = response.data.filter(lead => lead.esito === 'In valutazione');
            const nonInteressatoLeads = response.data.filter(lead => lead.esito === 'Non interessato');
            console.log(daContattareLeads);
            // Calcola la somma dei fatturati per i lead venduti
            const fatturatoVendutiNormal = vendutoLeads.reduce((sum, lead) => sum + parseInt(lead.fatturato), 0);
            const fatturatoVenduti = fatturatoVendutiNormal.toLocaleString('it-IT', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });

            // Imposta i risultati nei rispettivi stati

            setVendutoLeads(vendutoLeads);
            setDaContattareLeads(daContattareLeads);
            setNonRispondeLeads(nonRispondeLeads);
            setNonValidoLeads(nonValidoLeads);
            setFatturatoVenduti(fatturatoVenduti);
            setInLavorazioneLeads(inLavorazioneLeads);
            setOpportunitàLeads(opportunitàLeads);
            setInValutazioneLeads(inValutazioneLeads);
            setNonInteressatoLeads(nonInteressatoLeads);

            const leadNumVendutiRes = response.data.filter(lead => lead.esito === 'Venduto');
            const leadNumRes = response.data.length;
            setLeadNum(leadNumRes);
            setLeadNumVenduti(leadNumVendutiRes);
            if (totalSpending && totalSpending > 0) {
                if (vendutoLeads && daContattareLeads) {
                    const tassoConversioneSet = ((vendutoLeads.length) / leadNumRes ).toFixed(2);
                    const percentualeConversione = ((vendutoLeads.length) / leadNumRes).toFixed(2);
                    const costoOpportunitàSetNormal = daContattareLeads.length > 0 ? (totalSpending) / daContattareLeads.length : 0;
                    const costoOpportunitàSet = costoOpportunitàSetNormal.toLocaleString('it-IT', {
                        style: 'decimal',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    const costoVenditaNormal = vendutoLeads.length > 0 ? (totalSpending / vendutoLeads.length) : 0;
                    const costoVendita = costoVenditaNormal.toLocaleString('it-IT', {
                        style: 'decimal',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    setTassoConversione(tassoConversioneSet);
                    setCostoOpportunità(costoOpportunitàSet);
                    setPercentualeConversione(percentualeConversione);
                    setCostoVendita(costoVendita);
                }
            } else {
                    setTassoConversione(0);
                    setCostoOpportunità(0);
                    setPercentualeConversione(0);
                    setCostoVendita(0);
            }

            //setIsLoading(false);

        } catch (error) {
            console.error(error.message);
        }
    };

    const getPayments = async () => {
        const { data } = await axios.get("/payments");
        console.log(data);
        const totalSpesaNormal = (data.payments.reduce((sum, payment) => sum + payment.amount_total, 0)) / 100;
        localStorage.setItem("payments", JSON.stringify(data));
        const totalSpesa = totalSpesaNormal.toLocaleString('it-IT', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          const totalSpesaNumber = parseFloat(totalSpesa);
          console.log(totalSpesa, totalSpesaNumber);
        setPayments(totalSpesa);
        setTotalSpending(totalSpesaNormal);
        if (totalSpesa) {
            fetchLeads(totalSpesaNormal);
        } else {
            fetchLeads(0);
        }

        setIsLoading(false);

    };

    useEffect(() => {

        getPayments();


    }, []);


    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");  

    const isDateWithinRange = (date, startDate, endDate) => {
        const dateObj = new Date(date);
        return dateObj >= startDate && dateObj <= endDate;
      };
    
      const calculateLeadsByDate = (startDate, endDate) => {

        const paymentsAll = JSON.parse(localStorage.getItem('payments'));
        const pagamentiFiltrati = paymentsAll.filter(payment => isDateWithinRange(payment.created * 1000, startDateObj, endDateObj));
        const totalSpesaNormal = (pagamentiFiltrati.reduce((sum, payment) => sum + payment.amount_total, 0) / 100);
        const totalSpesa = totalSpesaNormal.toLocaleString('it-IT', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          const totalSpesaNumber = parseFloat(totalSpesa);

      
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
      
        const vendutoLeads = allLeads.filter(
          lead => lead.esito === 'Venduto' && isDateWithinRange(lead.dataCambiamentoEsito, startDateObj, endDateObj)
        );
      
        const daContattareLeads = allLeads.filter(
          lead => lead.esito === 'Da contattare' && isDateWithinRange(lead.dataCambiamentoEsito, startDateObj, endDateObj)
        );

        const inLavorazioneLeads = allLeads.filter(
            lead => lead.esito === 'In lavorazione' && isDateWithinRange(lead.dataCambiamentoEsito, startDateObj, endDateObj)
          );

          const nonRispondeLeads = allLeads.filter(
            lead => lead.esito === 'Non risponde' && isDateWithinRange(lead.dataCambiamentoEsito, startDateObj, endDateObj)
          );

          const opportunitàLeads = allLeads.filter(
            lead => lead.esito === 'Opportunità' && isDateWithinRange(lead.dataCambiamentoEsito, startDateObj, endDateObj)
          );

          const nonValidoLeads = allLeads.filter(
            lead => lead.esito === 'Non valido' && isDateWithinRange(lead.dataCambiamentoEsito, startDateObj, endDateObj)
          );

          const inValutazioneLeads = allLeads.filter(
            lead => lead.esito === 'In valutazione' && isDateWithinRange(lead.dataCambiamentoEsito, startDateObj, endDateObj)
          );

          const nonInteressatoLeads = allLeads.filter(
            lead => lead.esito === 'Non interessato' && isDateWithinRange(lead.dataCambiamentoEsito, startDateObj, endDateObj)
          );
      
        const fatturatoVendutiNormal = vendutoLeads.reduce((sum, lead) => sum + parseInt(lead.fatturato), 0);
        const fatturatoVenduti = fatturatoVendutiNormal.toLocaleString('it-IT', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        

        if (totalSpesa && totalSpending > 0) {
            if (vendutoLeads && daContattareLeads) {
                const tassoConversioneSet = ((vendutoLeads.length) / leadNum ).toFixed(2);
                const percentualeConversione = ((vendutoLeads.length) / leadNum).toFixed(2);
                const costoOpportunitàSetNormal = daContattareLeads.length > 0 ? (totalSpesaNumber) / daContattareLeads.length : 0;
                const costoOpportunitàSet = costoOpportunitàSetNormal.toLocaleString('it-IT', {
                    style: 'decimal',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
                const costoVenditaNormal = vendutoLeads.length > 0 ? (totalSpending / vendutoLeads.length) : 0;
                const costoVendita = costoVenditaNormal.toLocaleString('it-IT', {
                    style: 'decimal',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
                setTassoConversione(tassoConversioneSet);
                setCostoOpportunità(costoOpportunitàSet);
                setPercentualeConversione(percentualeConversione);
                setCostoVendita(costoVendita);
            }
        }

        if (nonRispondeLeads && nonValidoLeads && daContattareLeads && vendutoLeads) {
            //const totalLeads = allLeads.filter(lead => isDateWithinRange(lead.data, startDateObj, endDateObj)).length;
            const totalNonRisponde = nonRispondeLeads.length;
            const totalNonValido = nonValidoLeads.length;
            const totalOpportunita = opportunitàLeads.length;
            const totalVenduti = vendutoLeads.length;
            const totalLavorazione = inLavorazioneLeads.length;
            const totalDaContattare = daContattareLeads.length;
            const totalInValutazione = inValutazioneLeads.length;
            const totalNonInteressato = nonInteressatoLeads.length;
            const totalLeads = totalNonRisponde + totalNonValido + totalOpportunita + totalVenduti + totalDaContattare+ totalLavorazione + totalInValutazione + totalNonInteressato;

            const percNonRisp = totalLeads !== 0 ? (totalNonRisponde / totalLeads * 100).toFixed(1) : 0;
            const percNonValid = totalLeads !== 0 ? (totalNonValido / totalLeads * 100).toFixed(1) : 0;
            const percOpp = totalLeads !== 0 ? (totalOpportunita / totalLeads * 100).toFixed(1) : 0;
            const percVend = totalLeads !== 0 ? (totalVenduti / totalLeads * 100).toFixed(1) : 0;
            const percInLav = totalLeads !== 0 ? (totalLavorazione / totalLeads * 100).toFixed(1) : 0;
            const percInDaCont = totalLeads !== 0 ? (totalDaContattare / totalLeads * 100).toFixed(1) : 0;
            const percInVal = totalLeads !== 0 ? (totalInValutazione / totalLeads * 100).toFixed(1) : 0;
            const percNonInt = totalLeads !== 0 ? (totalNonInteressato / totalLeads * 100).toFixed(1) : 0;

            console.log(totalLeads, percInDaCont, percNonRisp, percOpp, percVend, percInLav);

            setPercNonRisp(percNonRisp);
            setPercNonValid(percNonValid);
            setPercOpp(percOpp);
            setPercVend(percVend);
            setPercLav(percInLav);
            setPercDaCont(percInDaCont);
            setPercNonInt(percNonInt);
            setPercValut(percInVal);


            const newData = {
                labels: [],
                datasets: [
                    {
                        data: [percNonRisp, percNonValid, percOpp, percVend, percInLav, percInDaCont, percInVal, percNonInt],
                        backgroundColor: [
                            '#E849D8',
                            '#3471CC',
                            '#FBBC05',
                            '#30978B',
                            '#973030',
                            '#000000',
                            '#01594f',
                            '#655528',
                        ],
                        borderColor: [
                            '#E849D8',
                            '#3471CC',
                            '#FBBC05',
                            '#30978B',
                            '#973030',
                            '#000000',
                            '#01594f',
                            '#655528',
                        ],
                        borderWidth: 0,
                    },
                ],
            };

            setData(newData);
            setDataLoaded(true);
        }
      
        // Imposta i risultati negli stati
        console.log(pagamentiFiltrati);
        setVendutoLeads(vendutoLeads);
        setDaContattareLeads(daContattareLeads);
        setFatturatoVenduti(fatturatoVenduti);
        setTotalSpending(totalSpesaNormal);
        // Altri calcoli e set degli stati...
      };

    const handleDateSelection = () => {
        console.log(startDate, endDate);
    
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
    
        const previousStartDate = new Date(startDateObj);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
    
        const selectedInterval = Math.floor(
          (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
        );
        const previousInterval = Math.floor(
          (startDateObj.getTime() - previousStartDate.getTime()) / (1000 * 60 * 60 * 24)
        );
    
        console.log("Intervallo di date selezionato:", startDateObj, "-", endDateObj);
        console.log("Numero di giorni selezionati:", selectedInterval);
        console.log("Intervallo di date precedente:", previousStartDate, "-", startDateObj);
        console.log("Numero di giorni precedenti:", previousInterval);
    
        if (selectedInterval > previousInterval) {
          console.log("L'intervallo di date selezionato è più ampio dell'intervallo precedente.");
        } else if (selectedInterval < previousInterval) {
          console.log("L'intervallo di date selezionato è più stretto dell'intervallo precedente.");
        } else {
          console.log("L'intervallo di date selezionato ha la stessa durata dell'intervallo precedente.");
        }
        calculateLeadsByDate(startDateObj, endDateObj);
        //calculateLeadsByDate(previousStartDate, startDateObj);
      };

      const handleRemoveFilter = () => {
        setDataLoaded(false);
      }

    function Entryesitileft(tit, perc) {
        return (<div>
            <div className="datatit">
                {tit}
            </div>
            <div className="dataperc">
                {perc}%
            </div>
        </div>);
    }

    useEffect(() => {
        if (leadNum && nonRispondeLeads && nonValidoLeads && daContattareLeads && leadNumVenduti) {
            const totalLeads = leadNum;
            const totalNonRisponde = nonRispondeLeads.length;
            const totalNonValido = nonValidoLeads.length;
            const totalOpportunita = opportunitàLeads.length;
            const totalVenduti = leadNumVenduti.length;
            const totalLavorazione = inLavorazioneLeads.length;
            const totalDaContattare = daContattareLeads.length;
            const totalInValutazione = inValutazioneLeads.length;
            const totalNonInteressato = nonInteressatoLeads.length;

            const percNonRisp = (totalNonRisponde / totalLeads * 100).toFixed(1);
            const percNonValid = (totalNonValido / totalLeads * 100).toFixed(1);
            const percOpp = (totalOpportunita / totalLeads * 100).toFixed(1);
            const percVend = (totalVenduti / totalLeads * 100).toFixed(1);
            const percInLav = (totalLavorazione / totalLeads * 100).toFixed(1);
            const percInDaCont = (totalDaContattare / totalLeads * 100).toFixed(1);
            const percInVal = (totalInValutazione / totalLeads * 100).toFixed(1);
            const percNonInt = (totalNonInteressato / totalLeads * 100).toFixed(1);

            setPrevPercInLav(percInLav);
            setPrevPercVend(percVend);
            setPrevPercOpp(percOpp);
            setPrevPercNonValid(percNonValid);
            setPrevPercNonRisp(percNonRisp);
            setPrevPercDaCont(percInDaCont);
            setPrevPercValut(percInVal);
            setPrevPercNonInt(percNonInt);

            const newData = {
                labels: [],
                datasets: [
                    {
                        data: [percNonRisp, percNonValid, percOpp, percVend, percInLav, percInDaCont, percInVal, percNonInt],
                        backgroundColor: [
                            '#E849D8',
                            '#3471CC',
                            '#FBBC05',
                            '#30978B',
                            '#973030',
                            '#000000',
                            '#01594f',
                            '#655528',
                        ],
                        borderColor: [
                            '#E849D8',
                            '#3471CC',
                            '#FBBC05',
                            '#30978B',
                            '#973030',
                            '#000000',
                            '#01594f',
                            '#655528',
                        ],
                        borderWidth: 0,
                    },
                ],
            };

            setData(newData);
        }
    }, [leadNum, nonRispondeLeads, nonValidoLeads, daContattareLeads, leadNumVenduti]);

    const getConversionRate = (day) => {
        const vendutoLeads = allLeads.filter(lead => {
          const dataCambiamentoEsito = new Date(lead.dataCambiamentoEsito).getTime();
          const dayStart = new Date(day).setHours(0, 0, 0, 0);
          const dayEnd = new Date(day).setHours(23, 59, 59, 999);
          return dataCambiamentoEsito >= dayStart && dataCambiamentoEsito <= dayEnd;
        });
      
        if (totalSpending && totalSpending > 0) {
          if (vendutoLeads.length > 0) {
            const tassoConversioneSet = (vendutoLeads.length / leadNum).toFixed(2);
            console.log(tassoConversioneSet);
            return parseFloat(tassoConversioneSet);
          }
        }
      
        return 0;
      };

    const currentDate = new Date(); // Ottieni la data corrente
    const currentDay = currentDate.getDay(); // Ottieni il giorno corrente (0 = Domenica, 1 = Lunedì, ..., 6 = Sabato)
    const labels = []; // Array per le etichette dei giorni
    const dataGiorni = []; // Array per i valori del tasso di conversione

    for (let i = 0; i < 7; i++) {
    const day = new Date(currentDate); // Crea una nuova istanza della data corrente
    day.setDate(currentDate.getDate() - (currentDay - i)); // Imposta la data in base al giorno corrente

    const formattedDay = day.toLocaleDateString('it-IT', { day: 'numeric', month: 'numeric', year: 'numeric' }); // Formatta la data nel formato "20/06/2023"
    labels.unshift(formattedDay); // Aggiungi l'etichetta del giorno corrente all'inizio dell'array
    dataGiorni.unshift(getConversionRate(day));
}
    labels.reverse();
    dataGiorni.reverse();

    const options = {
        responsive: true,
        aspectRatio: 3,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: false
          },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value, index, values) {
                        return (value * 100).toFixed(1) + '%';
                    }
                }
            }
        }
      };

      const graphdata = {
        labels: labels,
        datasets: [
          {
            fill: true,
            // label: 'Dataset 2',
            data: dataGiorni,
            borderColor: 'rgba(52, 113, 204, 0.5)',
            backgroundColor: '#5388D8',
          },
        ],
      };


    const placeholdercake = {
        labels: [],
        datasets: [
            {
                data: [20, 20, 20, 20, 20],
                backgroundColor: [
                    '#D3D3D3',
                    '#D3D3D3',
                    '#D3D3D3',
                    '#D3D3D3',
                    '#D3D3D3',
                    '#D3D3D3',
                ],
                borderColor: [
                    '#D3D3D3',
                    '#D3D3D3',
                    '#D3D3D3',
                    '#D3D3D3',
                    '#D3D3D3',
                    '#D3D3D3',
                ],
                borderWidth: 0,
            },
        ],
    };



    return (
        <div className='dashboard big-container'>
            <Sidebar />
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
                <div className={`${isSidebarOpen ? 'boost-container' : 'boost-container-closed'}`} style={containerStyle}>
                    <TopDash hideexport hideattivi hidecerca generatePdf={generatePDF} />


                    <div className='dashbody'>

                        <div class="datefilter">
                            <h5>Filtra per data</h5>

                            <div id='datewrapper'>
                                <div>
                                    <label><u>Da</u></label>
                                    {/* <input value={!startDate ? "" : new Date(startDate).toISOString().split('T')[0]} type="date" onChange={(e) => setStartDate(e.target.valueAsDate)} /> */}
                                    <input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <label><u>A</u></label>
                                    {/* <input value={!startDate ? "" : new Date(startDate).toISOString().split('T')[0]} type="date" onChange={(e) => setStartDate(e.target.valueAsDate)} /> */}
                                    <input 
                                    style={{ fontSize: "20px", border: "none", color: "#3471cc", backgroundColor: "transparent" }} 
                                    type='date' 
                                    value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                                <button className="button-filter" onClick={handleDateSelection}>Calcola</button>
                                <button className="button-filter" onClick={handleRemoveFilter}>Rimuovi filtro</button>
                            </div>
                        </div>

                        <div className="firstrowdash">
                            <div className="dash1">
                                <div className="tit">
                                    Dasboard <font>fatturato</font>
                                </div>
                                <div className="wrapper">

                                        <div className="column">
                                            <div className="datanum">
                                                <svg width="148" height="148" viewBox="0 0 148 148" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M147.756 73.9216C147.756 89.5323 142.817 104.742 133.646 117.372C124.476 130.001 111.545 139.401 96.7074 144.225C81.8695 149.049 65.8862 149.049 51.0483 144.225C36.2105 139.401 23.2797 130.001 14.1094 117.372L29.0515 106.509C35.9293 115.981 45.6273 123.031 56.7557 126.649C67.8841 130.267 79.8716 130.267 91 126.649C102.128 123.031 111.826 115.981 118.704 106.509C125.582 97.0371 129.286 85.6296 129.286 73.9216H147.756Z" fill="#083476" />
                                                    <path d="M50.7665 3.71024C61.8773 0.0485895 73.6983 -0.920728 85.2566 0.882061C96.8149 2.68485 107.78 7.20821 117.25 14.0799C126.72 20.9515 134.423 29.9751 139.727 40.4079C145.03 50.8407 147.782 62.3845 147.756 74.0893L129.286 74.0474C129.306 65.2688 127.242 56.6109 123.265 48.7863C119.287 40.9617 113.509 34.1941 106.407 29.0403C99.3046 23.8866 91.0807 20.494 82.4119 19.1419C73.7432 17.7899 64.8774 18.5168 56.5443 21.2631L50.7665 3.71024Z" fill="#5388D8" />
                                                    <path d="M14.2936 117.624C7.40094 108.216 2.83157 97.3083 0.959078 85.7941C-0.913419 74.2799 -0.0358786 62.4858 3.51995 51.376C7.07578 40.2662 13.2089 30.1562 21.418 21.8726C29.627 13.5889 39.6788 7.3669 50.7516 3.71516L56.5331 21.2668C48.2286 24.0056 40.6897 28.6721 34.5329 34.8848C28.3762 41.0975 23.7763 48.6801 21.1094 57.0124C18.4426 65.3447 17.7844 74.1903 19.1888 82.826C20.5931 91.4616 24.0202 99.6421 29.1897 106.699L14.2936 117.624Z" fill="#5388D8" />
                                                </svg>
                                                <div id="num">{percFatturatoByDate}%</div>
                                            </div>
                                            <div className="datas">
                                                <div id='datas1'>{fatturatoVenduti}€</div>
                                                <div id='datas2'>Fatturato</div>
                                                <div id='datas3'>
                                                    <svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M0 15L0 9.2246L9 0L18 9.2246V15L9 5.73529L0 15Z" fill="#30978B" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="column">
                                            <div className="datanum">
                                                <svg width="148" height="148" viewBox="0 0 148 148" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M147.756 73.9216C147.756 89.5323 142.817 104.742 133.646 117.372C124.476 130.001 111.545 139.401 96.7074 144.225C81.8695 149.049 65.8862 149.049 51.0483 144.225C36.2105 139.401 23.2797 130.001 14.1094 117.372L29.0515 106.509C35.9293 115.981 45.6273 123.031 56.7557 126.649C67.8841 130.267 79.8716 130.267 91 126.649C102.128 123.031 111.826 115.981 118.704 106.509C125.582 97.0371 129.286 85.6296 129.286 73.9216H147.756Z" fill="#083476" />
                                                    <path d="M50.7665 3.71024C61.8773 0.0485895 73.6983 -0.920728 85.2566 0.882061C96.8149 2.68485 107.78 7.20821 117.25 14.0799C126.72 20.9515 134.423 29.9751 139.727 40.4079C145.03 50.8407 147.782 62.3845 147.756 74.0893L129.286 74.0474C129.306 65.2688 127.242 56.6109 123.265 48.7863C119.287 40.9617 113.509 34.1941 106.407 29.0403C99.3046 23.8866 91.0807 20.494 82.4119 19.1419C73.7432 17.7899 64.8774 18.5168 56.5443 21.2631L50.7665 3.71024Z" fill="#5388D8" />
                                                    <path d="M14.2936 117.624C7.40094 108.216 2.83157 97.3083 0.959078 85.7941C-0.913419 74.2799 -0.0358786 62.4858 3.51995 51.376C7.07578 40.2662 13.2089 30.1562 21.418 21.8726C29.627 13.5889 39.6788 7.3669 50.7516 3.71516L56.5331 21.2668C48.2286 24.0056 40.6897 28.6721 34.5329 34.8848C28.3762 41.0975 23.7763 48.6801 21.1094 57.0124C18.4426 65.3447 17.7844 74.1903 19.1888 82.826C20.5931 91.4616 24.0202 99.6421 29.1897 106.699L14.2936 117.624Z" fill="#5388D8" />
                                                </svg>
                                                <div id="num">{percSpesaByDate}%</div>
                                            </div>
                                            <div className="datas">
                                                <div id='datas1'>{totalSpending > 0 ? (totalSpending.toLocaleString('it-IT', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2,})) : '0'}€</div>
                                                <div id='datas2'>Spesa</div>
                                                <div id='datas3'>
                                                    <svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M18 0V5.7754L9 15L0 5.7754V0L9 9.26471L18 0Z" fill="#973031" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="column">
                                            <div className="datanum">
                                                <svg width="148" height="148" viewBox="0 0 148 148" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M147.756 73.9216C147.756 89.5323 142.817 104.742 133.646 117.372C124.476 130.001 111.545 139.401 96.7074 144.225C81.8695 149.049 65.8862 149.049 51.0483 144.225C36.2105 139.401 23.2797 130.001 14.1094 117.372L29.0515 106.509C35.9293 115.981 45.6273 123.031 56.7557 126.649C67.8841 130.267 79.8716 130.267 91 126.649C102.128 123.031 111.826 115.981 118.704 106.509C125.582 97.0371 129.286 85.6296 129.286 73.9216H147.756Z" fill="#083476" />
                                                    <path d="M50.7665 3.71024C61.8773 0.0485895 73.6983 -0.920728 85.2566 0.882061C96.8149 2.68485 107.78 7.20821 117.25 14.0799C126.72 20.9515 134.423 29.9751 139.727 40.4079C145.03 50.8407 147.782 62.3845 147.756 74.0893L129.286 74.0474C129.306 65.2688 127.242 56.6109 123.265 48.7863C119.287 40.9617 113.509 34.1941 106.407 29.0403C99.3046 23.8866 91.0807 20.494 82.4119 19.1419C73.7432 17.7899 64.8774 18.5168 56.5443 21.2631L50.7665 3.71024Z" fill="#5388D8" />
                                                    <path d="M14.2936 117.624C7.40094 108.216 2.83157 97.3083 0.959078 85.7941C-0.913419 74.2799 -0.0358786 62.4858 3.51995 51.376C7.07578 40.2662 13.2089 30.1562 21.418 21.8726C29.627 13.5889 39.6788 7.3669 50.7516 3.71516L56.5331 21.2668C48.2286 24.0056 40.6897 28.6721 34.5329 34.8848C28.3762 41.0975 23.7763 48.6801 21.1094 57.0124C18.4426 65.3447 17.7844 74.1903 19.1888 82.826C20.5931 91.4616 24.0202 99.6421 29.1897 106.699L14.2936 117.624Z" fill="#5388D8" />
                                                </svg>
                                                <div id="num">{percentualeConversione !== undefined ? (percentualeConversione * 100) : '0'}%</div>
                                            </div>
                                            <div className="datas">
                                                <div id='datas1'>{tassoConversione !== undefined ? tassoConversione : '0'}</div>
                                                <div id='datas2'>Tasso di conversione</div>
                                                <div id='datas3'>
                                                    <svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M0 15L0 9.2246L9 0L18 9.2246V15L9 5.73529L0 15Z" fill="#30978B" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                </div>
                            </div>

                            <div className="dash2">
                                <div className="tit">
                                    Dasboard <font>esiti</font>
                                </div>
                                <div className='wrapper-maxi'>
                                    <h4 style={{textAlign: 'center', marginBottom: '30px'}}>{leadNum ? leadNum : ''} leads totali</h4>
                                <div className="wrapper">
                                {data ? (
                                    dataLoaded ? (
                                        <div className="leftdatas">
                                            {Entryesitileft("Da contattare", percDaCont)}
                                            {Entryesitileft("Non risponde", percNonRisp)}
                                            {Entryesitileft("In lavorazione", percLav)}
                                            {Entryesitileft("Non valido", percNonValid)}
                                            {Entryesitileft("Non interessato", percValut)}
                                            {Entryesitileft("Opportunità", percOpp)}
                                            {Entryesitileft("In valutazione", percNonInt)}
                                            {Entryesitileft("Iscrizione", percVend)}
                                        </div>
                                    ) : (
                                        <div className="leftdatas">
                                            {Entryesitileft("Da contattare", prevPercDaCont)}
                                            {Entryesitileft("Non risponde", prevPercNonRisp)}
                                            {Entryesitileft("In lavorazione", prevPercInLav)}
                                            {Entryesitileft("Non valido", prevPercNonValid)}
                                            {Entryesitileft("Non interessato", prevPercNonInt)}
                                            {Entryesitileft("Opportunità", prevPercOpp)}
                                            {Entryesitileft("In valutazione", prevPercValut)}
                                            {Entryesitileft("Iscrizione", prevPercVend)}
                                        </div>
                                    )
                                    ) : (
                                    <div className="leftdatas">
                                        {Entryesitileft("Non risponde", 0)}
                                        {Entryesitileft("Non valido", 0)}
                                        {Entryesitileft("Opportunità", 0)}
                                        {Entryesitileft("Iscrizione", 0)}
                                        {Entryesitileft("In lavorazione", 0)}
                                        {Entryesitileft("Da contattare", 0)}
                                    </div>
                                    )}
                                    <div className="rightdatas">
                                        {data ?
                                            <Doughnut data={data} />
                                            :
                                            <Doughnut data={placeholdercake} />
                                        }
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>

                        <div className="secondrowdash">
                            <div className="leftdash">
                                <div className="intro">
                                    <div className="tit">
                                        Dashboard <font>andamento temporale</font>
                                    </div>
                                    <div className="subtit">
                                        Conversion rate nel tempo
                                    </div>
                                </div>
                                <div className="realdata">
                                    <Line options={options}
                                        data={graphdata} />
                                </div>
                            </div>
                            <div className="rightdash">
                                <div className="costirow">
                                    <div className="tit">Costo per <font>opportunità</font></div>
                                    <div className="number">{costoOpportunità !== undefined ? costoOpportunità : '0'}€</div>
                                </div>
                                <div className="costirow">
                                    <div className="tit">Costo per <font>venduto</font></div>
                                    <div className="number">{costoVendita !== undefined ? costoVendita : '0'}€</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}
