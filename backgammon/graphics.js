var backgammonBoard = document.getElementById('backgammonBoard');
var ctx = backgammonBoard.getContext('2d');

// TODO:
// offer/propose resignation

// use typescript

// fix resignation flag not appearing

// add color settings

// draw canvas buttons under board?

// factor out colors to top of file

// need current board for temp move graphics
let currentState = {};
let lastState = {};

// make as large as posssible
var w = window.innerWidth;
var h = window.innerHeight;
if (h / w < 0.6) {
  backgammonBoard.width = h / 0.6;
  backgammonBoard.height = h;
} else {
  backgammonBoard.width = w;
  backgammonBoard.height = backgammonBoard.width * 0.6;
}

// size of the spaces and radius of the pieces
const checkerDiameter = backgammonBoard.width / 20;

// spacing between checkers
const gapBetweenCheckers = backgammonBoard.width / 120;

// width of the middle bar
const barWidth = backgammonBoard.width / 15;

// size of the doubling cube
const doublingCubeSize = checkerDiameter;

// spacing off the side of the board
const doublingCubeOffset = gapBetweenCheckers;

// size of the rolling dice
const dieSize = checkerDiameter;
const dieDotRadius = dieSize / 10;
const gapBetweenDice = backgammonBoard.width / 150;

// max checkers shown
const maxCheckersShown = 5;
const maxBarCheckersShown = 4;

// flag pole size
const resignFlagPoleHeight = backgammonBoard.height / 10;
const resignFlagSize = backgammonBoard.height / 18;

const verticalGap = backgammonBoard.height / 7;
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
const cubeCenter = (barRightBoundary + boardWidth) / 2;

const acceptHorizontal = cubeCenter + doublingCubeSize/2 + doublingCubeOffset;
const rejectHorizontal = cubeCenter - doublingCubeSize/2 - doublingCubeOffset - buttonWidth;

const playerColor = 'purple';
const opponentColor = 'orange';

// Get the desired board width based on current calculations
var desiredBoardWidth = barRightBoundary + checkerDiameter * 6 + gapBetweenCheckers * 7 + doublingCubeSize + 2*doublingCubeOffset;

// Update backgammonBoard.width to match the desiredBoardWidth
backgammonBoard.width = desiredBoardWidth;

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

  let checkerCenterVertical = boardHeight / 2 + direction * (gapBetweenCheckers + checkerDiameter / 2);
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

