
const debug = false;
if (debug){console.log("Debug Mode")}

let euler = [0, 0, 0];
const eulerOffset = [-90, 0, 0];
let quaternion = [0, 0, 0, 0];
const quaternionOffset = [0, 0, 0, 0];

// STYLE

// When the user scrolls down, hide the navbar. When the user scrolls up, show the navbar
var prevScrollpos = window.scrollY;
var currentScrollPos = window.scrollY;
const headerHeight = $('header').offsetHeight;
window.onscroll = function() {
  currentScrollPos = window.scrollY;
  if ((prevScrollpos > currentScrollPos) || (currentScrollPos==0)) {
    $('header').style.top = "0";
  } else {
    $('header').style.top = "-"+headerHeight+"px";
  }
  prevScrollpos = currentScrollPos;
}


// PAGELOAD

document.addEventListener('DOMContentLoaded', () => {
  if ('serial' in navigator) {
    const webSerialnotSupported = document.getElementById('webSerialnotSupported');
    webSerialnotSupported.classList.add('hidden');
  }
  loadAllSettings();
});

function exportData(){
  content = logged;
  content = content.join("\r\n");
  download(content);
}

async function download(data) {
  const newHandle = await window.showSaveFilePicker();
  const writableStream = await newHandle.createWritable();
  await writableStream.write({ type: "write", data: data });
  await writableStream.close();
}
