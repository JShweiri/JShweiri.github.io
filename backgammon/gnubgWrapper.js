function includeJs(jsFilePath) {
    var js = document.createElement("script");
    js.type = "text/javascript";
    js.src = jsFilePath;
    document.body.appendChild(js);
}

function arrayToHeap(typedArray) {
    var numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT;
    var ptr = Module._malloc(numBytes);
    var heapBytes = Module.HEAPU8.subarray(ptr, ptr + numBytes);
    heapBytes.set(typedArray);
    return heapBytes;
}

function makeCommandBuffer() {
    var rawBuffer = new ArrayBuffer(1000);
    var heapView = new Uint8Array(rawBuffer);
    return arrayToHeap(heapView).byteOffset;
}

function fillCommandBuffer(buffer, str) {
    for (var i = 0; i < str.length; i++) {
        Module.setValue(buffer + i, str.charCodeAt(i), "i8");
    }
    Module.setValue(buffer + str.length, 0, "i8");
}

function gnubgCommand(command) {
    commandBufferInititalized = false;
    commandBuffer = 0;
    if (!commandBufferInititalized) {
        commandBuffer = makeCommandBuffer();
        commandBufferInititalized = true;
    }
    if (command.startsWith("b/") || command.startsWith("bar/") || ["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(command.substring(0, 1))) {  // assume it's a move
        command = "move " + command;
    }
    fillCommandBuffer(commandBuffer, command);
    writeLog("=> " + command);
    Module._run_command(commandBuffer);
    window.setTimeout(doNextTurn, 0);
}

lastLogLine = "";  // needed for stdin prompts from gnubg's GetInput function in gnubg.c
function writeLog(str) {
    // console.log(str); // FOR DEBUGGING
    if (str.startsWith("falling back to ArrayBuffer instantiation") || str.startsWith("wasm streaming compile failed") || str.startsWith("file packager has copied file data into memory")) { // suppress various startup messages not from gnubg, put it into console instead
        console.log(str);
    } else {
        if (str.startsWith("board:") || str.includes("offers to resign")) {
            updateBoard(str);
            window.setTimeout(doNextTurn, 1000);
        }

        if (!str.startsWith("board:")) {
            lastLogLine = str;
            var gnubg_log = document.getElementById("gnubg_log");
            gnubg_log.textContent += str;
            gnubg_log.textContent += '\n';
            gnubg_log.scrollTop = gnubg_log.scrollHeight;
        }
    }
}

function doNextTurn() {
    Module._doNextTurn();
}

function updateBoard(rawBoard) {
lastTurn = 0;
lastBoard = "";
resignationOfferPending = false;
resignationValue = 0;
    
    if (resignationOfferPending) {  // Ignore board update immediately after resignation offer, since nothing has changed and we don't want to remove the "Accept or reject the resignation" message
        resignationOfferPending = false;
        resignationValue = 0;
        return;
    }
    var resignationOffered = false;
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
        rawBoard = lastBoard;
    }

    var rawBoardSplit = rawBoard.split(":");
    var myName = rawBoardSplit[1];
    var opponentName = rawBoardSplit[2];
    var boardString = rawBoardSplit.slice(6, 6 + 26);
    var board = boardString.map(function (x) { return parseInt(x); });
    var matchLength = parseInt(rawBoardSplit[3]);
    var myScore = parseInt(rawBoardSplit[4]);
    var opponentScore = parseInt(rawBoardSplit[5]);
    var turn = parseInt(rawBoardSplit[32]);
    var dice1 = parseInt(rawBoardSplit[33]);
    var dice2 = parseInt(rawBoardSplit[34]);
    var cubeValue = parseInt(rawBoardSplit[37]);
    var iMayDouble = parseInt(rawBoardSplit[38]);
    var opponentMayDouble = parseInt(rawBoardSplit[39]);
    var wasDoubled = parseInt(rawBoardSplit[40]);
    var myPiecesOff = parseInt(rawBoardSplit[45]);
    var opponentPiecesOff = parseInt(rawBoardSplit[46]);
    var crawford = parseInt(rawBoardSplit[51]);

    if (dice1 > 0 && turn != lastTurn) {
        var name = (turn == 1) ? myName : opponentName;
        writeLog(name + " rolls " + dice1 + " " + dice2);
        lastTurn = turn;
    }

    drawBoard(false,
        board,
        matchLength,
        myScore,
        opponentScore,
        turn,
        dice1,
        dice2,
        cubeValue,
        iMayDouble,
        opponentMayDouble,
        wasDoubled,
        myPiecesOff,
        opponentPiecesOff,
        crawford,
        resignationOffered,
        resignationValue);

    lastBoard = rawBoard;
}

