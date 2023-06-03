var backgammonBoard = document.getElementById('backgammonBoard');
var ctx = backgammonBoard.getContext('2d');

// TODO:

// separate into files
// 3 files? playLocal, training, online... move shared stuff to separate file (common)

// add prev and next buttons next to resign

// make single move, switch dice, make other move.. glitch

// give each button/object a position struct.

// give locations on board constants as positions

// move eaten checkers to above/below?

// use typescript

// add color settings

// draw canvas buttons under board?

// factor out colors to top of file

// need current board for temp move graphics
let currentState = {};
let lastState = {};

const CPU_DELAY_MS = 1000;

// make as large as posssible
var w = window.innerWidth*0.97;
var h = window.innerHeight*0.97;

// board is about 15 checker diameters wide
// height is about 12.5 checker diameters high
const ar = 12.5/15;
if (h / w < ar) {
  backgammonBoard.width = h / ar;
  backgammonBoard.height = h;
} else {
  backgammonBoard.width = w;
  backgammonBoard.height = backgammonBoard.width * ar;
}

// size of the spaces and radius of the pieces
const checkerDiameter = backgammonBoard.width / 15;

// spacing between checkers
const gapBetweenCheckers = checkerDiameter / 7;

// width of the middle bar
const barWidth = checkerDiameter;

// size of the doubling cube
const doublingCubeSize = checkerDiameter*0.85;

// spacing off the side of the board
const doublingCubeOffset = gapBetweenCheckers;

// size of the rolling dice
const dieSize = checkerDiameter;
const dieDotRadius = dieSize / 10;
const gapBetweenDice = checkerDiameter / 10;

// max checkers shown
const maxCheckersShown = 5;
const maxBarCheckersShown = 3;

// flag pole size
const resignFlagPoleHeight = backgammonBoard.width*ar / 10;
const resignFlagSize = backgammonBoard.width*ar / 20;

// const verticalGap = backgammonBoard.height / 7;
const verticalGap = checkerDiameter*1.5;
const pointHeight = maxCheckersShown * checkerDiameter;

const barLeftBoundary = checkerDiameter * 6 + gapBetweenCheckers * 7;
const barRightBoundary = barLeftBoundary + barWidth;
const barCenter = (barLeftBoundary + barRightBoundary) / 2;
const boardWidth = barRightBoundary + checkerDiameter * 6 + gapBetweenCheckers * 7;
const boardHeight = maxCheckersShown * checkerDiameter * 2 + verticalGap;

const playerLeftDieStartPoint = (barRightBoundary + boardWidth - gapBetweenDice) / 2 - dieSize;
const playerRightDieStartPoint = (barRightBoundary + boardWidth + gapBetweenDice) / 2;
const opponentLeftDieStartPoint = (barLeftBoundary - gapBetweenDice) / 2 - dieSize;
const opponentRightDieStartPoint = (barLeftBoundary + gapBetweenDice) / 2;
const diceVerticalStartPoint = (boardHeight - dieSize) / 2;


const buttonWidth = dieSize * 1.5;
const buttonHeight = dieSize;
const submitLeft = (barLeftBoundary - gapBetweenDice) / 2 - buttonWidth;
const clearLeft = (barLeftBoundary + gapBetweenDice) / 2;
const clearSubmitBottom = (boardHeight - buttonHeight) / 2;

// Calculate the center of the cube
const cubeHorizontal = (boardWidth - doublingCubeSize)/2;
const cubeCenter = (barRightBoundary + boardWidth) / 2;

const acceptHorizontal = cubeCenter + doublingCubeSize/2 + doublingCubeOffset;
const rejectHorizontal = cubeCenter - doublingCubeSize/2 - doublingCubeOffset - buttonWidth;

// under my rightmost checker
const resignWidth = checkerDiameter;
const resignHeight = checkerDiameter;
const resignLeft = barRightBoundary + 5*(checkerDiameter + gapBetweenCheckers) + resignWidth/2;
const resignBottom = boardHeight + resignHeight + gapBetweenCheckers;


const playerColor = 'purple';
const opponentColor = 'orange';

const autoSubmit = false;

backgammonBoard.width+=2;

