
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
