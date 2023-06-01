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
    window.setTimeout(doNextTurn, 0); // modify opponents delay? maybe should do this in gnubg settings..
}

eventEmitter = new EventTarget();

lastLogLine = "";  // needed for stdin prompts from gnubg's GetInput function in gnubg.c
function writeLog(str) {
    // console.log(str); // FOR DEBUGGING
    if (str.startsWith("falling back to ArrayBuffer instantiation") || str.startsWith("wasm streaming compile failed") || str.startsWith("file packager has copied file data into memory")) { // suppress various startup messages not from gnubg, put it into console instead
        console.log(str);
    } else {
        if (str.startsWith("board:") || str.includes("offers to resign")) {
            const boardEvent = new CustomEvent('boardUpdate', { 
                detail: str,
            });
            eventEmitter.dispatchEvent(boardEvent);
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

 inputBuffer = "";
 inputBufferPointer = 0;
var Module = {
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
 includeJs('./gnubg.js')