function drawCheckers(ctx, numCheckers, pointStart, direction) {
  if (numCheckers == 0) {
    return;
  }

  let checkerCenterVertical;
  if (direction == 1) { // top of board
    checkerCenterVertical = checkerDiameter / 2;
  } else {
    checkerCenterVertical = boardHeight - checkerDiameter / 2;
  }

  if (numCheckers > 0) {
    ctx.fillStyle = playerColor;
  } else {
    ctx.fillStyle = opponentColor;
  }

  for (let i = 0; i < Math.min(Math.abs(numCheckers), maxCheckersShown); i++) {
    ctx.beginPath();
    ctx.arc(pointStart + checkerDiameter / 2, checkerCenterVertical, checkerDiameter / 2, 0, 2 * Math.PI);
    ctx.fill();

    checkerCenterVertical += (direction * checkerDiameter);
  }

  if (Math.abs(numCheckers) > maxCheckersShown) {
    ctx.font = '14px sans-serif'; // scale fonts?
    ctx.fillStyle = 'white';
    const text = Math.abs(numCheckers);
    ctx.fillText(text, pointStart + checkerDiameter / 2 - ctx.measureText(text).width / 2, checkerCenterVertical - direction * checkerDiameter + 2);
  }

  ctx.fillStyle = 'grey';
}

function drawBarCheckers(ctx, numCheckers, direction) {
  if (numCheckers == 0) {
    return;
  }

  if (numCheckers > 0) {
    ctx.fillStyle = playerColor;
  } else {
    ctx.fillStyle = opponentColor;
  }

  let checkerCenterVertical = boardHeight / 2 + direction * (gapBetweenCheckers + (checkerDiameter+doublingCubeSize) / 2);
  for (let i = 0; i < Math.min(Math.abs(numCheckers), maxBarCheckersShown); i++) {
    ctx.beginPath();
    ctx.arc(barCenter, checkerCenterVertical, checkerDiameter / 2, 0, 2 * Math.PI);
    ctx.fill();

    checkerCenterVertical += (direction * checkerDiameter);
  }

  if (Math.abs(numCheckers) > maxBarCheckersShown) {
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'white';
    const text = Math.abs(numCheckers);
    ctx.fillText(Math.abs(numCheckers), barCenter - ctx.measureText(text).width / 2, checkerCenterVertical - direction * checkerDiameter + 2);
  }

  ctx.fillStyle = 'grey';
}

dontDraw = false;

function drawPoints(boardState) {
  let pointStart = 5;
  let bottom = false;
  for (let i = 0; i < 25; i++) {
    if (i == 0 || i == 12) pointStart = gapBetweenCheckers;
    if (i>=12) bottom = true;
    if (i == 6 || i == 18) pointStart+=(barWidth + gapBetweenCheckers);
    ctx.beginPath();
    ctx.moveTo(pointStart, bottom ? boardHeight : 0);
    ctx.lineTo(pointStart + checkerDiameter / 2, bottom ? boardHeight - pointHeight : pointHeight);
    ctx.lineTo(pointStart + checkerDiameter, bottom ? boardHeight : 0);
    if (bottom ^ i % 2 == 0) {
      ctx.stroke();
    } else {
      ctx.fill();
    }
    if (boardState) {
      if (!bottom) drawCheckers(ctx, boardState.board[24 - i], pointStart, bottom ? -1 : 1);
      else if (i >= 12 && i <= 24) drawCheckers(ctx, boardState.board[i-11], pointStart, bottom ? -1 : 1);
    }

    pointStart += (checkerDiameter + gapBetweenCheckers);
  }
}

function drawButton(buttonX, buttonY, buttonText, buttonColor = 'lightgray', textColor= 'black') {
  ctx.fillStyle = buttonColor;
  ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
  ctx.fillStyle = textColor;
  ctx.font = '14px sans-serif';
  ctx.fillText(buttonText, buttonX + buttonWidth / 2 - ctx.measureText(buttonText).width / 2, buttonY + buttonHeight / 2 + 4);
}

