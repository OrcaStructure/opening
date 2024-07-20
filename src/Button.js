// Button.js
import React from 'react';

const Button = ({ text, onClick }) => {
  return (
    <button onClick={onClick} style={{ margin: '10px' }}>
      {text}
    </button>
  );
};

export default Button;