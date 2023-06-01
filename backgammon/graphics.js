var backgammonBoard = document.getElementById("backgammonBoard");
var ctx = backgammonBoard.getContext("2d");

//TODO:
// accept or decline double (put 2 buttons besides cube?)
// offer/propose double (there are 2 locations to do this)

//issues bearing off.. cant add to eaten pieces and can sometimes move to 0 when not appropriate

//change how click areas are detected?

//add their piece to the bar when landing on them

//Refactor/simplify this file

//draw canvas buttons under board?

//need current board for temp move graphics
let currentState = {};
let lastState = {};

//make as large as posssible
var w = window.innerWidth;
var h = window.innerHeight;
if(h/w < 0.6){
    backgammonBoard.width = h/0.6;
    backgammonBoard.height = h;
} else {
    backgammonBoard.width = w;
    backgammonBoard.height = backgammonBoard.width*0.6;
}

//size of the spaces and radius of the pieces
let checkerDiameter = backgammonBoard.width/20;

//spacing between checkers
let gapBetweenCheckers = backgammonBoard.width/120;

//width of the middle bar
let barWidth = backgammonBoard.width/15;

//size of the doubling cube
let doublingCubeSize = checkerDiameter;

//spacing off the side of the board
let doublingCubeOffset = gapBetweenCheckers;

//size of the rolling dice
let dieSize = checkerDiameter;
let dieDotRadius = dieSize/10;
let gapBetweenDice = backgammonBoard.width/150;

//max checkers shown
let maxCheckersShown = 5;
let maxBarCheckersShown = 4;

//flag pole size
let resignFlagPoleHeight = backgammonBoard.height/10;
let resignFlagSize = backgammonBoard.height/18;

let verticalGap = backgammonBoard.height/7;
let pointHeight = maxCheckersShown * checkerDiameter;

let barLeftBoundary = checkerDiameter * 6 + gapBetweenCheckers * 7;
let barRightBoundary = barLeftBoundary + barWidth;
let barCenter = (barLeftBoundary + barRightBoundary) / 2;
let boardWidth = barRightBoundary + checkerDiameter * 6 + gapBetweenCheckers * 7;
let boardHeight = maxCheckersShown * checkerDiameter * 2 + verticalGap;

let playerLeftDieStartPoint = (barRightBoundary + boardWidth - gapBetweenDice) / 2 - dieSize;
let playerRightDieStartPoint = (barRightBoundary + boardWidth + gapBetweenDice) / 2;
let opponentLeftDieStartPoint = (barLeftBoundary - gapBetweenDice) / 2 - dieSize;
let opponentRightDieStartPoint = (barLeftBoundary + gapBetweenDice) / 2;
let diceVerticalStartPoint = (boardHeight - dieSize) / 2;


let buttonWidth = dieSize*1.5;
let buttonHeight = dieSize;
let submitLeft = (barLeftBoundary - gapBetweenDice) / 2 - buttonWidth;
let clearLeft = (barLeftBoundary + gapBetweenDice) / 2;
let clearSubmitBottom = (boardHeight - buttonHeight) / 2;

let playerColor = "red";
let opponentColor = "blue";

function drawCheckers(ctx, numCheckers, pointStart, direction) {
    if (numCheckers == 0) {
        return;
    }
     
    var checkerCenterVertical;
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

    for (var i=0; i<Math.min(Math.abs(numCheckers), maxCheckersShown); i++) {
        ctx.beginPath();
        ctx.arc(pointStart + checkerDiameter / 2, checkerCenterVertical, checkerDiameter / 2, 0, 2*Math.PI);
        ctx.fill();
        
        checkerCenterVertical += (direction * checkerDiameter);
    }

    if (Math.abs(numCheckers) > maxCheckersShown) {
        ctx.font = "14px sans-serif"; // scale fonts?
        ctx.fillStyle = "white";
        var text = Math.abs(numCheckers);
        ctx.fillText(text, pointStart + checkerDiameter / 2 - ctx.measureText(text).width / 2, checkerCenterVertical - direction * checkerDiameter + 2);
    }

    ctx.fillStyle = "grey";
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

    var checkerCenterVertical = boardHeight / 2 + direction * (gapBetweenCheckers + checkerDiameter / 2);
    for (var i=0; i<Math.min(Math.abs(numCheckers), maxBarCheckersShown); i++) {
        ctx.beginPath();
        ctx.arc(barCenter, checkerCenterVertical, checkerDiameter / 2, 0, 2*Math.PI);
        ctx.fill();

        checkerCenterVertical += (direction * checkerDiameter);
    }

    if (Math.abs(numCheckers) > maxBarCheckersShown) {
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "white";
        var text = Math.abs(numCheckers);
        ctx.fillText(Math.abs(numCheckers), barCenter - ctx.measureText(text).width/2, checkerCenterVertical - direction * checkerDiameter + 2);
    }

    ctx.fillStyle = "grey";
}