function drawText(x, y, maxWidth, lineHeight, text) {
  function getLines(context, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = context.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  const lines = getLines(ctx, text, maxWidth);
  y = y - (lines.length-1)*lineHeight/2;
  for (let i = 0; i < lines.length; i++) {
    const x = boardWidth/2 - ctx.measureText(lines[i]).width / 2;
    ctx.fillText(lines[i], x, y + i*lineHeight);
  }
}


function drawBoard(boardState) {
  if (dontDraw) return;
  console.log(boardState);
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'grey';
  ctx.clearRect(0, 0, backgammonBoard.width, backgammonBoard.height);

  // 1-12 = lower, 13-24 = upper
  // for now, we will draw it so that the player always plays counterclockwise
  // so the 1-point is in the lower left hand corner

  // draw outer boundary of board
  ctx.beginPath();
  ctx.rect(1, 0, boardWidth, boardHeight);

  // draw bar
  ctx.moveTo(barLeftBoundary, 0);
  ctx.lineTo(barLeftBoundary, boardHeight);
  ctx.moveTo(barRightBoundary, 0);
  ctx.lineTo(barRightBoundary, boardHeight);

  ctx.stroke();

  drawPoints(boardState);

  if (!boardState) {
    const text = 'Click anywhere to begin. Click anywhere to roll. Click on the checkers to move them. Moves will be made in the order the dice are shown. Invert the dice by clicking on them. After making a move submit it, or if you don\'t like it you can clear it';
    const x = boardWidth/2;
    const y = boardHeight / 2 + 4;
    const maxWidth = backgammonBoard.width; // The maximum width of a line, leaving some margin
    const lineHeight = 20;

    drawText(x, y, maxWidth, lineHeight, text);
    return;
  }

  // draw bar checkers
  // my bar checkers start slightly above the center of the bar and each successive one goes up
  // opponent's bar checkers start slightly below the center of the bar and each successive one goes down
  drawBarCheckers(ctx, boardState.board[25], -1);
  drawBarCheckers(ctx, boardState.board[0], 1);

  // draw dice
  if (boardState.dice[0] > 0) {
    drawDice(ctx, boardState.dice[0], boardState.dice[1], boardState.turn);
  }

  if (boardState.turn == 1 && boardState.dice.length !== 0) {
    drawButton(clearLeft, clearSubmitBottom, 'clear');
    drawButton(submitLeft, clearSubmitBottom, 'submit');
  }

  if (!boardState.crawford) {
    ctx.strokeStyle = 'black';
    let cubeVertical;
    let cubeValueToShow;
    if (boardState.wasDoubled) {
      cubeValueToShow = boardState.cubeValue * 2;
      cubeVertical = (boardHeight - doublingCubeSize) / 2;
      if (boardState.wasDoubled > 0) { // opponent doubled player
      } else { // player doubled opponent
        drawButton(acceptHorizontal, cubeVertical, 'accept', 'green');
        drawButton(rejectHorizontal, cubeVertical, 'reject', 'red');
      }
    } else {
      cubeValueToShow = boardState.cubeValue;
      if (boardState.iMayDouble && boardState.opponentMayDouble) { // centered cube
        cubeVertical = (boardHeight - doublingCubeSize) / 2;
      } else if (boardState.iMayDouble) {
        cubeVertical = boardHeight - doublingCubeSize - doublingCubeOffset;
      } else if (boardState.opponentMayDouble) {
        cubeVertical = doublingCubeOffset;
      }
    }
    ctx.strokeRect(cubeHorizontal, cubeVertical, doublingCubeSize, doublingCubeSize);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'black';
    ctx.fillText(cubeValueToShow, cubeHorizontal + (doublingCubeSize - ctx.measureText(cubeValueToShow).width) / 2, cubeVertical + doublingCubeSize / 2 + 4);
  }

  // dont draw pieces off for now

  //   if (boardState.myPiecesOff > 0) {
  //     ctx.fillStyle = playerColor;
  //     var checkerOffHorizontal = boardWidth + doublingCubeOffset + doublingCubeSize / 2;
  //     var checkerOffVertical = boardHeight - doublingCubeSize - gapBetweenCheckers - checkerDiameter / 2;
  //     ctx.beginPath();
  //     ctx.arc(checkerOffHorizontal, checkerOffVertical, checkerDiameter / 2, 0, 2 * Math.PI);
  //     ctx.fill();
  //     ctx.fillStyle = 'white';
  //     ctx.font = '14px sans-serif';
  //     ctx.fillText(boardState.myPiecesOff, checkerOffHorizontal - ctx.measureText(boardState.myPiecesOff).width / 2, checkerOffVertical + 4);
  //   }

  //   if (boardState.opponentPiecesOff > 0) {
  //     ctx.fillStyle = opponentColor;
  //     var checkerOffHorizontal = boardWidth + doublingCubeOffset + doublingCubeSize / 2;
  //     var checkerOffVertical = 2 + doublingCubeSize + gapBetweenCheckers + checkerDiameter / 2;
  //     ctx.beginPath();
  //     ctx.arc(checkerOffHorizontal, checkerOffVertical, checkerDiameter / 2, 0, 2 * Math.PI);
  //     ctx.fill();
  //     ctx.fillStyle = 'white';
  //     ctx.font = '14px sans-serif';
  //     ctx.fillText(boardState.opponentPiecesOff, checkerOffHorizontal - ctx.measureText(boardState.opponentPiecesOff).width / 2, checkerOffVertical + 4);
  //   }

  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.moveTo(resignLeft, resignBottom - resignHeight); // start drawing the pole from the bottom of the flag
  ctx.lineTo(resignLeft, resignBottom); // draw the pole up to the top of the flag
  ctx.stroke();
  ctx.strokeRect(resignLeft, resignBottom - resignHeight, resignFlagSize, resignFlagSize); // draw the flag above the pole
  ctx.fillStyle = 'black';
  ctx.font = '14px sans-serif';
  ctx.fillText('resign', resignLeft + resignFlagSize / 2 - ctx.measureText('resign').width / 2, resignBottom - resignHeight + resignFlagSize / 2 + 4); // place the text at the center of the flag

  if (boardState.resignationOffered) {
    let resignationFlagHorizontal;
    if (boardState.turn == 1) { // player offered resignation to opponent
      resignationFlagHorizontal = (barLeftBoundary - resignFlagPoleHeight/2) / 2;
    } else { // opponent offered resignation to player
      resignationFlagHorizontal = (barRightBoundary + boardWidth -resignFlagPoleHeight/2) / 2;
      drawButton(acceptHorizontal, cubeVertical, 'accept', 'green');
      drawButton(rejectHorizontal, cubeVertical, 'reject', 'red');
    }

    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(resignationFlagHorizontal, (boardHeight - resignFlagPoleHeight) / 2);
    ctx.lineTo(resignationFlagHorizontal, (boardHeight + resignFlagPoleHeight) / 2);
    ctx.stroke();
    ctx.strokeRect(resignationFlagHorizontal, (boardHeight - resignFlagPoleHeight) / 2, resignFlagSize, resignFlagSize);
    ctx.fillStyle = 'black';
    ctx.font = '14px sans-serif';
    ctx.fillText(boardState.resignationValue, resignationFlagHorizontal + resignFlagSize / 2 - ctx.measureText(boardState.resignationValue).width / 2, (boardHeight - resignFlagPoleHeight + resignFlagSize) / 2 + 4);
  }
}

function intermediatePoint(a, b, t) {
  return (1 - t) * a + b * t;
}
/*
  -----
 |     |
 |  .  |
 |     |
  -----
 */
function drawDieCenterDot(ctx, dieStartPoint) {
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(
      intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.5),
      intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.5),
      dieDotRadius, 0, 2 * Math.PI);
  ctx.fill();
}

