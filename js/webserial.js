let port;
let reader;
let inputDone;
let outputDone;
let inputStream;
let outputStream;
const maxLogLength = 100;

const butConnect = $('butConnect');
const baudRate = $('baudRate');

const serCommand = $('serCommand');
const logContainer = $('log-container');
const log = $('log');

var buffer = [];
const bufferLen = 20;
var logged = [];

// WEBSERIAL

/**
* @name LineBreakTransformer
 * TransformStream to parse the stream into lines.
 */
class LineBreakTransformer {
  constructor() {
    // A container for holding stream data until a new line.
    this.container = '';
  }

  transform(chunk, controller) {
    this.container += chunk;
    const lines = this.container.split('\n');
    this.container = lines.pop();
    lines.forEach(line => {
      controller.enqueue(line)
      if ($('useLog').checked) {
        logData(line);
      }
      logged.push(line)
      GPSUpdate(line);
    });
  }

  flush(controller) {
    controller.enqueue(this.container);
  }
}

function toggleUIConnect(connected) {
  let lbl = 'Connect';
  if (connected) {
      lbl = 'Disconnect';
  }
  serCommand.disabled = !connected
  butSend.disabled = !connected
  butConnect.textContent = lbl
}

/**
 * @name connect
 * Opens a Web Serial connection to a micro:bit and sets up the input and
 * output stream.
 */
async function connect() {
  try {
    // - Request a port and open a connection.
    port = await navigator.serial.requestPort();
    // - Wait for the port to open.
    await port.open({ baudRate: parseInt(baudRate.value, 10) });
    port.addEventListener("disconnect", (event) => {
      console.log(event);
      disconnect();
    });

    onConnect_map();

    const decoder = new TextDecoderStream();
    inputDone = port.readable.pipeTo(decoder.writable);
    inputStream = decoder.readable.pipeThrough(new TransformStream(new LineBreakTransformer()));

    reader = inputStream.getReader();
    readLoop(reader).catch(async function(error) {
      console.error(error)
      toggleUIConnect(false);
      await disconnect();
    });
  } catch (error) {
    console.error('There was an error opening the serial port:', error);
    toggleUIConnect(false);
  }
}

/**
 * @name disconnect
 * Closes the Web Serial connection.
 */
async function disconnect() {
  if (reader) {
    await reader.cancel();
    await inputDone.catch(() => {});
    reader = null;
    inputDone = null;
  }

  if (outputStream) {
    await outputStream.getWriter().close();
    await outputDone;
    outputStream = null;
    outputDone = null;
  }

  await port.close();
  port = null;
}

/**
 * @name readLoop
 * Reads data from the input stream and displays it on screen.
 */
async function readLoop() {
  while (true) {
    const {value, done} = await reader.read();
    if (value) {
      let res = value.split(";");
      // $("battery").innerHTML = data[0] + "%";
      // $("time").innerHTML = data[1] + "s";
      // $("stre").innerHTML = data[2];
      // $("rssi").innerHTML = data[3];

      // "IMU";temp;ax;ay;az;gx;gy;gz
      if (res[0] == 'IMU') {
        res.shift();
        euler=[res[4],res[5],res[6]]
        console.log('[IMU] Orientation updated');
      }
    }
    if (done) {
      console.log('[readLoop] DONE', done);
      reader.releaseLock();
      break;
    }
  }
}

function logData(line) {
  let check = false;
  if (line.split(";")[0] == 'IMU') {check = true;}
  // Add timestamp
  if ($('showTimestamp').checked) {
    let d = new Date();
    let timestamp = d.getHours() + ":" + `${d.getMinutes()}`.padStart(2, 0) + ":" +
      `${d.getSeconds()}`.padStart(2, 0) + "." + `${d.getMilliseconds()}`.padStart(3, 0);
    line = '<span class="timestamp">' + timestamp + ' -> </span>' + line;
    d = null;
  }
  // Log data
  if (check){
    if (buffer.length >= bufferLen) {
      let block = "";
      for (let i = 0; i < buffer.length; i++) {
        const element = buffer[i];
        block += element + "<br>";
      }
      buffer = [];
      log.innerHTML += block;
      updateLogContainer()
    } else {
      buffer.push(line);
    }
  } else {
    log.innerHTML += line + "<br>";
    updateLogContainer()
  }
}

function updateLogContainer(){
  // Remove old log content
  let logLength = log.innerHTML.split("<br>").length;
  if (logLength > maxLogLength + 1) {
    let logLines = log.innerHTML.replace(/(\n)/gm, "").split("<br>");
    log.innerHTML = logLines.splice(-maxLogLength).join("<br>\n");
  }

  // Scroll to bottom
  if ($('autoscroll').checked) {
      logContainer.scrollTop = logContainer.scrollHeight
  }
}

/**
 * @name resetLog
 * Reset the Plotter, Log, and associated data
 */
function resetLog() {
  // Clear the data
  log.innerHTML = "";
}

/**
 * @name clickConnect
 * Click handler for the connect/disconnect button.
 */
async function clickConnect() {
  console.log(port)
  if (port) {
    await disconnect(); //problemeatic if unplugged
    toggleUIConnect(false);
    return;
  }

  await connect();
  resetLog();
  logged = [];
  toggleUIConnect(true);
}

/**
 * @name clickSend
 * Click handler for the send button.
 */
function clickSend() {
  let command = serCommand.value;
  serCommand.value = '';
  writeToStream(command);
}
