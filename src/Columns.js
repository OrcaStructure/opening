import React from 'react';

function TextColumns({ leftColumn, rightColumn }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
      <div style={{ width: '50%' }}>
        {leftColumn.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </div>
      <div style={{ width: '50%' }}>
        {rightColumn.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </div>
    </div>
  );
}

export default TextColumns;