/*
  -----
 | .   |
 |     |
 |    .|
  -----
 */
function drawDieMainDiagonalDots(ctx, dieStartPoint) {
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(
      intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.25),
      intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.25),
      dieDotRadius, 0, 2 * Math.PI);
  ctx.arc(
      intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.75),
      intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.75),
      dieDotRadius, 0, 2 * Math.PI);
  ctx.fill();
}

/*
  -----
 |    .|
 |     |
 | .   |
  -----
 */
function drawDieAntiDiagonalDots(ctx, dieStartPoint) {
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(
      intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.75),
      intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.25),
      dieDotRadius, 0, 2 * Math.PI);
  ctx.arc(
      intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.25),
      intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.75),
      dieDotRadius, 0, 2 * Math.PI);
  ctx.fill();
}

/*
  -----
 |     |
 | .  .|
 |     |
  -----
 */
function drawDieMiddleDots(ctx, dieStartPoint) {
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(
      intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.25),
      intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.5),
      dieDotRadius, 0, 2 * Math.PI);
  ctx.arc(
      intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.75),
      intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.5),
      dieDotRadius, 0, 2 * Math.PI);
  ctx.fill();
}


function drawDie(ctx, dieStartPoint, color, dieValue) {
  ctx.fillStyle = color;
  ctx.fillRect(dieStartPoint, diceVerticalStartPoint, dieSize, dieSize);
  switch (dieValue) {
    case 1:
      drawDieCenterDot(ctx, dieStartPoint);
      break;
    case 2:
      drawDieMainDiagonalDots(ctx, dieStartPoint);
      break;
    case 3:
      drawDieMainDiagonalDots(ctx, dieStartPoint);
      drawDieCenterDot(ctx, dieStartPoint);
      break;
    case 4:
      drawDieMainDiagonalDots(ctx, dieStartPoint);
      drawDieAntiDiagonalDots(ctx, dieStartPoint);
      break;
    case 5:
      drawDieMainDiagonalDots(ctx, dieStartPoint);
      drawDieAntiDiagonalDots(ctx, dieStartPoint);
      drawDieCenterDot(ctx, dieStartPoint);
      break;
    case 6:
      drawDieMainDiagonalDots(ctx, dieStartPoint);
      drawDieAntiDiagonalDots(ctx, dieStartPoint);
      drawDieMiddleDots(ctx, dieStartPoint);
      break;

    default:
      break;
  }
}

