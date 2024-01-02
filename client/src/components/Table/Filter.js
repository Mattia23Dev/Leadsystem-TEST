import React, {useState} from 'react'
import './Table.css';
import { DatePicker, TimePicker, Button } from 'antd';
import { TextField } from '@mui/material';
import { Checkbox, Input } from "antd";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

const CheckboxGroup = ({ options }) => {
  // Definiamo uno stato per tenere traccia delle opzioni selezionate
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Definiamo la funzione per gestire la selezione di una opzione
  const handleSelectOption = (option) => {
    // Se l'opzione è già stata selezionata, la rimuoviamo dalla lista delle opzioni selezionate
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== option));
    } else {
      // Altrimenti, la aggiungiamo alla lista delle opzioni selezionate
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  // Definiamo una funzione per renderizzare le opzioni del checkbox group
  const renderOptions = () => {
    return options.map((option) => {
      return (
        <Checkbox
          key={option}
          checked={selectedOptions.includes(option)}
          onChange={() => handleSelectOption(option)}
        >
          {option}
        </Checkbox>
      );
    });
  };

  return <div>{renderOptions()}</div>;
};

const SearchInput = () => {
    // Definiamo uno stato per tenere traccia del valore di ricerca
    const [searchValue, setSearchValue] = useState("");
  
    // Definiamo la funzione per gestire il cambiamento del valore di ricerca
    const handleSearchChange = (e) => {
      setSearchValue(e.target.value);
    };
  
    return (
      <Input.Search
        placeholder="Cerca"
        allowClear
        value={searchValue}
        onChange={handleSearchChange}
      />
    );
  };  

const Filter = (filterValue, handleFilterChange) => {
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);

  const onDateChange = (value) => {
    setDate(value);
  };

  const onTimeChange = (value) => {
    setTime(value);
  };

  const onFilterClick = () => {
    // esegui il filtro dei risultati utilizzando le variabili date e time
    console.log(date, time);
  };
  return (
    <div>
     <div className="table-top">
         <div className="table-top-item">
              <p>Tutti i clienti</p>
              <p><span></span> Attivi ora</p>
        </div>
        <div className="table-top-item">
              <TextField label="Cerca" value={filterValue} onChange={handleFilterChange} />
            <div>
                <FilterDropdown
                onDateChange={onDateChange}
                onTimeChange={onTimeChange}
                onFilterClick={onFilterClick}
                 />
            </div>
        </div>
     </div>
    </div>
  )
}

const FilterDropdown = () => {
    // Definiamo uno stato per la selezione del filtro corrente
    const [currentFilter, setCurrentFilter] = useState("");
  
    // Definiamo la funzione per gestire la selezione di un filtro
    const handleSelectFilter = (filter) => {
      setCurrentFilter(filter);
    };
  
    // Definiamo una funzione per renderizzare i filtri disponibili
    const renderFilterOptions = () => {
      const filterOptions = [ 
        { value: "data-e-ora", label: "Data e ora" },
        { value: "esito", label: "Esito" },
        { value: "nome", label: "Nome" },
        { value: "telefono", label: "Telefono" },
    ];
  
      return filterOptions.map((option) => {
        return (
          <div key={option} onClick={() => handleSelectFilter(option)}>
            {option}
          </div>
        );
      });
    };
  
    // Definiamo una funzione per renderizzare il menu a tendina del filtro selezionato
    const renderSelectedFilter = (onDateChange, onTimeChange, onFilterClick) => {
        
      switch (currentFilter) {
        case "data-e-ora":
          return(
            <div>
          <DatePicker onChange={onDateChange} />
          <TimePicker onChange={onTimeChange}/>
          <Button type="primary" onClick={onFilterClick}>Filtra</Button></div>)
         ;
        case "esito":
          return <CheckboxGroup options={["on", "off"]} />;
        case "nome":
        case "telefono":
          return <SearchInput />;
        default:
          return null;
      }
    };

    const [selectedOption, setSelectedOption] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
      
        const handleDropdownClick = () => {
          setIsDropdownOpen(!isDropdownOpen);
        };
      
        const handleOptionSelect = (option) => {
          setSelectedOption(option);
          setIsDropdownOpen(false);
        };

        const filterOptions = [ 
            { value: "data-e-ora", label: "Data e ora" },
            { value: "esito", label: "Esito" },
            { value: "nome", label: "Nome" },
            { value: "telefono", label: "Telefono" },
        ];
        
  
    return (
      <div>
        <div className="dropdown-container" onClick={handleDropdownClick}>
            <span>{selectedOption}</span>
            {isDropdownOpen && (
                <Dropdown
                options={filterOptions}
                value={selectedOption}
                onChange={handleOptionSelect}
                />
            )}
        </div>
        {/* Renderizziamo le opzioni del filtro */}
        <div>{renderFilterOptions()}</div>
  
        {/* Renderizziamo il menu a tendina del filtro selezionato */}
        {currentFilter && (
          <div>
            <div onClick={() => setCurrentFilter("")}>Chiudi</div>
            {renderSelectedFilter()}
          </div>
        )}
      </div>
    );
  };

export default Filter;