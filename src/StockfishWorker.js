/*importScripts('./stockfish.js');

const engine = Stockfish();

engine.onmessage = function (e) {
  if (e && typeof e === 'string' && e.includes('info depth')) {
    // Extract evaluation from the info string
    const evaluationMatch = e.match(/score cp (-?\d+)/);
    if (evaluationMatch) {
      const evaluation = parseInt(evaluationMatch[1], 10) / 100;
      postMessage({ evaluation });
    }
  }
};

onmessage = function (event) {
  const { id, position } = event.data;
  engine.postMessage('uci');
  engine.postMessage('isready');
  engine.postMessage('ucinewgame');
  engine.postMessage(`position fen ${position}`);
  engine.postMessage('go depth 20');
};
*/