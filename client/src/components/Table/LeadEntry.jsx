import React, { useContext, useEffect, useState } from 'react'
import './LeadEntry.scss'
import { FaWhatsapp, FaGoogle, FaFacebook, FaTimes } from 'react-icons/fa';
import { FaTag } from 'react-icons/fa';
//import { useDrag, useDrop } from 'react-dnd';
//import { MyDnDContext } from '../../context/MyDnDcontext';


// id: lead._id,
// name: lead.nome,
// surname: lead.cognome,
// email: lead.email,
// date: lead.data,
// telephone: cleanedTelephone,
// status: lead.esito,
// orientatore: lead.orientatori.nome,

export default function LeadEntry({ secref, id, index, data, handleModifyPopup, handleModifyPopupEsito, handleRowClick, campagna, etichette, modificaNelServer, deleteEtichetta, etichetteEsi, eliminaEtichetta, salvaEtichetta, nuovaEtichetta, setNuovaEtichetta }) {

  const ref = React.useRef(null);
  const [etichettaModify, setEtichettaModify] = useState(false);
  const [leadSel, setLeadSel] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);

  const handleDragStart = (event) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ id: data }));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();


    const droppedItem = JSON.parse(event.dataTransfer.getData('text/plain'));
    handleModifyPopup(droppedItem.id);
  };


  const clickEtichetta = (data) => {
    console.log(data);
    if (etichettaModify == false){
      setEtichettaModify(true);
    } else {
      setEtichettaModify(false);
    }
    setLeadSel(data);
  };

  const etichettaScelta = (scelta) => {
    modificaNelServer(scelta, leadSel);
    setEtichettaModify(false);
  }

    


  if (data)
    return (
      <div className="leadentry"
        ref={ref}
        draggable="true"
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      // onDrag={(e) => {
      //   const x = (e.target.offsetLeft)
      //   console.log(x)
      //   if (x > secref.current.offsetWidth / 1.5)
      //     secref.current.scrollLeft = secref.current.scrollLeft - x
      //   else
      //     secref.current.scrollLeft = secref.current.scrollLeft + x
      // }
      // }
      >

        <div className="dis">
          {/* absolute */}
          {/* <div className="badgenome">
            {data.name[0]}
            {data.surname[0]}
          </div> */}

          {/* <div className="etichetta">Nome lead</div> */}
          <div className="name">{data.name + " " + data.surname}</div>
          {campagna === 'Whatsapp' && (
                              <FaWhatsapp size={24} color="green" />
                            )}
                            {campagna === 'Social' && (
                              <FaFacebook size={24} color="blue" />
                            )}
                            {campagna === 'Wordpress' && (
                              <FaGoogle size={24} color="red" />
                            )}
          {/* <div className="phone">{"+39 " + data.telephone}</div> */}
          {/* <div className="mail">{data.email}</div> */}
          {/* <div className="azienda">{data.università ? data.università : "Altro"}</div> */}

          <div className='options'>
            <div className="modifica" onClick={() => handleModifyPopup(data)}>Info</div>
            <div className="sposta" onClick={() => handleModifyPopupEsito(data)}>Sposta</div>
            
            <div className="elim">
              <svg onClick={() => handleRowClick(data)} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z" /></svg>
            </div>
          </div>
          <div className='options-etichetta'>
            {etichette && etichette.length > 0 ? (
                  etichette.map((etichetta, index) => (
                    <span
                      key={index}
                      className={`etichetta ${etichetta === 'Inviato whatsapp' ? 'etichetta-whats' : etichetta === 'Da richiamare' ? 'etichetta-rich' : etichetta === 'Chiude il telefono' ? 'etichetta-chiude' : 'etichetta-creata-visual'}`}
                    >
                      <span onClick={() => clickEtichetta(data)}>
                        {etichetta}
                      </span>
                      <svg onClick={() => deleteEtichetta(etichetta, data)} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
                    </span>
                  ))
                ) : (
                  null
                )}
                <FaTag className='tag-etichetta' onClick={() => clickEtichetta(data)} />
              {etichettaModify && leadSel !== null ? (
                    <div className='scegli-etichetta'>
                       <div>
                        <input
                                        type="text"
                                        placeholder="Nuova etichetta"
                                        value={nuovaEtichetta}
                                        onChange={(e) => setNuovaEtichetta(e.target.value)}
                                      />
                                      <button
                                        onClick={() => salvaEtichetta(data)}
                                      >
                                        Salva
                                      </button>
                        </div>
                      <p
                        className={selectedLabel === 'Inviato whatsapp' ? 'selected-label-etichetta etichetta-whats' : 'etichetta-whats'}
                        onClick={() => etichettaScelta('Inviato whatsapp')}
                      >
                        Inviato Whatsapp
                      </p>
                      <p
                        className={selectedLabel === 'Da richiamare' ? 'selected-label-etichetta etichetta-rich' : 'etichetta-rich'}
                        onClick={() => etichettaScelta('Da richiamare')}
                      >
                        Da richiamare
                      </p>
                      <p
                        className={selectedLabel === 'Chiude il telefono' ? 'selected-label-etichetta etichetta-chiude' : 'etichetta-chiude'}
                        onClick={() => etichettaScelta('Chiude il telefono')}
                      >
                        Chiude il telefono
                      </p>
                      {etichetteEsi && etichetteEsi.map((etichetta, index) => (
                                    <p
                                      key={index}
                                      className={`etichetta-creata`}      
                                    >
                                      <span onClick={() => etichettaScelta(etichetta.nomeEtichetta)}>{etichetta.nomeEtichetta}</span>
                                      <span onClick={() => eliminaEtichetta(etichetta)}><FaTimes /></span>
                                    </p>
                      ))}
                    </div>
              ) : (
                null
              )}
          </div>

          <div id="dragme">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-grip-vertical" viewBox="0 0 16 16"> <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" /> </svg>
          </div>

        </div>
      </div>
    )
  return <></>
}
