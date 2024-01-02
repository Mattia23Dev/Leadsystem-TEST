import React, { useContext } from 'react'
import { UserContext } from '../../context';
import axios from 'axios';
import toast from 'react-hot-toast';
//import { useDrop } from 'react-dnd';
//import { MyDnDContext } from '../../context/MyDnDcontext';

export default function LeadHeader({ 
  esito, SETtoggles, toggles, filteredData, type, handleModifyPopupEsito }) {

  const [state, setState] = useContext(UserContext);
  const userId = state.user._id;
  const ref = React.useRef(null);


  return (
    <div
      className={"secheader "}
      ref={ref}
      onClick={() => {
        if (type == "Da contattare")
          SETtoggles({ ...toggles, dacontattare: !toggles.dacontattare })
        else if (type == "In lavorazione")
          SETtoggles({ ...toggles, inlavorazione: !toggles.inlavorazione })
        else if (type == "Non interessato")
          SETtoggles({ ...toggles, noninteressato: !toggles.noninteressato })
        else if (type == "Opportunità")
          SETtoggles({ ...toggles, opportunita: !toggles.opportunita })
        else if (type == "In valutazione")
          SETtoggles({ ...toggles, invalutazione: !toggles.invalutazione })
        else if (type == "Venduto")
          SETtoggles({ ...toggles, venduto: !toggles.venduto })
          else if (type == "Non valido")
          SETtoggles({ ...toggles, nonValido: !toggles.nonValido })
          else if (type == "Non risponde")
          SETtoggles({ ...toggles, nonRisponde: !toggles.nonRisponde })
      }}>
      <span>{type == "Venduto" ? "Venduto" : type}</span>
      <span>
        {filteredData && filteredData.filter(x => x.status == type).length}
      </span>
    </div>
  )
}