function drawBoard(boardState) {
  console.log(boardState);
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'grey';
  ctx.clearRect(0, 0, backgammonBoard.width, backgammonBoard.height);

  // 1-12 = lower, 13-24 = upper
  // for now, we will draw it so that the player always plays counterclockwise
  // so the 1-point is in the lower left hand corner

  // draw outer boundary of board
  ctx.beginPath();
  ctx.rect(0, 0, boardWidth, boardHeight);

  // draw bar
  ctx.moveTo(barLeftBoundary, 0);
  ctx.lineTo(barLeftBoundary, boardHeight);
  ctx.moveTo(barRightBoundary, 0);
  ctx.lineTo(barRightBoundary, boardHeight);

  ctx.stroke();

  // draw upper left points
  var pointStart = gapBetweenCheckers;
  for (var i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(pointStart, 0);
    ctx.lineTo(pointStart + checkerDiameter / 2, pointHeight);
    ctx.lineTo(pointStart + checkerDiameter, 0);
    if (i % 2 == 0) {
      ctx.stroke();
    } else {
      ctx.fill();
    }
    if (boardState) {
      drawCheckers(ctx, boardState.board[24 - i], pointStart, 1);
    }

    pointStart += (checkerDiameter + gapBetweenCheckers);
  }

  // draw upper right points
  pointStart += (barWidth + gapBetweenCheckers);
  for (var i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(pointStart, 0);
    ctx.lineTo(pointStart + checkerDiameter / 2, pointHeight);
    ctx.lineTo(pointStart + checkerDiameter, 0);
    if (i % 2 == 0) {
      ctx.stroke();
    } else {
      ctx.fill();
    }
    if (boardState) {
      drawCheckers(ctx, boardState.board[18 - i], pointStart, 1);
    }

    pointStart += (checkerDiameter + gapBetweenCheckers);
  }


  // draw lower left points
  var pointStart = gapBetweenCheckers;
  for (var i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(pointStart, boardHeight);
    ctx.lineTo(pointStart + checkerDiameter / 2, boardHeight - pointHeight);
    ctx.lineTo(pointStart + checkerDiameter, boardHeight);
    if (i % 2 == 1) {
      ctx.stroke();
    } else {
      ctx.fill();
    }
    if (boardState) {
      drawCheckers(ctx, boardState.board[i + 1], pointStart, -1);
    }
    pointStart += (checkerDiameter + gapBetweenCheckers);
  }

  // draw lower right points
  pointStart += (barWidth + gapBetweenCheckers);
  for (var i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(pointStart, boardHeight);
    ctx.lineTo(pointStart + checkerDiameter / 2, boardHeight - pointHeight);
    ctx.lineTo(pointStart + checkerDiameter, boardHeight);
    if (i % 2 == 1) {
      ctx.stroke();
    } else {
      ctx.fill();
    }
    if (boardState) {
      drawCheckers(ctx, boardState.board[i + 7], pointStart, -1);
    }

    pointStart += (checkerDiameter + gapBetweenCheckers);
  }

  if (!boardState) {
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
    ctx.fillStyle = 'lightgray';
    ctx.fillRect(clearLeft, clearSubmitBottom, buttonWidth, buttonHeight);
    ctx.fillRect(submitLeft, clearSubmitBottom, buttonWidth, buttonHeight);
    ctx.fillStyle = 'black';
    ctx.font = '14px sans-serif';
    ctx.fillText('clear', clearLeft + buttonWidth / 2 - ctx.measureText('clear').width / 2, clearSubmitBottom + buttonHeight / 2 + 4);
    ctx.fillText('submit', submitLeft + buttonWidth / 2 - ctx.measureText('submit').width / 2, clearSubmitBottom + buttonHeight / 2 + 4);
  }

  if (!boardState.crawford) {
    ctx.strokeStyle = 'black';
    let cubeVertical;
    let cubeHorizontal;
    let cubeValueToShow;
    if (boardState.wasDoubled) {
      cubeValueToShow = boardState.cubeValue * 2;
      cubeVertical = (boardHeight - doublingCubeSize) / 2;
      if (boardState.wasDoubled > 0) { // opponent doubled player
        cubeHorizontal = (barLeftBoundary - doublingCubeSize) / 2;
      } else { // player doubled opponent
        cubeHorizontal = (barRightBoundary + boardWidth - doublingCubeSize) / 2;

        ctx.fillStyle = 'green';
        ctx.fillRect(acceptHorizontal, cubeVertical, buttonWidth, buttonHeight);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = 'black';
        const text = 'accept';
        const textSize = ctx.measureText(text);
        const textX = acceptHorizontal + (buttonWidth - textSize.width) / 2;
        const textY = cubeVertical + (buttonHeight + 14) / 2; // 14 is the font size
        ctx.fillText(text, textX, textY - 2);

        ctx.fillStyle = 'red'; // or any color you want for the "reject" button
        ctx.fillRect(rejectHorizontal, cubeVertical, buttonWidth, buttonHeight);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = 'black';
        const text2 = 'reject';
        const textSize2 = ctx.measureText(text2);
        const textX2 = rejectHorizontal + (buttonWidth - textSize2.width) / 2;
        const textY2 = cubeVertical + (buttonHeight + 14) / 2; // 14 is the font size
        ctx.fillText(text2, textX2, textY2 - 2);
      }
    } else {
      cubeValueToShow = boardState.cubeValue;
      cubeHorizontal = boardWidth + doublingCubeOffset;
      if (boardState.iMayDouble && boardState.opponentMayDouble) { // centered cube
        cubeVertical = (boardHeight - doublingCubeSize) / 2;
      } else if (boardState.iMayDouble) {
        cubeVertical = boardHeight - doublingCubeSize;
      } else if (boardState.opponentMayDouble) {
        cubeVertical = 2;
      }
    }
    ctx.strokeRect(cubeHorizontal, cubeVertical, doublingCubeSize, doublingCubeSize);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'black';
    ctx.fillText(cubeValueToShow, cubeHorizontal + (doublingCubeSize - ctx.measureText(cubeValueToShow).width) / 2, cubeVertical + doublingCubeSize / 2 + 4);
  }

  if (boardState.myPiecesOff > 0) {
    ctx.fillStyle = playerColor;
    var checkerOffHorizontal = boardWidth + doublingCubeOffset + doublingCubeSize / 2;
    var checkerOffVertical = boardHeight - doublingCubeSize - gapBetweenCheckers - checkerDiameter / 2;
    ctx.beginPath();
    ctx.arc(checkerOffHorizontal, checkerOffVertical, checkerDiameter / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.fillText(boardState.myPiecesOff, checkerOffHorizontal - ctx.measureText(boardState.myPiecesOff).width / 2, checkerOffVertical + 4);
  }

  if (boardState.opponentPiecesOff > 0) {
    ctx.fillStyle = opponentColor;
    var checkerOffHorizontal = boardWidth + doublingCubeOffset + doublingCubeSize / 2;
    var checkerOffVertical = 2 + doublingCubeSize + gapBetweenCheckers + checkerDiameter / 2;
    ctx.beginPath();
    ctx.arc(checkerOffHorizontal, checkerOffVertical, checkerDiameter / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.fillText(boardState.opponentPiecesOff, checkerOffHorizontal - ctx.measureText(boardState.opponentPiecesOff).width / 2, checkerOffVertical + 4);
  }

  if (boardState.resignationOffered) {
    let resignationFlagHorizontal;
    if (boardState.turn == 1) { // player offered resignation to opponent
      resignationFlagHorizontal = barLeftBoundary / 2;
    } else { // opponent offered resignation to player
      resignationFlagHorizontal = (barRightBoundary + boardWidth) / 2;
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
  const {
    offsetX: x,
    offsetY: y,
  } = ev;
  if (!currentState.board) {
    newGame();
    return;
  } else if (currentState.dice.length === 0) {
    if (currentState.wasDoubled) {
      const cubeVertical = (boardHeight - doublingCubeSize) / 2;
      if (x >= acceptHorizontal && x <= acceptHorizontal + buttonWidth &&
        y >= cubeVertical && y <= cubeVertical + buttonHeight) {
        gnubgCommand('accept');
        return;
      }

      if (x >= rejectHorizontal && x <= rejectHorizontal + buttonWidth &&
        y >= cubeVertical && y <= cubeVertical + buttonHeight) {
        gnubgCommand('reject');
        return;
      }
    }

    if (currentState.iMayDouble && currentState.turn == 1) {
      if (currentState.opponentMayDouble) { // centered cube
        if (x >= boardWidth + doublingCubeOffset && x <= boardWidth + doublingCubeOffset + doublingCubeSize &&
                y >= (boardHeight - doublingCubeSize) / 2 && y <= (boardHeight - doublingCubeSize) / 2 + doublingCubeSize) {
          gnubgCommand('double');
          return;
        }
      } else {
        if (x >= boardWidth + doublingCubeOffset && x <= boardWidth + doublingCubeOffset + doublingCubeSize &&
                y >= boardHeight - doublingCubeSize && y <= boardHeight) {
          gnubgCommand('double');
          return;
        }
      }
    }

    roll();
    return;
  }

  // Touch dice to invert them
  if (isInDiceArea(x, y)) {
    handleDiceInversion();
    return;
  }

  // Clear
  if (isInClearButtonArea(x, y)) {
    handleClearButtonPress();
    return;
  }

  // Submit
  if (isInSubmitButtonArea(x, y)) {
    handleSubmitButtonPress();
    return;
  }

  // Perform logic based on the click coordinates
  if (isInBarArea(x)) {
    handleBarAreaClick();
  } else {
    handleBoardAreaClick(x, y);
  }

  if (isMovesFinished()) {
    processMoves();
  }
  console.log(moves);
};

function isInDiceArea(x, y) {
  return x >= playerLeftDieStartPoint && x <= playerRightDieStartPoint + dieSize && y >= diceVerticalStartPoint && y < diceVerticalStartPoint + dieSize;
}

function handleDiceInversion() {
  currentState.dice = currentState.dice.reverse();
  drawBoard(currentState);
}

function isInClearButtonArea(x, y) {
  return x >= clearLeft && x <= clearLeft + buttonWidth && y >= clearSubmitBottom && y < clearSubmitBottom + buttonHeight;
}

function handleClearButtonPress() {
  gnubgCommand('prev');
  gnubgCommand('next');
  moves = [];
  drawBoard(currentState);
}

function isInSubmitButtonArea(x, y) {
  return x >= submitLeft && x <= submitLeft + buttonWidth && y >= clearSubmitBottom && y < clearSubmitBottom + buttonHeight;
}

function handleSubmitButtonPress() {
  gnubgCommand(moves.join(' '));
  moves = [];
}

function isInBarArea(x) {
  return x >= barLeftBoundary && x <= barRightBoundary;
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
  console.log(currentState.board[point], point, currentState.dice[moves.length], currentState.dice);

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

  if (lastChecker <= currentState.dice[0]) { // Bearing off
    handleBearingOff(point);
  } else if (currentState.board[point - currentState.dice[moves.length]] >= -1) { // You can land at the spot safely
    handleSafeLanding(point, lastChecker);
  }
}

function getLastChecker() {
  let lastChecker = Infinity;
  for (let i = 0; i < currentState.board.length; i++) {
    if (currentState.board[i] > 0) lastChecker = i;
  }
  return lastChecker;
}

function handleBearingOff(point) {
  currentState.myPiecesOff += 1;
  currentState.board[point] -= 1;
  moves.push(`${point}/0`);
}

function handleSafeLanding(point, lastChecker) {
  const targetIndex = point - currentState.dice[moves.length];
  if (targetIndex === 0 && lastChecker > 6) return;

  if (currentState.board[targetIndex] === -1) { // You landed on their piece
    currentState.opponentPiecesOff = currentState.opponentPiecesOff + 1;
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
  // console.log("event: " + JSON.stringify(data.detail));
  updateBoard(data.detail);
  window.setTimeout(doNextTurn, 100); // timeout?
});

function parseState(rawBoard) {
  const rawBoardSplit = rawBoard.split(':');
  let resignationOffered = false;
  let resignationValue = 0;
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

function updateBoard(rawBoard) {
  lastState = currentState;
  currentState = parseState(rawBoard);
  drawBoard(currentState);
}

drawBoard();
