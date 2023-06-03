const backgammonBoard = document.getElementById('backgammonBoard');
const ctx = backgammonBoard.getContext('2d');

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
const w = window.innerWidth*0.97;
const h = window.innerHeight*0.97;

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
const CHECKER_DIAMETER = backgammonBoard.width / 15;

// spacing between checkers
const GAP_BETWEEN_CHKRS = CHECKER_DIAMETER / 7;

// width of the middle bar
const BAR_WIDTH = CHECKER_DIAMETER;

// size of the doubling cube
const DBL_CUBE_SIZE = CHECKER_DIAMETER*0.85;

// spacing off the side of the board
const DBL_CUBE_OFFSET = GAP_BETWEEN_CHKRS;

// size of the rolling dice
const DIE_SIZE = CHECKER_DIAMETER*0.75;
const DIE_DOT_RADIUS = DIE_SIZE / 10;
const GAP_BETWEEN_DICE = CHECKER_DIAMETER / 10;

// max checkers shown
const MAX_CHKRS_SHOWN = 5;
const MAX_BAR_CHKRS_SHOWN = 3;

// flag pole size
const FLAG_POLE_HEIGHT = backgammonBoard.width*ar / 10;
const FLAG_SIZE = backgammonBoard.width*ar / 20;

// const VERTICAL_GAP = backgammonBoard.height / 7;
const VERTICAL_GAP = CHECKER_DIAMETER*1.5;
const POINT_HEIGHT = MAX_CHKRS_SHOWN * CHECKER_DIAMETER;

const BAR_LEFT = CHECKER_DIAMETER * 6 + GAP_BETWEEN_CHKRS * 7;
const BAR_RIGHT = BAR_LEFT + BAR_WIDTH;
const BAR_CENTER = (BAR_LEFT + BAR_RIGHT) / 2;

const BOARD_WIDTH = BAR_RIGHT + CHECKER_DIAMETER * 6 + GAP_BETWEEN_CHKRS * 7;
const BOARD_HEIGHT = MAX_CHKRS_SHOWN * CHECKER_DIAMETER * 2 + VERTICAL_GAP;

const PLAYER_LEFT_DIE_X = (BAR_RIGHT + BOARD_WIDTH - GAP_BETWEEN_DICE) / 2 - DIE_SIZE;
const PLAYER_RIGHT_DIE_X = (BAR_RIGHT + BOARD_WIDTH + GAP_BETWEEN_DICE) / 2;
const OPP_LEFT_DIE_X = (BAR_LEFT - GAP_BETWEEN_DICE) / 2 - DIE_SIZE;
const OPP_RIGHT_DIE_X = (BAR_LEFT + GAP_BETWEEN_DICE) / 2;
const DICE_Y = (BOARD_HEIGHT - DIE_SIZE) / 2;


const BUTTON_WIDTH = DIE_SIZE * 1.5;
const BUTTON_HEIGHT = DIE_SIZE;
const SUBMIT_X = (BAR_LEFT - GAP_BETWEEN_DICE) / 2 - BUTTON_WIDTH;
const CLEAR_X = (BAR_LEFT + GAP_BETWEEN_DICE) / 2;
const BUTTON_MID_Y = (BOARD_HEIGHT - BUTTON_HEIGHT) / 2;

// Calculate the center of the cube
const CUBE_X = (BOARD_WIDTH - DBL_CUBE_SIZE)/2;
const CUBE_CENTER = (BAR_RIGHT + BOARD_WIDTH) / 2;

const ACCEPT_X = CUBE_CENTER + DBL_CUBE_SIZE/2 + DBL_CUBE_OFFSET;
const REJECT_X = CUBE_CENTER - DBL_CUBE_SIZE/2 - DBL_CUBE_OFFSET - BUTTON_WIDTH;

// under my rightmost checker
const RESIGN_WIDTH = CHECKER_DIAMETER;
const RESIGN_HEIGHT = CHECKER_DIAMETER;
const RESIGN_X = BAR_RIGHT + 5*(CHECKER_DIAMETER + GAP_BETWEEN_CHKRS) + RESIGN_WIDTH/2;
const RESIGN_Y = BOARD_HEIGHT + RESIGN_HEIGHT + GAP_BETWEEN_CHKRS;

const FONT_SIZE = (CHECKER_DIAMETER/3.3).toString();
const FONT_SIZE_SMALL = (CHECKER_DIAMETER/5).toString();

