import React from 'react';

function LichessLink({ fen }) {
  const url = `https://lichess.org/analysis/pgn/${encodeURIComponent(fen)}`;
console.log(url)
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      Analyze this position on Lichess
    </a>
  );
}

export default LichessLink;