let modes={
  w1: {title: "work", dur: 25*60},
  sb1: {title: "short break 1", dur: 5*60},
  w2: {title: "work", dur: 25*60},
  sb2: {title: "short break 2", dur: 5*60},
  w3: {title: "work", dur: 25*60},
  lb: {title: "long break", dur: 15*60},
};
let left;
let mode;
let nextMode;
let iid;
let nmid;

function drawTime(sec, curM, nextM) {
  let time;
  let m = "";
  if (sec < 0) {
    sec = - sec;
    m = "-";
  }
  let min = Math.floor(sec/60);
  sec = sec % 60;
  time = m+min+":"+("0"+sec).substr(-2);
  g.clear();
  g.setFontVector(40);
  g.drawString(time,128 - g.stringWidth(time),18);
  g.setFontVector(15);
  g.drawString(curM,0,0);
  g.setFontBitmap();
  g.drawString("next: "+nextM,0,55);
  g.flip();
}

function onSecond() {
  if (left < - 30 * 60) {
    turnOff();
    return;
  }
  drawTime(left,
           modes[mode].title, modes[nextMode].title);
  if ((left <= 0) && (left > -20)) {
    LED.set();
    setTimeout(() => {LED.reset();}, 200);
  }
  left-=1;
}

function getNextMode() {
  let keys = Object.keys(modes);
  let nextIndex = (keys.indexOf(mode) +1) % keys.length;
  return keys[nextIndex];
}

function startNextMode() {
  if (nextMode == null) {
    nextMode = Object.keys(modes)[0];
  }
  mode = nextMode;
  nextMode = getNextMode();
  left = modes[mode].dur;
  LED.reset();
}


function init() {
  Pixl.setLCDPower(true);
  g.clear();
  g.flip();
  nextMode = null;
  startNextMode();
  iid = setInterval(onSecond, 1000);
  nmid = setWatch(startNextMode, BTN1, {edge:"rising", debounce:50, repeat:true});
}

function turnOff() {
  LED.reset();
  Pixl.setLCDPower(false);
  clearInterval(iid);
  clearWatch(nmid);
  iid = null;
}

function toggle() {
  if (iid == null) {
    init();
  } else {
    turnOff();
  }
}

setWatch(toggle, BTN2, {edge:"rising", debounce:50, repeat:true});

init();