function drawDice(ctx, n1, n2, turn) {
  let color; let leftDieStartPoint; let rightDieStartPoint;
  if (turn == 1) {
    color = playerColor;
    leftDieStartPoint = playerLeftDieStartPoint;
    rightDieStartPoint = playerRightDieStartPoint;
  } else {
    color = opponentColor;
    leftDieStartPoint = opponentLeftDieStartPoint;
    rightDieStartPoint = opponentRightDieStartPoint;
  }

  drawDie(ctx, leftDieStartPoint, color, n1);
  drawDie(ctx, rightDieStartPoint, color, n2);
}

window.addEventListener('load', function() {
  const form = document.getElementById('command_form');
  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const command_text_element = document.getElementById('command_text');
    const command = command_text_element.value;
    gnubgCommand(command);
    command_text_element.value = '';
  });

  // draw an empty board on initial load
  drawBoard();
});

let moves = [];

backgammonBoard.onclick = function(ev) {
  if (dontDraw) return;

  const {
    offsetX: x,
    offsetY: y,
  } = ev;

  if (!currentState.board) {
    newGame();
    return;
  } else if (currentState.dice.length === 0 || currentState.resignationOffered) {
    if (currentState.wasDoubled || currentState.resignationOffered) {
      const cubeVertical = (boardHeight - doublingCubeSize) / 2;
      if (isWithinArea(x, y, acceptHorizontal, cubeVertical, buttonWidth, buttonHeight)) {
        gnubgCommand('accept');
        return;
      }

      if (isWithinArea(x, y, rejectHorizontal, cubeVertical, buttonWidth, buttonHeight)) {
        gnubgCommand('reject');
        return;
      }
    }

    if (currentState.iMayDouble && currentState.turn == 1) {
      let cubeVertical;
      if (currentState.opponentMayDouble) { // centered cube
        cubeVertical = (boardHeight - doublingCubeSize) / 2;
      } else {
        cubeVertical = boardHeight - doublingCubeSize;
      }
      if (isWithinArea(x, y, cubeHorizontal, cubeVertical, doublingCubeSize, doublingCubeSize)) {
        gnubgCommand('double');
        return;
      }
    }


    roll();
    return;
  }

  // Touch dice to invert them
  if (isWithinArea(x, y, playerLeftDieStartPoint, diceVerticalStartPoint, playerRightDieStartPoint - playerLeftDieStartPoint + dieSize, dieSize)) {
    handleDiceInversion();
    return;
  }

  // Clear
  if (isWithinArea(x, y, clearLeft, clearSubmitBottom, buttonWidth, buttonHeight)) {
    handleClearButtonPress();
    return;
  }

  // Submit
  if (isWithinArea(x, y, submitLeft, clearSubmitBottom, buttonWidth, buttonHeight)) {
    handleSubmitButtonPress();
    return;
  }

  // Perform logic based on the click coordinates
  if (currentState.turn == 1) {
  // Submit
    if (isWithinArea(x, y, resignLeft, resignBottom - resignHeight, resignWidth, resignHeight)) {
      handleResignButtonPress();
      return;
    }

    // Check if click is within bar area
    if (isWithinArea(x, y, barLeftBoundary, 0, barWidth, boardHeight)) {
      handleBarAreaClick();
    } else {
      handleBoardAreaClick(x, y);
    }
  }

  if (isMovesFinished() && autoSubmit) {
    processMoves();
  }
  console.log(moves);
};

