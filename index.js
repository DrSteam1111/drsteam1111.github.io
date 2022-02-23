const downloadRoot = "https://download.smoothcomp.com/scoreboard/";
const buttonBackgroundColor = "#3d8fb8"

let latestVersionMac;
let latestVersionWindows;

async function parseYml() {
  latestVersionMac = await requestVersion("-mac"); //Parse yaml for MAC
  latestVersionWindows = await requestVersion(""); //Parse yaml for Windows (on server -> windows is empty string)
}

async function getHrefsAndOrder() {
  orderer();
  await parseYml();
  if (latestVersionMac == null || latestVersionWindows == null) { return; }
  document.getElementById("mac").href = getLatestVersions("mac");
  document.getElementById("win").href = getLatestVersions("win");
}

function getLatestVersions(os) {
  switch (os) {
    case "mac": {
      return downloadRoot + `mac-x64/Smoothcomp-${latestVersionMac}.dmg`;
    }
    case "win": {
      return downloadRoot + `win-x64/Smoothcomp Setup ${latestVersionWindows}.exe`;
    }
  }
}

function orderer() {
  const os = getOS();
  const parentElement = document.querySelector("#buttonsId");
  
  switch (os) {
    case "Windows": {
      parentElement.appendChild(parentElement.firstElementChild);
      parentElement.appendChild(parentElement.firstElementChild.nextElementSibling);
      break;
    }
    case "iOS": {
      parentElement.firstElementChild.remove();
      parentElement.firstElementChild.remove();
      break;
    }
    case "Mac OS": {
      break;
    }
    default: {
      return;
    }
  }
  parentElement.firstElementChild.style.backgroundColor = buttonBackgroundColor;
}
 
async function requestVersion(os) {
  const date = new Date();
  const timeKey = date.getFullYear().toString() + date.getMonth().toString() + date.getDay().toString() + date.getTime().toString();
  console.log(timeKey);

  const response = await fetch (`https://raw.githubusercontent.com/DrSteam1111/testymlread/main/latest${os}.yml?time=${timeKey}`) // <-- fetch latest yml with dateKey
    .then(res => {
      if(!res.ok) {
        resNotOK();
        throw new Error("Could not get latest version")
      } else {
        res => res.blob()
        return res.text()
      }
    })
    .catch(err => {
      console.log('Fetch err:', err)
      return "null";
    });
  console.log(response);

  if(response === "null") {
    return null;
  }

  const ymlJson = await jsyaml.load(response);
  console.log(ymlJson);

  const version = Object.values(ymlJson)[0];
  console.log(version);

  return version;
}

function getOS() {
  let userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = null;

  if(platform === null && platform === undefined) {
    platform = userAgent.platform;
  }

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
}

function resNotOK() {
  const parentElement = document.querySelector("#buttonsId");
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.firstChild);
  }
  
  let h2Block = document.createElement('h2');
  h2Block.id = "resNotOK";
  h2Block.textContent = 'Could not get latest version. Try again later!';
  parentElement.appendChild(h2Block);
}