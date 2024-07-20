/**
 * Legal chess moves for chessground
 * @param {*} chess
 */
const toDests = (chess) => {
  const dests = {};

  chess.SQUARES.forEach((s) => {
    const ms = chess.moves({ square: s, verbose: true });
    if (ms.length) dests[s] = ms.map((m) => m.to);
  });
  const color = chess.turn() === "w" ? "white" : "black";
    console.log(dests)
  return {
    color, // who's turn is it
    dests, // what to move
    free: false
  };
};

export default toDests;