// A function to check if x and y fall within a defined area
function isWithinArea(x, y, areaStartX, areaStartY, areaWidth, areaHeight) {
  return x >= areaStartX && x <= areaStartX + areaWidth && y >= areaStartY && y <= areaStartY + areaHeight;
}

function handleResignButtonPress() {
  let resignAmount = 'a';
  while (isNaN(resignAmount) || (resignAmount > 3)) {
    resignAmount = parseInt(window.prompt('How many points would you like to resign (1, 2, 3)?'));
  }
  gnubgCommand('resign ' + resignAmount);
}

function handleDiceInversion() {
  currentState.dice = currentState.dice.reverse();
  drawBoard(currentState);
}

function handleClearButtonPress() {
  gnubgCommand('prev');
  gnubgCommand('next');
  moves = [];
  drawBoard(currentState);
}

function handleSubmitButtonPress() {
  gnubgCommand(moves.join(' '));
  moves = [];
}

function handleBarAreaClick() {
  // The click is within the bar area
  if (currentState.board[25] > 0 && currentState.board[25 - currentState.dice[moves.length]] >= -1) {
    updateBarState();
  }
}

function updateBarState() {
  const targetIndex = 25 - currentState.dice[moves.length];
  if (currentState.board[targetIndex] === -1) {
    currentState.opponentPiecesOff += 1;
    currentState.board[targetIndex] = 1;
  } else {
    currentState.board[targetIndex] += 1;
  }
  currentState.board[25] -= 1;
  moves.push(`25/${targetIndex}`);
  drawBoard(currentState);
}

function handleBoardAreaClick(x, y) {
  if (currentState.board[25] > 0) return; // Don't do anything if there is a checker on the bar

  x = adjustCoordinatesIfBeyondBoundary(x);
  const point = calculatePoint(x, y);

  if (currentState.board[point] > 0) { // A checker of yours exists there
    handleExistingChecker(point);
  }
  drawBoard(currentState);
}

function adjustCoordinatesIfBeyondBoundary(x) {
  if (x > barRightBoundary) {
    x -= (barRightBoundary - barLeftBoundary);
  }
  return x;
}

function calculatePoint(x, y) {
  let point = Math.floor(x / (checkerDiameter + gapBetweenCheckers)) + 1;
  if (point > 12) point = 0;
  if (y < boardHeight / 2) {
    point = 25 - point;
  }
  return point;
}

function handleExistingChecker(point) {
  const lastChecker = getLastChecker();
  const targetIndex = point - currentState.dice[moves.length];

  // if taking a piece off the board and able to
  if (targetIndex<=0 && lastChecker <= 6) {
    handleBearingOff(point, lastChecker, targetIndex);
  } else if (point - currentState.dice[moves.length] > 0 && currentState.board[point - currentState.dice[moves.length]] >= -1) { // You can land at the spot safely
    handleSafeLanding(point);
  }
}

function getLastChecker() {
  let lastChecker = Infinity;
  for (let i = 0; i < currentState.board.length; i++) {
    if (currentState.board[i] > 0) lastChecker = i;
  }
  return lastChecker;
}

function handleBearingOff(point, lastChecker, targetIndex) {
  // and the move makes sense
  if (point == lastChecker || targetIndex == 0) {
    // make the move
    currentState.myPiecesOff += 1;
    currentState.board[point] -= 1;
    moves.push(`${point}/0`);
  }
}