const FONT = FONT_SIZE+'px sans-serif';
const FONT_SMALL = FONT_SIZE_SMALL+'px sans-serif';


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
    checkerCenterVertical = CHECKER_DIAMETER / 2;
  } else {
    checkerCenterVertical = BOARD_HEIGHT - CHECKER_DIAMETER / 2;
  }

  if (numCheckers > 0) {
    ctx.fillStyle = playerColor;
  } else {
    ctx.fillStyle = opponentColor;
  }

  for (let i = 0; i < Math.min(Math.abs(numCheckers), MAX_CHKRS_SHOWN); i++) {
    ctx.beginPath();
    ctx.arc(pointStart + CHECKER_DIAMETER / 2, checkerCenterVertical, CHECKER_DIAMETER / 2, 0, 2 * Math.PI);
    ctx.fill();

    checkerCenterVertical += (direction * CHECKER_DIAMETER);
  }

  if (Math.abs(numCheckers) > MAX_CHKRS_SHOWN) {
    ctx.font = FONT;
    ctx.fillStyle = 'white';
    const text = Math.abs(numCheckers);
    ctx.fillText(text, pointStart + CHECKER_DIAMETER / 2 - ctx.measureText(text).width / 2, checkerCenterVertical - direction * CHECKER_DIAMETER + 2);
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

  let checkerCenterVertical = BOARD_HEIGHT / 2 + direction * (GAP_BETWEEN_CHKRS + (CHECKER_DIAMETER+DBL_CUBE_SIZE) / 2);
  for (let i = 0; i < Math.min(Math.abs(numCheckers), MAX_BAR_CHKRS_SHOWN); i++) {
    ctx.beginPath();
    ctx.arc(BAR_CENTER, checkerCenterVertical, CHECKER_DIAMETER / 2, 0, 2 * Math.PI);
    ctx.fill();

    checkerCenterVertical += (direction * CHECKER_DIAMETER);
  }

  if (Math.abs(numCheckers) > MAX_BAR_CHKRS_SHOWN) {
    ctx.font = FONT;
    ctx.fillStyle = 'white';
    const text = Math.abs(numCheckers);
    ctx.fillText(Math.abs(numCheckers), BAR_CENTER - ctx.measureText(text).width / 2, checkerCenterVertical - direction * CHECKER_DIAMETER + 2);
  }

  ctx.fillStyle = 'grey';
}

dontDraw = false;

function drawPoints(boardState) {
  let pointStart = 5;
  let bottom = false;
  for (let i = 0; i < 25; i++) {
    if (i == 0 || i == 12) pointStart = GAP_BETWEEN_CHKRS;
    if (i>=12) bottom = true;
    if (i == 6 || i == 18) pointStart+=(BAR_WIDTH + GAP_BETWEEN_CHKRS);
    ctx.beginPath();
    ctx.moveTo(pointStart, bottom ? BOARD_HEIGHT : 0);
    ctx.lineTo(pointStart + CHECKER_DIAMETER / 2, bottom ? BOARD_HEIGHT - POINT_HEIGHT : POINT_HEIGHT);
    ctx.lineTo(pointStart + CHECKER_DIAMETER, bottom ? BOARD_HEIGHT : 0);
    if (bottom ^ i % 2 == 0) {
      ctx.stroke();
    } else {
      ctx.fill();
    }
    if (boardState) {
      if (!bottom) drawCheckers(ctx, boardState.board[24 - i], pointStart, bottom ? -1 : 1);
      else if (i >= 12 && i <= 24) drawCheckers(ctx, boardState.board[i-11], pointStart, bottom ? -1 : 1);
    }

    pointStart += (CHECKER_DIAMETER + GAP_BETWEEN_CHKRS);
  }
}

function drawButton(buttonX, buttonY, buttonText, buttonColor = 'lightgray', textColor= 'black') {
  ctx.fillStyle = buttonColor;
  ctx.fillRect(buttonX, buttonY, BUTTON_WIDTH, BUTTON_HEIGHT);
  ctx.fillStyle = textColor;
  ctx.font = FONT;
  ctx.fillText(buttonText, buttonX + BUTTON_WIDTH / 2 - ctx.measureText(buttonText).width / 2, buttonY + BUTTON_HEIGHT / 2 + 4);
}