function newSession() {
    gnubgCommand("new session");
}

function newMatch(matchLength) {
    gnubgCommand("new match " + matchLength);
}

function newGame() {
    gnubgCommand("new game");
}

function roll() {
    gnubgCommand("roll");
}

function move8(a1, a2, b1, b2, c1, c2, d1, d2){
    let moveStr ='';
    moveStr += (a2 !==undefined ? `${a1}/${a2}` : '');
    moveStr += (b2 !==undefined ? ` ${b1}/${b2}` : '');
    moveStr += (c2 !==undefined ? ` ${c1}/${c2}` : '');
    moveStr += (d2 !==undefined ? ` ${d1}/${d2}` : '');
    gnubgCommand(moveStr);
}

function double() {
    gnubgCommand("double");
}

function accept() {
    gnubgCommand("accept");
}

function reject() {
    gnubgCommand("reject");
}

function beaver() {
    gnubgCommand("beaver");
}

function resign(val) {
    gnubgCommand("resign " + val);
}

function download(filename) {
    const fakeDownload = document.createElement('a');
    fakeDownload.style.display = 'none';
    const data = new Blob([FS.readFile(filename, { encoding: 'utf8' })]);
    const url = window.URL.createObjectURL(data);
    fakeDownload.href = url;
    fakeDownload.download = filename;
    document.body.appendChild(fakeDownload);
    fakeDownload.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(fakeDownload);
}

function upload() {
    const fakeUpload = document.createElement('input');
fakeUpload.type = 'file';
fakeUpload.multiple = true;
fakeUpload.style.display = 'none';
fakeUpload.addEventListener("change", function () {
    for (var i = 0; i < this.files.length; i++) {
        const file = this.files.item(i);
        console.log('Uploading ' + file.name);
        const fileReader = new FileReader();
        fileReader.onload = function (e) {
            const arrayBuffer = e.target.result;
            const data = new Uint8Array(arrayBuffer);
            FS.writeFile(file.name, data);
            writeLog('Successfully uploaded ' + file.name);
        }
        fileReader.onerror = function () {
            writeLog('Could not upload ' + file.name);
        }
        fileReader.readAsArrayBuffer(file);
    }
    document.body.removeChild(this);
}, false);
    document.body.appendChild(fakeUpload);
    fakeUpload.click();
}

includeJs('./gnubg.js')

var Module = {
    inputBuffer: "",
    inputBufferPointer: 0,
    preRun: [
        function () {
            FS.init(
                function stdin() {
                    if (inputBuffer == "") {
                        inputBuffer = window.prompt(lastLogLine);
                        inputBuffer += '\n';
                        inputBufferPointer = 1;
                        return inputBuffer.charCodeAt(0);
                    } else {
                        if (inputBufferPointer < inputBuffer.length) {
                            var code = inputBuffer.charCodeAt(inputBufferPointer);
                            ++inputBufferPointer;
                            return code;
                        } else {
                            inputBuffer = "";
                            return null;
                        }
                    }
                });
        }],
    print: writeLog,
    printErr: writeLog,
    onRuntimeInitialized: function () {
        Module._start();
    }
}