function handleSafeLanding(point) {
  const targetIndex = point - currentState.dice[moves.length];

  if (currentState.board[targetIndex] === -1) { // You landed on their piece
    currentState.board[0] = currentState.board[0] - 1;
    currentState.board[targetIndex] = 1;
  } else {
    currentState.board[targetIndex] += 1;
  }

  currentState.board[point] -= 1;
  moves.push(`${point}/${targetIndex}`);
}

function isMovesFinished() {
  return currentState.dice.length === moves.length;
}

function processMoves() {
  gnubgCommand(moves.join(' '));
  moves = [];
}

eventEmitter.addEventListener('boardUpdate', (data) => {
  updateBoard(data.detail);
  window.setTimeout(doNextTurn, 0);
});

function parseState(rawBoard) {
  const rawBoardSplit = rawBoard.split(':');
  let resignationOffered = false;
  let resignationValue = 0;
  if (rawBoard.includes('offers to resign')) {
    resignationOffered = true;
    if (rawBoard.endsWith('a single game.')) {
      resignationValue = 1;
    } else if (rawBoard.endsWith('a gammon.')) {
      resignationValue = 2;
    } else if (rawBoard.endsWith('a backgammon.')) {
      resignationValue = 3;
    } else {
      console.error('Unknown resignation value ' + resignationValue);
    }
    currentState.resignationOffered = true;
    currentState.resignationValue = resignationValue;
    return currentState;
  }

  let tempDice = [parseInt(rawBoardSplit[33]), parseInt(rawBoardSplit[34])];
  if (tempDice[0] == 0) {
    tempDice = [];
  } else if (tempDice[0] == tempDice[1]) {
    tempDice.push(tempDice[0]);
    tempDice.push(tempDice[1]);
  }
  return {
    myName: rawBoardSplit[1],
    opponentName: rawBoardSplit[2],
    board: rawBoardSplit.slice(6, 6 + 26).map(function(x) {
      return parseInt(x);
    }),

    matchLength: parseInt(rawBoardSplit[3]),
    myScore: parseInt(rawBoardSplit[4]),
    opponentScore: parseInt(rawBoardSplit[5]),
    turn: parseInt(rawBoardSplit[32]),
    dice: tempDice,

    cubeValue: parseInt(rawBoardSplit[37]),
    iMayDouble: parseInt(rawBoardSplit[38]),
    opponentMayDouble: parseInt(rawBoardSplit[39]),
    wasDoubled: parseInt(rawBoardSplit[40]),
    myPiecesOff: parseInt(rawBoardSplit[45]),
    opponentPiecesOff: parseInt(rawBoardSplit[46]),
    crawford: parseInt(rawBoardSplit[51]),
    resignationOffered,
    resignationValue,
  };
}

resignationOfferPending = false;
resignationValue = 0;
function updateBoard(rawBoard) {
  if (resignationOfferPending) { // Ignore board update immediately after resignation offer, since nothing has changed and we don't want to remove the "Accept or reject the resignation" message
    resignationOfferPending = false;
    resignationValue = 0;
    return;
  }
  let resignationOffered = false;
  if (rawBoard.includes('offers to resign')) {
    resignationOffered = true;
    resignationOfferPending = true;
    if (rawBoard.endsWith('a single game.')) {
      resignationValue = 1;
    } else if (rawBoard.endsWith('a gammon.')) {
      resignationValue = 2;
    } else if (rawBoard.endsWith('a backgammon.')) {
      resignationValue = 3;
    } else {
      console.error('Unknown resignation value ' + resignationValue);
    }
  }
  lastState = currentState;
  currentState = parseState(rawBoard);
  if (lastState.turn == -1 && currentState.turn == 1) {
    dontDraw = true;
    window.setTimeout(()=>{
      dontDraw = false;
      drawBoard(currentState);
    }, CPU_DELAY_MS);
  } else {
    drawBoard(currentState);
  }
}

drawBoard();

// const fullState = {
//     board: [8, -8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, -8],

//     matchLength: 5,
//     myScore: 2,
//     opponentScore: 1,
//     turn: 1,
//     dice: [6, 6],

//     cubeValue: 128,
//     iMayDouble: 1,
//     opponentMayDouble: 0,
//     wasDoubled: 1,
//     myPiecesOff: 2,
//     opponentPiecesOff: -2,
//     crawford: 0,
//     resignationOffered: true,
//     resignationValue: 1,
//   };

// drawBoard(fullState);
