
// SETTINGS

function saveSetting(setting, value) {
  window.localStorage.setItem(setting, JSON.stringify(value));
}

function loadAllSettings() {
  // Load all saved settings or defaults
  initBaudRate();
  $('baudRate').value = loadSetting('baudRate', 115200);
  $('angleType').value = loadSetting('angleType', 'euler');
  $('useGPS').checked = loadSetting('useGPS', true);
  $('darkmode').checked = loadSetting('darkmode', true);
  $('useLog').checked = loadSetting('useLog', false);
  $('log-container').hidden = !$('useLog').checked;
  $('autoscroll').checked = loadSetting('autoscroll', true);
  $('showTimestamp').checked = loadSetting('showTimestamp', true);
  $('autoCenter').checked = loadSetting('autoCenter', true);
  updateTheme();
}

function loadSetting(setting, defaultValue) {
  let cookieSetting = window.localStorage.getItem(setting);
  if (cookieSetting == null || cookieSetting == "undefined") {
    console.log("[settings] Loaded " + setting + " with default value (" + defaultValue + ")")
    return defaultValue;
  }
  console.log("[settings] Loaded " + setting + " with value : " + cookieSetting)
  return JSON.parse(cookieSetting);
}

async function changeSetting(id, type="check") {
  if (type == "value") {
    saveSetting(id, $(id).value);
    console.log("[settings] Saved " + id + " as " + $(id).value)
  } else {
    saveSetting(id, $(id).checked);
    console.log("[settings] Saved " + id + " as " + $(id).checked)
  }
}


// BAUDRATE

const baudRates = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 74880, 115200, 230400, 250000, 500000, 1000000, 2000000];

function initBaudRate() {
  for (let rate of baudRates) {
    var option = document.createElement("option");
    option.text = rate + " Baud";
    option.value = rate;
    baudRate.add(option);
  }
}


// THEME

function updateTheme() {
  // Disable all themes
  document
    .querySelectorAll('link[rel=stylesheet].theme')
    .forEach((styleSheet) => {
      enableStyleSheet(styleSheet, false);
    });

  // Enable selected theme
  if ($('darkmode').checked) {
    enableStyleSheet(darkSS, true);
  } else {
    enableStyleSheet(lightSS, true);
  }
}

function enableStyleSheet(node, enabled) {
  node.disabled = !enabled;
}