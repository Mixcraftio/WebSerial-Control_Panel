// let the editor know that `Chart` is defined by some code
// included in another file (in this case, `index.html`)
// Note: the code will still work without this line, but without it you
// will see an error in the editor
// global THREE
// global TransformStream
// global TextEncoderStream
// global TextDecoderStream
// 'use strict';

let port;
let reader;
let inputDone;
let outputDone;
let inputStream;
let outputStream;

let showCalibration = false;
let calibration = [0, 0, 0, 0];
// const maxLogLength = 100;

const butConnect = document.getElementById('butConnect');
const baudRate = document.getElementById('baudRate');

const serCommand = document.getElementById('serCommand');
const logContainer = document.getElementById("log-container");
const log = document.getElementById('log');

const calContainer = document.getElementById('calibration');

document.addEventListener('DOMContentLoaded', async () => {
  if ('serial' in navigator) {
    const webSerialnotSupported = document.getElementById('webSerialnotSupported');
    webSerialnotSupported.classList.add('hidden');
  }
  loadAllSettings();
});


// WEBSERIAL

/**
 * @name connect
 * Opens a Web Serial connection to a micro:bit and sets up the input and
 * output stream.
 */
async function connect() {
  // - Request a port and open a connection.
  port = await navigator.serial.requestPort();
  // - Wait for the port to open.toggleUIConnected
  await port.open({ baudRate: baudRate.value });

  onConnect_map();

  let decoder = new TextDecoderStream();
  inputDone = port.readable.pipeTo(decoder.writable);
  inputStream = decoder.readable
    .pipeThrough(new TransformStream(new LineBreakTransformer()));

  reader = inputStream.getReader();
  readLoop().catch(async function(error) {
    toggleUIConnect(false);
    await disconnect();
  });
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
  showCalibration = false;
}

/**
 * @name readLoop
 * Reads data from the input stream and displays it on screen.
 */
async function readLoop() {
  while (true) {
    const {value, done} = await reader.read();
    if (value) {
      let plotdata;
      if (value.substr(0, 12) == "Orientation:") {
        orientation = value.substr(12).trim().split(",").map(x=>+x);
      }
      if (value.substr(0, 11) == "Quaternion:") {
        quaternion = value.substr(11).trim().split(",").map(x=>+x);
      }
      if (value.substr(0, 12) == "Calibration:") {
        calibration = value.substr(12).trim().split(",").map(x=>+x);
        if (!showCalibration) {
          showCalibration = true;
        }
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
  // Update the Log
  if ($('showTimestamp').checked) {
    let d = new Date();
    let timestamp = d.getHours() + ":" + `${d.getMinutes()}`.padStart(2, 0) + ":" +
        `${d.getSeconds()}`.padStart(2, 0) + "." + `${d.getMilliseconds()}`.padStart(3, 0);
    log.innerHTML += '<span class="timestamp">' + timestamp + ' -> </span>';
    d = null;
  }
  log.innerHTML += line+ "<br>";

  // Remove old log content
  // if (log.textContent.split("\n").length > maxLogLength + 1) {
  //   let logLines = log.innerHTML.replace(/(\n)/gm, "").split("<br>");
  //   log.innerHTML = logLines.splice(-maxLogLength).join("<br>\n");
  // }

  if ($('autoscroll').checked) {
    logContainer.scrollTop = logContainer.scrollHeight
  }
}

/**
 * @name resetLog
 * Reset the Plotter, Log, and associated data
 */
async function resetLog() {
  // Clear the data
  log.innerHTML = "";
}

/**
 * @name clickConnect
 * Click handler for the connect/disconnect button.
 */
async function clickConnect() {
  if (port) {
    await disconnect();
    toggleUIConnect(false);
    return;
  }

  await connect();

  resetLog();

  toggleUIConnect(true);
}

/**
 * @name clickSend
 * Click handler for the send button.
 */
async function clickSend() {
  let command = serCommand.value;
  serCommand.value = '';
  writeToStream(command);
}

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
      logData(line);
      updateFeather(line);
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

// CALIB

function updateCalibration() {
  // Update the Calibration Container with the values from calibration
  const calMap = [
    {caption: "Uncalibrated",         color: "#CC0000"},
    {caption: "Partially Calibrated", color: "#FF6600"},
    {caption: "Mostly Calibrated",    color: "#FFCC00"},
    {caption: "Fully Calibrated",     color: "#009900"},
  ];
  const calLabels = [
    "System", "Gyro", "Accelerometer", "Magnetometer"
  ]

  calContainer.innerHTML = "";
  for (var i = 0; i < calibration.length; i++) {
    let calInfo = calMap[calibration[i]];
    let element = document.createElement("div");
    element.innerHTML = calLabels[i] + ": " + calInfo.caption;
    element.style = "color: " + calInfo.color;
    calContainer.appendChild(element);
  }
}
