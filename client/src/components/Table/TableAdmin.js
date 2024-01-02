import * as React from "react";
import { useState, useEffect, useContext } from "react";
import './Table2.scss';
import './TableAdmin.scss';
import { DatePicker } from "antd";
import { UserContext } from '../../context';
import axios from "axios";
import PopupModify from "./popupModify/PopupModify";
import { IoIosArrowDown } from 'react-icons/io';
import { SyncOutlined } from "@ant-design/icons";
import { SearchOutlined } from '@ant-design/icons';


export default function TableAdmin() {
  const [state, setState] = useContext(UserContext);
  const [filterValue, setFilterValue] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [esitoOpen, setEsitoOpen] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [popupModify, setPopupModify] = useState(false);
  const [selectedLead, setSelectedLead] = useState();
  const [isLoading, setIsLoading] = useState(false);


  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")



  // const [selectedStatusEsito, setSelectedStatusEsito] = useState({
  //   approved: false,
  //   pending: false,
  //   rejected: false,
  //   contacted: false,
  //   notContacted: false,
  //   noAnswer: false,
  // });


  //per filter esito 
  const [selectedStatusEsito, setSelectedStatusEsito] = useState({
    dacontattare: false,
    inlavorazione: false,
    noninteressato: false,
    opportunita: false,
    invalutazione: false,
    venduto: false,
  });

  const toggleFilter = (filter) => {
    setSelectedStatusEsito((prevFilters) => ({
      ...prevFilters,
      [filter]: !prevFilters[filter],
    }));
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchLeads = async () => {
      console.log(state.user._id);
      try {
        const response = await axios.get('/getAllLeads-admin');

        const filteredTableLead = response.data.map((lead) => {
          const telephone = lead.numeroTelefono ? lead.numeroTelefono.toString() : '';
          const cleanedTelephone =
            telephone.startsWith('+39') && telephone.length === 13
              ? telephone.substring(3)
              : telephone;


          return {
            name: lead.nome,
            surname: lead.cognome,
            email: lead.email,
            date: lead.data,
            telephone: cleanedTelephone,
            status: lead.esito,
            orientatore: lead.orientatori ? lead.orientatori.nome + ' ' + lead.orientatori.cognome : '',
            facoltà: lead.facolta ? lead.facolta : '',
            fatturato: lead.fatturato ? lead.fatturato : '',
            università: lead.università ? lead.università : '',
            campagna: lead.campagna,
            corsoDiLaurea: lead.corsoDiLaurea ? lead.corsoDiLaurea : '',
            oreStudio: lead.oreStudio ? lead.oreStudio : '',
            provincia: lead.provincia ? lead.provincia : '',
            note: lead.note ? lead.note : '',
            id: lead._id,
            fequentiUni: lead.frequentiUni ? lead.fequentiUni : false,
          };
        });
        setFilteredData(filteredTableLead);
        setOriginalData(filteredTableLead);
        localStorage.setItem('table-lead', JSON.stringify(filteredTableLead));
        setIsLoading(false);
        console.log(filteredTableLead);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLeads();
  }, []);


  function handleFilterChange(event) {
    setSelectedFilter(event.target.value);
    console.log(event.target.value);

    // Apri il popup corretto in base all'opzione selezionata
    switch (event.target.value) {
      case "data":
        setCalendarOpen(true);
        document.body.classList.add("overlay");
        break;
      case "esito":
        setEsitoOpen(true);
      default:
        break;
    }
  }

  const handleNameChange = (event) => {
    setFilterValue(event.target.value);
  };

  useEffect(() => {
    const filteredDataIn = filteredData.filter((row) => {
      const filterNum = parseInt(filterValue);
      if (!isNaN(filterNum)) {
        return typeof row.telephone === 'string' && row.telephone.startsWith(filterValue);
      } else {
        return row.name && row.name.toLowerCase().startsWith(filterValue.toLowerCase());
      }
    }).map((row) => {
      // Crea una nuova array contenente solo gli oggetti che soddisfano il criterio di ricerca
      return {
        name: row.name,
        surname: row.surname,
        date: row.date,
        telephone: row.telephone,
        status: row.status,
        orientatore: row.orientatore,
      };
    });
    setFilteredData(filteredDataIn);
    console.log(filteredDataIn);
  }, [filterValue])

  const handleClickDate = () => {
    const filteredDataNew = filterDataByDate(filteredData, startDate, endDate);
    setFilteredData(filteredDataNew);
    setCalendarOpen(false);
    document.body.classList.remove("overlay");
    console.log(filteredDataNew);
  }

  const handleClickEsito = () => {
    const filteredDataNew = filteredData.filter((row) => {
      // if (selectedStatusEsito.approved && row.status === 'approved') {
      //   return true;
      // } else if (selectedStatusEsito.rejected && row.status === 'rejected') {
      //   return true;
      // } else if (selectedStatusEsito.pending && row.status === 'pending') {
      //   return true;
      // } else if (selectedStatusEsito.contacted && row.status === 'contacted') {
      //   return true;
      // } else if (selectedStatusEsito.noAnswer && row.status === 'not_answer') {
      //   return true;
      // } else if (selectedStatusEsito.notContacted && row.status === 'not_contacted') {
      //   return true;
      // }
      // return false;

      if (selectedStatusEsito.venduto && row.status === 'Venduto') {
        return true;
      } else if (selectedStatusEsito.dacontattare && row.status === 'Da contattare') {
        return true;
      } else if (selectedStatusEsito.inlavorazione && row.status === 'In lavorazione') {
        return true;
      } else if (selectedStatusEsito.invalutazione && row.status === 'In valutazione') {
        return true;
      } else if (selectedStatusEsito.opportunita && row.status === 'Opportunità') {
        return true;
      } else if (selectedStatusEsito.noninteressato && row.status === 'Non interessato') {
        return true;
      }
      return false;


    });
    setFilteredData(filteredDataNew);
    setEsitoOpen(false);
    console.log(filteredDataNew);
  }

  useEffect(() => {
    if (filterValue === '') {
      setFilteredData(originalData);
    }
  }, [filterValue]);

  const filterDataByDate = (data, startDate, endDate) => {
    const filteredData = data.filter((row) => {
      const rowDate = Date.parse(row.date);
      const selectedDateStart = Date.parse(startDate);
      const selectedDateEnd = Date.parse(endDate);
      return rowDate >= selectedDateStart && rowDate < selectedDateEnd;
    });

    return filteredData;
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setFilteredData(originalData);
    setSelectedFilter('');
  };

  const handleModifyPopup = (index) => {
    const leadToModify = filteredData[index];
    setSelectedLead(leadToModify);
    setPopupModify(true);
    document.body.classList.add("overlay");
  }

  const handleClosePopup = () => {
    setPopupModify(false);
  }


  // const formatDate = (inputDate) => {
  //   if (inputDate) {
  //     const [datePart, timePart] = inputDate.split(" ");
  //     const [year, month, day] = datePart.split("-");
  //     const formattedDate = `${day}-${month}-${year} ${timePart}`;
  //     return formattedDate;
  //   }
  //   return ""
  // }

  const formatDate = (originalDate) => {
    const formattedDate = new Date(originalDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedTime = new Date(originalDate).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const finalFormat = `${formattedDate} ${formattedTime}`;
    return finalFormat;
  }

  // const makeStyle = (status) => {
  //   if (status === 'approved') {
  //     return {
  //       background: 'rgb(145 254 159 / 47%)',
  //       color: 'green',
  //     }
  //   }
  //   else if (status === 'pending') {
  //     return {
  //       background: '#ffadad8f',
  //       color: 'red',
  //     }
  //   }
  //   else {
  //     return {
  //       background: '#59bfff',
  //       color: 'white',
  //     }
  //   }
  // }



  return (
    <div className="Table-admin">
      {calendarOpen &&
        <div className="popup-container">
          <div className="popup">
            <h3>Seleziona una data e ora</h3>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              placeholderText="Data di inizio"
              dateFormat="dd/MM/yyyy HH:mm"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="Data di fine"
              dateFormat="dd/MM/yyyy HH:mm"
            />
            <button onClick={handleClickDate}>Applica filtri</button>
          </div>
        </div>
      }


      {/* filtra per esito NON in figma ma puo essere utile */}
      {esitoOpen &&
        <div className="popup-container">
          <div className="popup" id="filterbyesito">

            <div className='popup-top'>
              <h4>Seleziona un esito da filtrare</h4>
            </div>

            <svg id="modalclosingicon" onClick={() => setEsitoOpen(false)} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>

            <div className="labelwrapper">
              <label>
                <input
                  type="checkbox"
                  checked={selectedStatusEsito.dacontattare}
                  onChange={() => toggleFilter('dacontattare')}
                />
                <h3>
                  Da contattare
                  {/* <h4>Non risponde al telefono</h4> */}
                </h3>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedStatusEsito.inlavorazione}
                  onChange={() => toggleFilter('inlavorazione')}
                />
                <h3>
                  In lavorazione
                  {/* <h4>Non risponde al telefono</h4> */}
                </h3>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedStatusEsito.noninteressato}
                  onChange={() => toggleFilter('noninteressato')}
                />
                <h3>
                  Non interessato
                  {/* <h4>Non risponde al telefono</h4> */}
                </h3>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={selectedStatusEsito.opportunita}
                  onChange={() => toggleFilter('opportunita')}
                />
                <h3>
                  Opportunità
                  {/* <h4>Non risponde al telefono</h4> */}
                </h3>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedStatusEsito.invalutazione}
                  onChange={() => toggleFilter('invalutazione')}
                />
                <h3>
                  In valutazione
                  {/* <h4>Non risponde al telefono</h4> */}
                </h3>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedStatusEsito.venduto}
                  onChange={() => toggleFilter('venduto')}
                />
                <h3>
                  Venduto
                  {/* <h4>Non risponde al telefono</h4> */}
                </h3>
              </label>
            </div>


            <button className="btn-orie" style={{ fontSize: "19px" }} onClick={handleClickEsito}>Applica filtri</button>
            <div style={{ cursor: "pointer", marginTop: "20px" }} onClick={() => setEsitoOpen(false)}><u>Torna indietro</u></div>
          </div>
        </div>
      }


      {popupModify &&
        <PopupModify
          onClose={handleClosePopup}
          lead={selectedLead}
          admin={true}
        />
      }
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
        <div id="scrolladmin" className="table-big-container-admin">

          <div className="table-filters">

            <div>
              <h4>Tutti i clienti</h4>
            </div>


            <div className="adminsearchkeyword">

              <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" /></svg>

              <input
                type="text"
                placeholder="Cerca..."
                onChange={handleNameChange}
                value={filterValue} />
            </div>

            <div className="adminfilterdate">
              <div>
                DA
                <input type="date" onChange={(e) => setStartDate(e.target.valueAsDate)} />
              </div>
              <div>
                A
                <input type="date" onChange={(e) => setEndDate(e.target.valueAsDate)} />
              </div>
            </div>


          </div>

          <div id="ofhandler">

            <table style={{ minWidth: '85%' }} aria-label="simple table" className="table-container">
              <thead>
                <tr>
                  <th style={{ color: 'rgba(0, 0, 0, 0.31)', fontSize: '25px' }}>Nome</th>
                  <th style={{ color: 'rgba(0, 0, 0, 0.31)', fontSize: '25px' }}>Cognome</th>
                  <th style={{ color: 'rgba(0, 0, 0, 0.31)', fontSize: '25px' }}>Data e ora</th>
                  <th style={{ color: 'rgba(0, 0, 0, 0.31)', fontSize: '25px' }}>Telefono</th>
                  <th style={{ color: 'rgba(0, 0, 0, 0.31)', fontSize: '25px' }}>Esito</th>
                  <th style={{ color: 'rgba(0, 0, 0, 0.31)', fontSize: '25px' }}>Dati cliente</th>
                  <th style={{ color: 'rgba(0, 0, 0, 0.31)', fontSize: '25px' }}>Orientatore</th>
                </tr>
              </thead>
              <tbody style={{ color: "white", textAlign: 'left' }} className="table-body-container">
                {filteredData && filteredData
                  .filter(p => {
                    let flag = true

                    if (startDate)
                      flag = new Date(p.date) >= new Date(startDate)
                    if (endDate)
                      flag = flag && new Date(p.date) <= new Date(endDate)

                    return flag
                  })
                  .sort((a, b) => new Date(a.date) < new Date(b.date) ? 1 : -1)
                  .map((row, index) => (
                    <tr key={index}>
                      <td>{row.name}</td>
                      <td>{row.surname}</td>
                      <td>{formatDate(row.date)}</td>
                      <td>{row.telephone}</td>
                      <td>
                        <span className={"status " + row.status}>
                          {row.status == "Venduto" ? "Iscrizione" : row.status}
                        </span>
                      </td>
                      <td className="modify-table" onClick={() => handleModifyPopup(index)}>Modifica <IoIosArrowDown size={12} /></td>
                      <td className="Details">{row.orientatore}</td>
                    </tr>
                  ))}
              </tbody>
            </table>


          </div>
        </div>
      }
    </div>
  );
}