function drawText(x, y, maxWidth, lineHeight, text) {
    ctx.fillStyle = 'black';
    ctx.font = FONT;
    
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

    // Calculate the maximum line width and total height
    let maxLineWidth = 0;
    let totalHeight = lines.length * lineHeight;

    lines.forEach(line => {
        const lineWidth = ctx.measureText(line).width;
        if (lineWidth > maxLineWidth) {
            maxLineWidth = lineWidth;
        }
    });

    // Draw the rectangle behind the text
    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';  // set the color and opacity of the rectangle
    ctx.fillRect(x - maxLineWidth / 2 - 10, y - totalHeight/2, maxLineWidth + 20, totalHeight + 20);

    // Draw the text
    ctx.fillStyle = 'black';
    for (let i = 0; i < lines.length; i++) {
        const x = BOARD_WIDTH/2 - ctx.measureText(lines[i]).width / 2;
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
  ctx.rect(1, 0, BOARD_WIDTH, BOARD_HEIGHT);

  // draw bar
  ctx.moveTo(BAR_LEFT, 0);
  ctx.lineTo(BAR_LEFT, BOARD_HEIGHT);
  ctx.moveTo(BAR_RIGHT, 0);
  ctx.lineTo(BAR_RIGHT, BOARD_HEIGHT);

  ctx.stroke();

  drawPoints(boardState);

  if (!boardState) {
    const text = 'Click anywhere to begin. Click anywhere to roll. Click on the checkers to move them. Moves will be made in the order the dice are shown. Invert the dice by clicking on them. After making a move submit it, or if you don\'t like it you can clear it';
    const x = BOARD_WIDTH/2;
    const y = BOARD_HEIGHT / 2 + 4;
    const maxWidth = backgammonBoard.width; // The maximum width of a line, leaving some margin
    const lineHeight = FONT_SIZE;

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
    drawButton(CLEAR_X, BUTTON_MID_Y, 'clear');
    drawButton(SUBMIT_X, BUTTON_MID_Y, 'submit');
  }

  if (!boardState.crawford) {
    ctx.strokeStyle = 'black';
    let cubeVertical;
    let cubeValueToShow;
    if (boardState.wasDoubled) {
      cubeValueToShow = boardState.cubeValue * 2;
      cubeVertical = (BOARD_HEIGHT - DBL_CUBE_SIZE) / 2;
      if (boardState.wasDoubled > 0) { // opponent doubled player
      } else { // player doubled opponent
        drawButton(ACCEPT_X, cubeVertical, 'accept', 'green');
        drawButton(REJECT_X, cubeVertical, 'reject', 'red');
      }
    } else {
      cubeValueToShow = boardState.cubeValue;
      if (boardState.iMayDouble && boardState.opponentMayDouble) { // centered cube
        cubeVertical = (BOARD_HEIGHT - DBL_CUBE_SIZE) / 2;
      } else if (boardState.iMayDouble) {
        cubeVertical = BOARD_HEIGHT - DBL_CUBE_SIZE - DBL_CUBE_OFFSET;
      } else if (boardState.opponentMayDouble) {
        cubeVertical = DBL_CUBE_OFFSET;
      }
    }
    ctx.strokeRect(CUBE_X, cubeVertical, DBL_CUBE_SIZE, DBL_CUBE_SIZE);
    ctx.font = FONT;
    ctx.fillStyle = 'black';
    ctx.fillText(cubeValueToShow, CUBE_X + (DBL_CUBE_SIZE - ctx.measureText(cubeValueToShow).width) / 2, cubeVertical + DBL_CUBE_SIZE / 2 + 4);
  }

  // dont draw pieces off for now

  //   if (boardState.myPiecesOff > 0) {
  //     ctx.fillStyle = playerColor;
  //     var checkerOffHorizontal = BOARD_WIDTH + DBL_CUBE_OFFSET + DBL_CUBE_SIZE / 2;
  //     var checkerOffVertical = BOARD_HEIGHT - DBL_CUBE_SIZE - GAP_BETWEEN_CHKRS - CHECKER_DIAMETER / 2;
  //     ctx.beginPath();
  //     ctx.arc(checkerOffHorizontal, checkerOffVertical, CHECKER_DIAMETER / 2, 0, 2 * Math.PI);
  //     ctx.fill();
  //     ctx.fillStyle = 'white';
  //     ctx.font = '14px sans-serif';
  //     ctx.fillText(boardState.myPiecesOff, checkerOffHorizontal - ctx.measureText(boardState.myPiecesOff).width / 2, checkerOffVertical + 4);
  //   }

  //   if (boardState.opponentPiecesOff > 0) {
  //     ctx.fillStyle = opponentColor;
  //     var checkerOffHorizontal = BOARD_WIDTH + DBL_CUBE_OFFSET + DBL_CUBE_SIZE / 2;
  //     var checkerOffVertical = 2 + DBL_CUBE_SIZE + GAP_BETWEEN_CHKRS + CHECKER_DIAMETER / 2;
  //     ctx.beginPath();
  //     ctx.arc(checkerOffHorizontal, checkerOffVertical, CHECKER_DIAMETER / 2, 0, 2 * Math.PI);
  //     ctx.fill();
  //     ctx.fillStyle = 'white';
  //     ctx.font = '14px sans-serif';
  //     ctx.fillText(boardState.opponentPiecesOff, checkerOffHorizontal - ctx.measureText(boardState.opponentPiecesOff).width / 2, checkerOffVertical + 4);
  //   }

  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.moveTo(RESIGN_X, RESIGN_Y - RESIGN_HEIGHT); // start drawing the pole from the bottom of the flag
  ctx.lineTo(RESIGN_X, RESIGN_Y); // draw the pole up to the top of the flag
  ctx.stroke();
  ctx.strokeRect(RESIGN_X, RESIGN_Y - RESIGN_HEIGHT, FLAG_SIZE, FLAG_SIZE); // draw the flag above the pole
  ctx.fillStyle = 'black';
  ctx.font = FONT_SMALL;
  ctx.fillText('resign', RESIGN_X + FLAG_SIZE / 2 - ctx.measureText('resign').width / 2, RESIGN_Y - RESIGN_HEIGHT + FLAG_SIZE / 2 + FONT_SIZE_SMALL/3); // place the text at the center of the flag

  if (boardState.resignationOffered) {
    let resignationFlagHorizontal;
    if (boardState.turn == 1) { // player offered resignation to opponent
      resignationFlagHorizontal = (BAR_LEFT - FLAG_POLE_HEIGHT/2) / 2;
    } else { // opponent offered resignation to player
      resignationFlagHorizontal = (BAR_RIGHT + BOARD_WIDTH -FLAG_POLE_HEIGHT/2) / 2;
      drawButton(ACCEPT_X, cubeVertical, 'accept', 'green');
      drawButton(REJECT_X, cubeVertical, 'reject', 'red');
    }

    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(resignationFlagHorizontal, (BOARD_HEIGHT - FLAG_POLE_HEIGHT) / 2);
    ctx.lineTo(resignationFlagHorizontal, (BOARD_HEIGHT + FLAG_POLE_HEIGHT) / 2);
    ctx.stroke();
    ctx.strokeRect(resignationFlagHorizontal, (BOARD_HEIGHT - FLAG_POLE_HEIGHT) / 2, FLAG_SIZE, FLAG_SIZE);
    ctx.fillStyle = 'black';
    ctx.font = FONT;
    ctx.fillText(boardState.resignationValue, resignationFlagHorizontal + FLAG_SIZE / 2 - ctx.measureText(boardState.resignationValue).width / 2, (BOARD_HEIGHT - FLAG_POLE_HEIGHT + FLAG_SIZE) / 2 + 4);
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
      intermediatePoint(dieStartPoint, dieStartPoint + DIE_SIZE, 0.5),
      intermediatePoint(DICE_Y, DICE_Y + DIE_SIZE, 0.5),
      DIE_DOT_RADIUS, 0, 2 * Math.PI);
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
      intermediatePoint(dieStartPoint, dieStartPoint + DIE_SIZE, 0.25),
      intermediatePoint(DICE_Y, DICE_Y + DIE_SIZE, 0.25),
      DIE_DOT_RADIUS, 0, 2 * Math.PI);
  ctx.arc(
      intermediatePoint(dieStartPoint, dieStartPoint + DIE_SIZE, 0.75),
      intermediatePoint(DICE_Y, DICE_Y + DIE_SIZE, 0.75),
      DIE_DOT_RADIUS, 0, 2 * Math.PI);
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
      intermediatePoint(dieStartPoint, dieStartPoint + DIE_SIZE, 0.75),
      intermediatePoint(DICE_Y, DICE_Y + DIE_SIZE, 0.25),
      DIE_DOT_RADIUS, 0, 2 * Math.PI);
  ctx.arc(
      intermediatePoint(dieStartPoint, dieStartPoint + DIE_SIZE, 0.25),
      intermediatePoint(DICE_Y, DICE_Y + DIE_SIZE, 0.75),
      DIE_DOT_RADIUS, 0, 2 * Math.PI);
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
      intermediatePoint(dieStartPoint, dieStartPoint + DIE_SIZE, 0.25),
      intermediatePoint(DICE_Y, DICE_Y + DIE_SIZE, 0.5),
      DIE_DOT_RADIUS, 0, 2 * Math.PI);
  ctx.arc(
      intermediatePoint(dieStartPoint, dieStartPoint + DIE_SIZE, 0.75),
      intermediatePoint(DICE_Y, DICE_Y + DIE_SIZE, 0.5),
      DIE_DOT_RADIUS, 0, 2 * Math.PI);
  ctx.fill();
}


