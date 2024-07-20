import React, { useState, useEffect } from 'react';

const TextTile = ({ initialText }) => {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleChange = (event) => {
    setText(event.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
      <div style={{ padding: '10px', border: '1px solid black', minWidth: '100px' }}>
        {text}
      </div>
    </div>
  );
};


const App = ({text1,text2,text3}) => {
  return (
    <div>
      <TextTile initialText={text1} />
      <TextTile initialText={text2} />
      <TextTile initialText={text3} />
    </div>
  );
};

export default App;