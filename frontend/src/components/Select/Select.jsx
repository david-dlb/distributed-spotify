import React, { useState, useRef, useEffect } from 'react';

function Select({ name, id, value, onChange, options = [], page }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(value || '');
  const listRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listRef.current && !listRef.current.contains(event.target)) {
        setIsOpen(false);

    };
    }
  }, []);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onChange({ target: { name, value: option.value } });
  };

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, clientHeight, scrollHeight } = listRef.current;
      const isBottom = scrollTop + clientHeight >= scrollHeight;
      setIsAtBottom(isBottom);
      
      if (isBottom && !isAtBottom) {
        console.log('Has llegado al final de las opciones');
        page()
        // Aquí puedes agregar tu lógica para cargar más opciones
      }
    }
  };

  return (
    <div className="custom-select">
      <button onClick={toggleOpen} className={`select-button ${isOpen ? 'open' : ''}`}>
        {selectedOption ? selectedOption.label : 'Seleccione una opción'}
      </button>
      {isOpen && (
        <ul ref={listRef} onScroll={handleScroll} style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {options.map((option) => (
            <li key={option.value} onClick={() => handleOptionClick(option)}>
              {option.label}
            </li>
          ))}
          {isAtBottom && (
            <li>Loading more options...</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default Select;