function drawDie(ctx, dieStartPoint, color, dieValue) {
  ctx.fillStyle = color;
  ctx.fillRect(dieStartPoint, DICE_Y, DIE_SIZE, DIE_SIZE);
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
    leftDieStartPoint = PLAYER_LEFT_DIE_X;
    rightDieStartPoint = PLAYER_RIGHT_DIE_X;
  } else {
    color = opponentColor;
    leftDieStartPoint = OPP_LEFT_DIE_X;
    rightDieStartPoint = OPP_RIGHT_DIE_X;
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
      const cubeVertical = (BOARD_HEIGHT - DBL_CUBE_SIZE) / 2;
      if (isWithinArea(x, y, ACCEPT_X, cubeVertical, BUTTON_WIDTH, BUTTON_HEIGHT)) {
        gnubgCommand('accept');
        return;
      }

      if (isWithinArea(x, y, REJECT_X, cubeVertical, BUTTON_WIDTH, BUTTON_HEIGHT)) {
        gnubgCommand('reject');
        return;
      }
    }

    if (currentState.iMayDouble && currentState.turn == 1) {
      let cubeVertical;
      if (currentState.opponentMayDouble) { // centered cube
        cubeVertical = (BOARD_HEIGHT - DBL_CUBE_SIZE) / 2;
      } else {
        cubeVertical = BOARD_HEIGHT - DBL_CUBE_SIZE;
      }
      if (isWithinArea(x, y, CUBE_X, cubeVertical, DBL_CUBE_SIZE, DBL_CUBE_SIZE)) {
        gnubgCommand('double');
        return;
      }
    }


    roll();
    return;
  }

  // Touch dice to invert them
  if (isWithinArea(x, y, PLAYER_LEFT_DIE_X, DICE_Y, PLAYER_RIGHT_DIE_X - PLAYER_LEFT_DIE_X + DIE_SIZE, DIE_SIZE)) {
    handleDiceInversion();
    return;
  }

  // Clear
  if (isWithinArea(x, y, CLEAR_X, BUTTON_MID_Y, BUTTON_WIDTH, BUTTON_HEIGHT)) {
    handleClearButtonPress();
    return;
  }

  // Submit
  if (isWithinArea(x, y, SUBMIT_X, BUTTON_MID_Y, BUTTON_WIDTH, BUTTON_HEIGHT)) {
    handleSubmitButtonPress();
    return;
  }

  // Perform logic based on the click coordinates
  if (currentState.turn == 1) {
  // Submit
    if (isWithinArea(x, y, RESIGN_X, RESIGN_Y - RESIGN_HEIGHT, RESIGN_WIDTH, RESIGN_HEIGHT)) {
      handleResignButtonPress();
      return;
    }

    // Check if click is within bar area
    if (isWithinArea(x, y, BAR_LEFT, 0, BAR_WIDTH, BOARD_HEIGHT)) {
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
  if (x > BAR_RIGHT) {
    x -= (BAR_RIGHT - BAR_LEFT);
  }
  return x;
}

function calculatePoint(x, y) {
  let point = Math.floor(x / (CHECKER_DIAMETER + GAP_BETWEEN_CHKRS)) + 1;
  if (point > 12) point = 0;
  if (y < BOARD_HEIGHT / 2) {
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

let resignationOfferPending = false;
let resignationValue = 0;
function updateBoard(rawBoard) {
  if (resignationOfferPending) { // Ignore board update immediately after resignation offer, since nothing has changed and we don't want to remove the "Accept or reject the resignation" message
    resignationOfferPending = false;
    resignationValue = 0;
    return;
  }
  if (rawBoard.includes('offers to resign')) {
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