function drawBoard(boardState) {
    console.log(boardState);
    ctx.strokeStyle = "black";
    ctx.fillStyle = "grey";
    ctx.clearRect(0,0,backgammonBoard.width,backgammonBoard.height);

    // 1-12 = lower, 13-24 = upper
    // for now, we will draw it so that the player always plays counterclockwise
    // so the 1-point is in the lower left hand corner

    // draw outer boundary of board
    ctx.beginPath();
    ctx.rect(0,0,boardWidth,boardHeight);

    // draw bar
    ctx.moveTo(barLeftBoundary, 0);
    ctx.lineTo(barLeftBoundary, boardHeight);
    ctx.moveTo(barRightBoundary, 0);
    ctx.lineTo(barRightBoundary, boardHeight);
      
    ctx.stroke();

    // draw upper left points
    var pointStart = gapBetweenCheckers;
    for (var i=0; i<6; i++) {
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
	    drawCheckers(ctx, boardState.board[24-i], pointStart, 1);
	}

        pointStart += (checkerDiameter + gapBetweenCheckers);
    }

    // draw upper right points
    pointStart += (barWidth + gapBetweenCheckers);
    for (var i=0; i<6; i++) {
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
	    drawCheckers(ctx, boardState.board[18-i], pointStart, 1);
	}

        pointStart += (checkerDiameter + gapBetweenCheckers);
    }


    // draw lower left points
    var pointStart = gapBetweenCheckers;
    for (var i=0; i<6; i++) {
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
	    drawCheckers(ctx, boardState.board[i+1], pointStart, -1);
	}
        pointStart += (checkerDiameter + gapBetweenCheckers);
    }

    // draw lower right points
    pointStart += (barWidth + gapBetweenCheckers);
    for (var i=0; i<6; i++) {
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
	    drawCheckers(ctx, boardState.board[i+7], pointStart, -1);
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
        // dice = boardState.dice;
    } else {
        // dice = [];
    }
    // currDice = dice;

    if (boardState.turn == 1 && boardState.dice.length!==0) {
        ctx.fillStyle = 'lightgray';
        ctx.fillRect(clearLeft, clearSubmitBottom, buttonWidth, buttonHeight);
        ctx.fillRect(submitLeft, clearSubmitBottom, buttonWidth, buttonHeight);
        ctx.fillStyle = "black";
        ctx.font = "14px sans-serif";
        ctx.fillText('clear', clearLeft +buttonWidth/2 - ctx.measureText('clear').width/2, clearSubmitBottom + buttonHeight/2 + 4);
        ctx.fillText('submit', submitLeft + buttonWidth/2 - ctx.measureText('submit').width/2, clearSubmitBottom + buttonHeight/2 + 4);
    }

    if (!boardState.crawford) {
        ctx.strokeStyle = "black";
        var cubeVertical;
	var cubeHorizontal;
	var cubeValueToShow;
        if (boardState.wasDoubled) {
	    cubeValueToShow = boardState.cubeValue * 2;
	    cubeVertical = (boardHeight - doublingCubeSize) / 2;
	    if (boardState.wasDoubled > 0) {  // opponent doubled player
		cubeHorizontal = (barLeftBoundary - doublingCubeSize) / 2;
	    } else {  // player doubled opponent
		cubeHorizontal = (barRightBoundary + boardWidth - doublingCubeSize) / 2;
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
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "black";
        ctx.fillText(cubeValueToShow, cubeHorizontal + (doublingCubeSize - ctx.measureText(cubeValueToShow).width) / 2, cubeVertical + doublingCubeSize/2 + 4);
    }

    if (boardState.myPiecesOff > 0) {
	ctx.fillStyle = playerColor;
	var checkerOffHorizontal = boardWidth + doublingCubeOffset + doublingCubeSize / 2;
	var checkerOffVertical = boardHeight - doublingCubeSize - gapBetweenCheckers - checkerDiameter / 2;
	ctx.beginPath();
	ctx.arc(checkerOffHorizontal, checkerOffVertical, checkerDiameter / 2, 0, 2*Math.PI);
	ctx.fill();
	ctx.fillStyle = "white";
	ctx.font = "14px sans-serif";
	ctx.fillText(boardState.myPiecesOff, checkerOffHorizontal - ctx.measureText(boardState.myPiecesOff).width/2, checkerOffVertical + 4);
    }

    if (boardState.opponentPiecesOff > 0) {
	ctx.fillStyle = opponentColor;
	var checkerOffHorizontal = boardWidth + doublingCubeOffset + doublingCubeSize / 2;
	var checkerOffVertical = 2 + doublingCubeSize + gapBetweenCheckers + checkerDiameter / 2;
	ctx.beginPath();
	ctx.arc(checkerOffHorizontal, checkerOffVertical, checkerDiameter / 2, 0, 2*Math.PI);
	ctx.fill();
	ctx.fillStyle = "white";
	ctx.font = "14px sans-serif";
	ctx.fillText(boardState.opponentPiecesOff, checkerOffHorizontal - ctx.measureText(boardState.opponentPiecesOff).width/2, checkerOffVertical + 4);
    }

    if (boardState.resignationOffered) {
	var resignationFlagHorizontal;
	if (turn == 1) {  // player offered resignation to opponent
	    resignationFlagHorizontal = barLeftBoundary / 2;
	} else {  // opponent offered resignation to player
	    resignationFlagHorizontal = (barRightBoundary + boardWidth)/2;
	}

	ctx.beginPath();
	ctx.strokeStyle = "black";
	ctx.moveTo(resignationFlagHorizontal, (boardHeight - resignFlagPoleHeight)/2);
	ctx.lineTo(resignationFlagHorizontal, (boardHeight + resignFlagPoleHeight)/2);
	ctx.stroke();
	ctx.strokeRect(resignationFlagHorizontal, (boardHeight - resignFlagPoleHeight)/2, resignFlagSize, resignFlagSize);
	ctx.fillStyle = "black";
	ctx.font = "14px sans-serif";
	ctx.fillText(boardState.resignationValue, resignationFlagHorizontal + resignFlagSize / 2 - ctx.measureText(boardState.resignationValue).width / 2,  (boardHeight - resignFlagPoleHeight + resignFlagSize)/2 + 4);
    }

    // var info = document.getElementById("info");
    // info.innerHTML = "Score: " + myScore + "-" + opponentScore + (matchLength > 0 ? " Match to: " + matchLength : "") + (crawford ? " Crawford" : "");
    // var instructions = document.getElementById("instructions");
    // if (turn == 0) {
	// instructions.innerHTML = "";
    // } else {
	// if (dice1 > 0) {
	//     instructions.innerHTML = "Enter your move below";
	//     document.getElementById("roll").disabled = true;
	//     document.getElementById("double").disabled = true;
	//     document.getElementById("accept").disabled = true;
	//     document.getElementById("reject").disabled = true;
	//     document.getElementById("beaver").disabled = true;
	//     document.getElementById("resign").disabled = false;
	// } else if (wasDoubled) {
	//     instructions.innerHTML = "Accept or reject the double";
	//     document.getElementById("roll").disabled = true;
	//     document.getElementById("double").disabled = true;
	//     document.getElementById("accept").disabled = false;
	//     document.getElementById("reject").disabled = false;
	//     document.getElementById("beaver").disabled = (matchLength > 0);
	//     document.getElementById("resign").disabled = true;
    //     } else if (resignationOffered) {
	//     instructions.innerHTML = "Accept or reject the resignation";
	//     document.getElementById("roll").disabled = true;
	//     document.getElementById("double").disabled = true;
	//     document.getElementById("accept").disabled = false;
	//     document.getElementById("reject").disabled = false;
	//     document.getElementById("beaver").disabled = true;
	//     document.getElementById("resign").disabled = true;
	// } else {
	//     instructions.innerHTML = "Roll or double";
	//     document.getElementById("roll").disabled = false;
	//     document.getElementById("double").disabled = false;
	//     document.getElementById("accept").disabled = true;
	//     document.getElementById("reject").disabled = true;
	//     document.getElementById("beaver").disabled = true;
	//     document.getElementById("resign").disabled = false;
	// }
    // }
}

function intermediatePoint(a, b, t) {
    return (1-t)*a + b*t;
}
/*
  -----
 |     |
 |  .  |
 |     |
  -----     
 */
function drawDieCenterDot(ctx, dieStartPoint) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.5),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.5),
	    dieDotRadius, 0, 2*Math.PI);
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
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.25),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.25),
	    dieDotRadius, 0, 2*Math.PI);
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.75),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.75),
	    dieDotRadius, 0, 2*Math.PI);
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
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.75),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.25),
	    dieDotRadius, 0, 2*Math.PI);
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.25),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.75),
	    dieDotRadius, 0, 2*Math.PI);
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
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.25),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.5),
	    dieDotRadius, 0, 2*Math.PI);
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.75),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.5),
	    dieDotRadius, 0, 2*Math.PI);
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
    var color, leftDieStartPoint, rightDieStartPoint;
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

