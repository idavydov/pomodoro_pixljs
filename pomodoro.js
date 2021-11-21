class PigAnimation {
  constructor() {
    this.pigs = [
      {width : 51, height : 31, bpp: 1, buffer : E.toArrayBuffer(atob("AAP/4AAAAAHgD4AAAADgAB4AAAAwAABwAAAMAAADgADzAAAAHAA+wAAAAMACMAAAAAwAZAAAAADYAYAAAAAPACAAAAABsAwAAAEARgEAAABgGMAgAAAIAxgEAAADAGIBgAAAQAxAMBAACAGMBgYAAQAAwEDgADAADAg3wAYMAOEGP//hgAYwggDEMADGMEAYxgAQRggDCMAGCJkAIZv/gREwBJM/wDI2AJMgAAZCQBIkAABYeAPGgAAPBgAwcAAAwAAAAAAA"))},
      {width : 51, height : 31, bpp: 1, buffer : E.toArrayBuffer(atob("AAP/4AAAAAHgD4AAAADgAB4AAAAwAABwAAMMAAADgADzAAAAHAAywAAAAMADMAAAAAwABAAAAADYAYAAAAAPACAAAAABsAwAAAAARgEAAAAAGMAgAAAAAxgEAAAAAGIBgAAAAAxAMAAAAAGMBgAAAAAAwGAAAAAADAYDwAAAAOBgb/8fAAYUDADCAADCwYAYwAAQTjABGEAGBEYAIsv/gJzABEm/wBKYAMmwAAJZABkSAAB5IAFjwAAGNAA8MAAAA4ADAAAA"))}
    ];
    this.heartSprite = {width : 45, height : 44, bpp: 1, buffer : E.toArrayBuffer(atob("AH/AD/gAD/+B//AB//4//8Af4/v8fwH4B/8AfB8AD/AB8PAAPwAHz4AA8AAeeAAHAADzwAAAAAPcAAAAAB/gAAAAAP8AAAAAB/gAAAAAPcAAAAAB7wAAAAAPeAAAAADz4AAAAAePAAAAAHx8AAAAB8HwAAAAPAfAAAAD4B8AAAA+AHgAAAPgA+AAAD4AD4AAAeAAPgAAHwAA+AAB8AADwAAfAAAfAAHwAAB8AB8AAAHwAPgAAAfAD4AAAB8A+AAAAPgPgAAAA+D4AAAAD4eAAAAAPnwAAAAA/8AAAAAD/AAAAAAfwAAAAAB8AAAAAAHgAAAAAAQAAAA="))};

  }

  start() {
    this.mode = "run";
    this.x = 0;
    g.clear();
    g.flip();
    this.iid = setInterval(() => this.nextFrame(), 200);
    LED.set();
    this.ledoffid = setTimeout(() => {LED.reset();}, 10000);
  }

  stop() {
    this.off();
    startNextMode();
  }

  off() {
    if (this.iid != null) {
      clearInterval(this.iid);
      this.iid = null;
    }
    if (this.ledoffid != null) {
      clearTimeout(this.ledoffid);
      this.ledoffid = null;
    }
    LED.reset();
    g.clear();
    g.flip();
  }

  nextFrame() {
    if (this.mode == "run") {
      this.run();
    } else if (this.mode == "heart") {
      this.heart();
    }
  }

  run() {
    this.x++;
    g.clearRect(this.x-5, 35, this.x + this.pigs[0].width + 5, 35 + this.pigs[0].height);
    g.drawImage(this.pigs[this.x%this.pigs.length], this.x, 35);
    g.flip();
    if (this.x % 5 == 0) {
    }
    if (this.x + this.pigs[0].width / 2 >= g.getWidth() / 2) {
      this.mode = "heart";
      this.heartScale = 0.125;
    }
  }

  heart() {
    g.clear();
    g.drawImage(
      this.heartSprite,
      g.getWidth() / 2 - this.heartSprite.width * this.heartScale / 2,
      g.getHeight() / 2 - this.heartSprite.height * this.heartScale / 2,
      {scale: this.heartScale}
    );
    g.flip();
    this.heartScale = this.heartScale + 0.5;
    if (this.heartScale > 10) {
      this.stop();
    }
  }
}


let modes={
  w1: {title: "work", dur: 25*60},
  sb1: {title: "short break 1", dur: 5*60},
  w2: {title: "work", dur: 25*60},
  sb2: {title: "short break 2", dur: 5*60},
  w3: {title: "work", dur: 25*60},
  pig: {title: "long break"},
  lb: {title: "long break", dur: 15*60},
};
let left;
let mode;
let nextMode;
let iid;
let nmid;
let pa = new PigAnimation();

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
  if (mode == "pig") {
    pa.off();
  }
  mode = nextMode;
  nextMode = getNextMode();
  LED.reset();
  if (iid != null) {
    clearInterval(iid);
  }
  if (mode == "pig") {
    pa.start();
  } else {
    left = modes[mode].dur;
    onSecond();
    iid = setInterval(onSecond, 1000);
  }
}


function init() {
  Pixl.setLCDPower(true);
  g.clear();
  g.flip();
  nextMode = null;
  startNextMode();
  nmid = setWatch(startNextMode, BTN1, {edge:"rising", debounce:50, repeat:true});
}

function turnOff() {
  pa.off();
  LED.reset();
  Pixl.setLCDPower(false);
  if (iid != null) {
    clearInterval(iid);
    iid = null;
  }
  if (nmid != null) {
    clearWatch(nmid);
    nmid = null;
  }
}

function toggle() {
  if (iid == null && pa.iid == null) {
    init();
  } else {
    turnOff();
  }
}

setWatch(toggle, BTN2, {edge:"rising", debounce:50, repeat:true});

init();
