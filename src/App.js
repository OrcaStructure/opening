import { useState, useEffect } from "react";
import Chess from "chess.js";
import { Chessboard } from "react-chessboard";
import Button from './Button';
import Displays from './Displays'
import { parse } from '@mliebelt/pgn-parser'
import TextColumns from './Columns'
import LichessLink from './LichessLink'


var databaseMode = false
var position_eval = 0.22
var whiteToMove = true
var last_position_eval = 0.22
const starting_position = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
var evaluationQueue = []
var evaluationQueueNumbers = []

var stockfishWorker = new Worker('stockfish.js');

stockfishWorker.postMessage("uci");
stockfishWorker.postMessage("ucinewgame");

var setPGN = ""
var evals = []
var longestPGN = ""

var messagePosted = false






function weighted_random(items, weights) {
    var i;

    for (i = 1; i < weights.length; i++)
        weights[i] += weights[i - 1];
    
    var random = Math.random() * weights[weights.length - 1];
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;
    
    return items[i];
}

export default function PlayRandomMoveEngine() {
  const [game, setGame] = useState(new Chess());
    
  const [orientation, setOrientation] = useState('white');

    //displays
    const [text1, setText1] = useState('Number of Games');
    const [text2, setText2] = useState('Eval Drop:');
    const [text3, setText3] = useState('Initial Text 3');
    const [leftTexts, setLeftTexts] = useState(['1.e4']);
    const [rightTexts, setRightTexts] = useState(['0.45']);

    const [databaseText, setDatabaseText] = useState('Save Position');
    const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");    
    const [linkFen, setLinkFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");    
    
  function makeAMove(move) {
    console.log(move)
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    if (result == null) {
        return null
    }
    if (result != null) {
        whiteToMove = !whiteToMove

    }
      getMoveInSequence()
    setGame(gameCopy);
    
      console.log(longestPGN,game.pgn())
    if (!pgnContains(longestPGN)) {
        longestPGN = game.pgn()
        evals = evals.slice(0,game.history().length)
    }
    getEval(game.fen())
    console.log(longestPGN)
      const tempChess = new Chess()
    tempChess.load_pgn(longestPGN)
      setLeftTexts(tempChess.history())
      setRightTexts(evals)
      setFen(game.fen())
      correctLink()
    return result; // null if the move was illegal, the move object if the move was legal
  }
    
    function seekEvaluation() {
        if (!messagePosted && evaluationQueue.length != 0) {
          stockfishWorker.postMessage("position fen " + evaluationQueue[0]);
        stockfishWorker.postMessage("go depth 16");
          messagePosted = true

      }
}

useEffect(() => {
    
    const handleKeyDown = (e) => {
         const key = e.key;
         if (key == "f") {
             flipBoard()
         }
         
    };
    document.addEventListener('keydown', handleKeyDown, true);

    
    const handleWorkerMessage = (e) => {
        e = e.data
      if (e && typeof e === 'string' && e.includes('info depth 16')) {
    // Extract evaluation from the info string
          console.log(e, "data")
    const evaluationMatch = e.match(/score cp (-?\d+)/);
          
    if (evaluationMatch) {
      const evaluation = parseInt(evaluationMatch[1], 10) / 100;
      evals[evaluationQueueNumbers[0]] = evaluation.toString()
        console.log(evaluation,evals)
        evaluationQueue.pop()
        evaluationQueueNumbers.pop()
        messagePosted = false
        setRightTexts(JSON.parse(JSON.stringify(evals)))
    }
           
    }
    };
        
        stockfishWorker.onmessage = handleWorkerMessage;
    
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
    });
    




function flipBoard() {
    setOrientation(orientation == 'white' ? 'black' : 'white')
    potentiallyMakeMove()
}



  function makeOpponentMove() {
    const possibleMoves = game.moves();
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0)
      return; // exit if the game is over
    
      console.log("fetching")
      console.log("fen",`https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz,rapid,classical&ratings=2200,2500&fen=${game.fen().replaceAll(" ", "%20")}`)
    fetch(`https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz,rapid,classical&ratings=1800,2000,2200,2500&fen=${game.fen().replaceAll(" ", "%20")}&topGames=0&recentGames=0`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(explorerMoves => {
    var probabilities = []
    var makeableMoves = []
    var numberOfGames = explorerMoves.white+explorerMoves.black+explorerMoves.draws
    if (numberOfGames < 5) {
        setToPGN(setPGN)
    }
    console.log("successful response",explorerMoves);
    for (var i = 0; i < explorerMoves.moves.length; i++)  {
        probabilities.push((explorerMoves.moves[i].white+explorerMoves.moves[i].black+explorerMoves.moves[i].draws)/(explorerMoves.white+explorerMoves.black+explorerMoves.draws))
        makeableMoves.push(explorerMoves.moves[i].uci)
        if (explorerMoves.moves[i].san == "O-O" || explorerMoves.moves[i].san == "O-O-O") {
            
            switch (makeableMoves[i]) {
                case "e1h1":
                makeableMoves[i] = "e1g1"
                    break;
                case "e1a1":
                makeableMoves[i] = "e1c1"
                    break;
                case "e8a8":
                makeableMoves[i] = "e8c8"
                    break;   
                case "e8h8":
                makeableMoves[i] = "e8g8"
                    break;
                default:
                    let k
            }
            }
    }
    setText1("Number of Games: " +numberOfGames )
    console.log(probabilities,makeableMoves)
    const chosenMove= weighted_random(makeableMoves,probabilities)
    const formattedMove = {
      from: chosenMove.slice(0,2),
      to: chosenMove.slice(2,4),
      promotion: "q", // always promote to a queen for example simplicity
    }
    makeAMove(formattedMove)
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation: ', error);
  });

  }
    
    
function getEval(fen) {
    return fetch(`https://lichess.org/api/cloud-eval?fen=${fen.replaceAll(" ", "%20")}`)
  .then(response => {
    if (!response.ok) {
        setText2("Eval: loading")
        evaluationQueueNumbers.push(evals.length)
        evaluationQueue.push(fen)

        

      evals.push("...")
            setRightTexts(evals)
        
    }
    return response.json();
  })
  .then(evaluation => {
        last_position_eval = position_eval
        position_eval = (evaluation.pvs[0].cp / 100).toFixed(2)
        console.log(position_eval,last_position_eval,position_eval-last_position_eval)
        console.log("to move:" + playerToMove())
            console.log('wow')
            setText2("Eval : " + (position_eval))
            evals.push(position_eval)
            console.log(evals)
            setRightTexts(evals)
   return evaluation
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation: ', error);
  });

}
    
function playerToMove() {
    return whiteToMove == (orientation == "white")
}

  function onDrop(sourceSquare, targetSquare) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return false;
    
    potentiallyMakeMove()
      
    
    return true;
  }
    
    function potentiallyMakeMove () {
        console.log(whiteToMove)
        if(databaseMode && !playerToMove()) {
        setTimeout(makeOpponentMove, 50);
    }
    }
    
    function flipDataBase () {
        console.log(databaseMode)
        databaseMode = databaseMode ? false : true
        console.log("database mode toggling", databaseMode)
        setDatabaseText(databaseMode ? "Edit position" : "Save position")
        if (databaseMode) {
            setPGN = game.pgn()
            console.log(setPGN)
        }
        potentiallyMakeMove()
    }
    
    function setToPGN(pgn) {
        var gameCopy = { ...game };
        gameCopy.load_pgn(pgn)
        setGame(gameCopy)
        whiteToMove = fenToMove(gameCopy.fen())
        potentiallyMakeMove()
    }
    
    function previousMove() {

        
        var gameCopy = { ...game };
        if (gameCopy.pgn().length > 0){
            gameCopy.undo()

        }
        setGame(gameCopy)
                if (game.pgn().length > longestPGN.length) {
            longestPGN = game.pgn()
        }
        whiteToMove = fenToMove(gameCopy.fen())
        setFen(game.fen())
        correctLink()
        

        
    }
    
    function nextMove() {
    const tempChess = new Chess()
    tempChess.load_pgn(longestPGN)
    tempChess.history().slice(0,game.history().length+1)
}
    
function getMoveInSequence() {
    const tempChess = new Chess()
    tempChess.load_pgn(longestPGN)
    console.log(longestPGN)
    console.log(tempChess.history()[game.history().length+1])
}
    
function pgnContains(pgn) {
    console.log("pgn contaisn")
    const tempChess = new Chess()
    tempChess.load_pgn(pgn)
    const len = tempChess.history().length
    for (var i=0; i <= len; i++) {
        //onsole.log("mex")
        //nsole.log("?",tempChess.history().slice(0,i).toString(),game.history().toString())
        if (tempChess.history().slice(0,i).toString() == game.history().toString()) {
            return true
        }
}
    return false
}
    function correctLink() {
        var gameCopy = new Chess()
        gameCopy.load_pgn(game.pgn())

        if (gameCopy.pgn().length > 1){
            console.log(gameCopy.pgn(), "yes")
        }
        setLinkFen(gameCopy.pgn())
        console.log(gameCopy.pgn())
        console.log("link fen", linkFen)
    }
    
    
    function fenToMove(fen) {
        return fen.split(" ")[1] == "w"
    }
    
    setInterval(seekEvaluation,400)
    
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}> <div style={{width:"30%"}}> <Chessboard boardOrientation={orientation} position={game.fen()} onPieceDrop={onDrop} />     <Displays text1={text1} text2={text2} text3={text3}/> </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      
    <Button text="Flip board" onClick={flipBoard} />
      <Button text={databaseText} onClick={flipDataBase} />
     <Button text="Reset to Save" onClick={() => setToPGN(setPGN)} />
      <Button text="Reset to Start" onClick={() => setToPGN(starting_position)} />
          <LichessLink fen={linkFen.toString()} />

    </div>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Button text="Move back" onClick={() => previousMove()} />
    <Button text="Move Forward" onClick={() => nextMove()} />
  </div>
    <TextColumns leftColumn={leftTexts} rightColumn={rightTexts} />

      </div>;
}


//done