window.addEventListener("load", function () {
    var form = document.getElementById("command_form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var command_text_element = document.getElementById("command_text");
        var command = command_text_element.value;
        gnubgCommand(command);
        command_text_element.value = "";
    });

    // draw an empty board on initial load
    drawBoard();
});

var backgammonBoard = document.getElementById("backgammonBoard");
var ctx = backgammonBoard.getContext("2d");

let moves = [];

backgammonBoard.onclick = function(ev) {
    if(!currentState.board){
        newGame();
        return;
    }
    console.log(currentState.dice.length)
    if(currentState.dice.length == 0){
        roll();
        return;
    }
    var x = ev.offsetX;
    var y = ev.offsetY;

    //touch dice to invert them
    if (x >= playerLeftDieStartPoint && x <= playerRightDieStartPoint+dieSize && y >= diceVerticalStartPoint && y < diceVerticalStartPoint + dieSize) {
        currentState.dice = currentState.dice.reverse();
        drawBoard(currentState);
        return;
    }

    //clear
    if (x >= clearLeft && x <= clearLeft+buttonWidth && y >= clearSubmitBottom && y < clearSubmitBottom + buttonHeight) {
        //hack
        gnubgCommand('prev');
        gnubgCommand('next');
        moves = [];
        drawBoard(currentState);
        return;
    }

    //submit
    if (x >= submitLeft && x <= submitLeft+buttonWidth && y >= clearSubmitBottom && y < clearSubmitBottom + buttonHeight) {
        gnubgCommand(moves.join(' '));
        moves = [];
        return;
    }

    // Perform logic based on the click coordinates
    if (x >= barLeftBoundary && x <= barRightBoundary) {
        // The click is within the bar area
        if(currentState.board[25] > 0 && currentState.board[25-currentState.dice[moves.length]] >= -1){

            if(currentState.board[25-currentState.dice[moves.length]] == -1){
                currentState.board[25-currentState.dice[moves.length]] = 1;
            } else {
                currentState.board[25-currentState.dice[moves.length]]+=1;
            }
            currentState.board[25] = currentState.board[25]-1;

            moves.push(`25/${25-currentState.dice[moves.length]}`);

            drawBoard(currentState);
        }
    } else {
        if(currentState.board[25] > 0) return; // dont do anything if there is a checker on the bar

        // The click is within the main board area
        if(x>barRightBoundary){
            x = x-(barRightBoundary - barLeftBoundary);
        }
        var point = Math.floor(x / (checkerDiameter + gapBetweenCheckers)) + 1;
        if(point > 12) point = 0;
        if(y<boardHeight/2){
            point = 25-point;
        }

        console.log(currentState.board[point], point, currentState.dice[moves.length], currentState.dice);
        let lastChecker = 99
        for(let i = 0; i < currentState.board.length; i++){
            if(currentState.board[i] > 0) lastChecker = i;
        }

        //a checker of yours exists there
        if (currentState.board[point] > 0){

            //bearing off
            if(lastChecker < currentState.dice[0] && point == lastChecker){
                currentState.board[0]+=1;
                currentState.board[point] = currentState.board[point]-1;
                moves.push(`${point}/${0}`);

            // you can land at the spot safely
            } else if (currentState.board[point-currentState.dice[moves.length]] >= -1){

            if(point-currentState.dice[moves.length] == 0 && lastChecker > 6) return;

            //you landed on their piece
            if(currentState.board[point - currentState.dice[moves.length]] == -1){
                currentState.board[point - currentState.dice[moves.length]] = 1;
            } else {
                currentState.board[point - currentState.dice[moves.length]]+=1;
            }

            currentState.board[point] = currentState.board[point]-1;
            moves.push(`${point}/${point - currentState.dice[moves.length]}`);
        }
        }

        drawBoard(currentState);
    }
    if(currentState.dice.length == moves.length) {
        gnubgCommand(moves.join(' '));
        moves = [];
    }
    console.log(moves);
};


