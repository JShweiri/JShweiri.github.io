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
    drawBoard(true);
});

var backgammonBoard = document.getElementById("backgammonBoard");
var ctx = backgammonBoard.getContext("2d");

let clickedPositions = []

backgammonBoard.onclick = function(ev) {
    if(!gameStarted){
        newGame();
        return
    }
    if(dice.length==0){
        roll();
        return
    }
    var x = ev.offsetX;
    var y = ev.offsetY;

    // Perform logic based on the click coordinates
    if (x >= barLeftBoundary && x <= barRightBoundary) {
        // The click is within the bar area
        clickedPositions.push('b');
    } else {
        // The click is within the main board area
        if(x>barRightBoundary){
            x = x-(barRightBoundary - barLeftBoundary);
        }
        var point = Math.floor(x / (checkerDiameter + gapBetweenCheckers)) + 1;
        if(point > 12) point = 0;
        // if(point < 1) point = 1;
        if(y<boardHeight/2){
            point = 12 + (13-point);
        }
        clickedPositions.push(point);
    }
    move8(clickedPositions[0], clickedPositions[1], clickedPositions[2], clickedPositions[3], clickedPositions[4], clickedPositions[5], clickedPositions[6], clickedPositions[7]);
    if(clickedPositions.length == 8){
        //need to also clear on success? (see clickedPositions in graphics.js for now)
        clickedPositions = [];
    }
    console.log(clickedPositions);

    //TODO:
    // add a clear move button
    // accept or decline double
    // preview moves
    // offer/propose double
};