eventEmitter.addEventListener('boardUpdate', (data) =>{
    // console.log("event: " + JSON.stringify(data.detail));
    updateBoard(data.detail);
    window.setTimeout(doNextTurn, 100); //timeout?
})

function parseState(rawBoard){
    var rawBoardSplit = rawBoard.split(":");
    var resignationOffered = false;
    var resignationValue = 0;
    if (rawBoard.includes("offers to resign")) {
        resignationOffered = true;
        resignationOfferPending = true;
        if (rawBoard.endsWith("a single game.")) {
            resignationValue = 1;
        } else if (rawBoard.endsWith("a gammon.")) {
            resignationValue = 2;
        } else if (rawBoard.endsWith("a backgammon.")) {
            resignationValue = 3;
        } else {
            console.error("Unknown resignation value " + resignationValue);
        }
    }

    let tempDice = [parseInt(rawBoardSplit[33]), parseInt(rawBoardSplit[34])]
    if(tempDice[0] == 0){
        tempDice = [];
    } else if(tempDice[0] == tempDice[1]){
        tempDice.push(tempDice[0]);
        tempDice.push(tempDice[1]);
    }
    return {
        myName: rawBoardSplit[1],
        opponentName: rawBoardSplit[2],
        board: rawBoardSplit.slice(6, 6 + 26).map(function (x) { return parseInt(x); }),

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
//     lastState = currentState;
//     currentState = rawBoard;

//     let lastTurn = 0;
//     let lastBoard = "";
//     let resignationOfferPending = false;
//     let resignationValue = 0;
        
//         if (resignationOfferPending) {  // Ignore board update immediately after resignation offer, since nothing has changed and we don't want to remove the "Accept or reject the resignation" message
//             resignationOfferPending = false;
//             resignationValue = 0;
//             return;
//         }
//         var resignationOffered = false;
//         if (rawBoard.includes("offers to resign")) {
//             resignationOffered = true;
//             resignationOfferPending = true;
//             if (rawBoard.endsWith("a single game.")) {
//                 resignationValue = 1;
//             } else if (rawBoard.endsWith("a gammon.")) {
//                 resignationValue = 2;
//             } else if (rawBoard.endsWith("a backgammon.")) {
//                 resignationValue = 3;
//             } else {
//                 console.error("Unknown resignation value " + resignationValue);
//             }
//             rawBoard = lastBoard;
//         }
    
//         var rawBoardSplit = rawBoard.split(":");
//         var myName = rawBoardSplit[1];
//         var opponentName = rawBoardSplit[2];
//         var boardString = rawBoardSplit.slice(6, 6 + 26);
//         var board = boardString.map(function (x) { return parseInt(x); });

// //
// originalBoard = board;
// currentState.board = board;

//         var matchLength = parseInt(rawBoardSplit[3]);
//         var myScore = parseInt(rawBoardSplit[4]);
//         var opponentScore = parseInt(rawBoardSplit[5]);
//         var turn = parseInt(rawBoardSplit[32]);
//         var dice1 = parseInt(rawBoardSplit[33]);
//         var dice2 = parseInt(rawBoardSplit[34]);
// //

// currDice = [dice1, dice2]
//         var cubeValue = parseInt(rawBoardSplit[37]);
//         var iMayDouble = parseInt(rawBoardSplit[38]);
//         var opponentMayDouble = parseInt(rawBoardSplit[39]);
//         var wasDoubled = parseInt(rawBoardSplit[40]);
//         var myPiecesOff = parseInt(rawBoardSplit[45]);
//         var opponentPiecesOff = parseInt(rawBoardSplit[46]);
//         var crawford = parseInt(rawBoardSplit[51]);
    
//         if (dice1 > 0 && turn != lastTurn) {
//             var name = (turn == 1) ? myName : opponentName;
//             writeLog(name + " rolls " + dice1 + " " + dice2);
//             lastTurn = turn;
//         }
    
//         //nothing changed dont draw
//         if(lastState == currentState){
//             // console.log("nothing changed");
//             return;
//         }

lastState = currentState;
currentState = parseState(rawBoard);
drawBoard(currentState);
}

drawBoard();