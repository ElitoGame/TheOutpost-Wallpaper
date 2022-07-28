const sx = window.innerWidth / 2560;
const sy = window.innerHeight / 1440;

let barCount = 72;
let barWidthSetting = 1 * sx;
let compensate = 10;
let offset = 20 * sx;
let padding = 2 * sx;
let barColor = "#ffffff";
let barOpacity = 0.5;
let hasShadow = true;
let shadowColor = "#ffffff";
let shadowOpacity = 0.5;




console.log(sx, sy)

const canvas = document.querySelector('#c'),
ctx = canvas.getContext('2d'),
dCanvas = document.querySelector('#dc'),
dCtx = dCanvas.getContext('2d'),
aCanvas = document.querySelector('#ac'),
aCtx = aCanvas.getContext('2d'),
daCanvas = document.querySelector('#dac'),
daCtx = daCanvas.getContext('2d'),
s1Canvas = document.querySelector('#s1c'),
s1Ctx = s1Canvas.getContext('2d'),
s2Canvas = document.querySelector('#s2c'),
s2Ctx = s2Canvas.getContext('2d'),
handles = document.querySelectorAll('.drag-handle');

canvas.style.left = -127 * sx + "px";
canvas.width = canvas.width * sx;
canvas.height = canvas.height * sy;
aCanvas.width = aCanvas.width * sx;
aCanvas.height = aCanvas.height * sy;

s1Canvas.width = s1Canvas.width * sx;
s1Canvas.height = s1Canvas.height * sy;
s1Canvas.style.right = 900 * sx + "px";
s2Canvas.width = s2Canvas.width * sx;
s2Canvas.height = s2Canvas.height * sy;
s2Canvas.style.right = 680 * sx + "px";

const debug = document.querySelector('#debug');

// Big triangle coordinates:
const btx = 310.5 * sx, bty = 206.5 * sy;
const btx1 = btx + 106 * sx, bty1 = bty;
const btx2 = btx + 53 * sx, bty2 = bty - 91.798 * sy;

let cbtx = btx, cbty = bty;
let cbtx1 = btx1, cbty1 = bty1;
let cbtx2 = btx2, cbty2 = bty2;

const mbtx = 331 * sx, mbty = 206 * sy;
const mbtx1 = 434 * sx, mbty1 = 202 * sy;
const mbtx2 = 380 * sx, mbty2 = 120 * sy;

// Center of big tirangle = 363.5, 177.17 = (A + B + C) / 3
const btcx = (btx + btx1 + btx2) / 3;
const btcy = (bty + bty1 + bty2) / 3;

const btrad = Math.sqrt(Math.pow(btx - btcx, 2) + Math.pow(bty - btcy, 2)) / 90;


let cpuUsage = 0;
let gpuUsage = 0;
let ramUsage = 0;

let isCpuShown = false;
let isGpuShown = false;
let isRamShown = false;

let audio = [];
function livelyAudioListener(audioArray) {
    for (let i = 0; i < audioArray.length; i++) {
        // Clamp the Audio value between 0 and 1
        audio[i] = Math.min(Math.max(audioArray[i], 0), 1);
    }
    audio = audio.filter((elem, idx, arr) => arr[idx - 1] !== elem)
    audio = audio.map((elem, idx, arr) => {
      return elem * (idx / arr.length + (100 - compensate + 50) / 100)
    })
    // Mirror on vertical axis
    audio = audio.slice().reverse().concat(audio)
    
    // offset the array by moving elements from the end to the start using "offset" steps
    audio = audio.slice(audio.length - offset).concat(audio.slice(0, audio.length - offset))
    
    // Stretch the array to the desired length "barCount"
    audio = audio.slice(0, barCount)

    // document.getElementById("sys-info").innerHTML = audioArray.length + " => " + audio.length;

    drawAudio();
}

function livelyNowPlaying(data)
{
    const obj = JSON.parse(data);
    console.log(obj.Title + " " + obj.Artist);
    document.getElementById("current-track").textContent = obj.Title + " " + obj.Artist;
    console.log(obj.Title + " " + obj.Artist);
}

function livelySystemInformation(data)
{
    const obj = JSON.parse(data);
    // Modify the sys-info div to show the current system information
    // document.getElementById("sys-info").innerHTML = obj.NameCpu + " " + obj.CurrentCpu + "<br>" +
    //                                                 obj.NameGpu + " " + obj.CurrentGpu3D + "<br>" +
    //                                                 obj.NameNetCard + " NETDOWN(MB/s): " + obj.CurrentNetDown/(1024*1024) +
    //                                                 " NETUP(MB/s): " + obj.CurrentNetUp/(1024*1024) + "<br>" +
    //                                                 "RAM(Total): " + obj.TotalRam + " RAM(Free): " + obj.CurrentRamAvail;
    cpuUsage = parseInt(obj.CurrentCpu * 10) / 10;
    gpuUsage = parseInt(obj.CurrentGpu3D * 10) / 10;
    ramUsage = parseInt(obj.CurrentRamAvail / obj.TotalRam * 100 * 10) / 10;
}

function livelyPropertyListener(name, val) {
    switch (name) {
        case "barCount":
            barCount = val;
            break;
        case "barWidth":
            barWidthSetting = val;
            break;
        case "barCompensation":
            compensate = val;
            break;
        case "offset":
            offset = val;
            break;
        case "padding":
            padding = val;
            break;
        case "barColor":
            barColor = val;
            break;
        case "barOpacity":
            barOpacity = val / 100;
            break;
        case "hasShadow":
            hasShadow = val;
            break;
        case "shadowBarColor":
            shadowColor = val;
            break;
        case "shadowBarOpacity":
            shadowOpacity = val / 100;
            break;
        default:
            break;
    }
}

function livelyCurrentTrack(data)
{
   const obj = JSON.parse(data);
   document.getElementById("currentTrack").textContent = obj.Title + " " + obj.Artist;
}


function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// // // Fill the audio array with 128 1's
for (let i = 0; i < 64; i++) {
    // put a random value between 0 and 1
    audio[i] = 1;
}


const timg = new Image();
timg.crossOrigin = 'anonymous';
timg.src = 'rsc/Hologram_transparent.png';
timg.width = 916.833;
timg.height = 410;
timg.onload = function() {
    let date = new Date();
    //get the minute
    let m = date.getSeconds();

    function runAnimation(step) {
        let d = new Date();
        if (d.getSeconds() != m) {
            drawSystem();
            m = d.getSeconds();
        }
        requestAnimationFrame(runAnimation);
    }
    window.requestAnimationFrame(runAnimation);
    // drawScreens();
    drawSystem();
};


/**************************************
 * System
 *************************************/

function drawSystem() {
    //clear the canvas
    dCtx.clearRect(0, 0, canvas.width, canvas.height);
    dCtx.shadowColor = "#00ffff";
    dCtx.shadowOffsetX = 0;
    dCtx.shadowOffsetY = 0;
    dCtx.shadowBlur = 10 * sx;
    dCtx.font = (17 * sx) + "px Spartan";
    dCtx.fillStyle = "white";
    dCtx.textAlign = "center";
    dCtx.fontStyle = "bold";
    const date = new Date();

    // get a 3 letter abbreviation for the day of the week
    const day = date.toLocaleString('en-US', {weekday: 'short'});
    utils.drawRotatedText(dCtx, day.toUpperCase(), 655 * sx, 376 * sy);

    // draw the current time
    dCtx.font = (33 * sx) + "px Spartan";
    const time = date.toLocaleTimeString('de-AT', {hour: '2-digit', minute: '2-digit'});
    dCtx.fillText(time, 720 * sx, 389 * sy);

    // colorize the image with a light blue color
    // const imgData = dCtx.getImageData(0, 0, timg.width, timg.height);
    // const data = imgData.data;
    // for (let i = 0; i < data.length; i += 4) {
    //     data[i] = data[i] * 0.9;
    //     data[i + 1] = data[i + 1] * 1;
    //     data[i + 2] = data[i + 2] * 1;
    // }
    // dCtx.putImageData(imgData, 0, 0);
    
    // dCtx.drawImage(timg, 0, 0, timg.width, timg.height);



    const color = "white";
    dCtx.strokeStyle = color;
    dCtx.fillStyle = color;
    dCtx.lineWidth = 3 * sx;


    let x = 0,y = 172 * sy;
    // line with a turn bottom left
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 248.3 * sx, y);
    dCtx.lineTo(x + 284.8 * sx, y + 63 * sy);
    dCtx.stroke();

    // line with a turn top left
    x = 70 * sx, y = 162 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 178.3 * sx, y);
    dCtx.lineTo(x + 214.8 * sx, y - 63 * sy);
    dCtx.stroke();

    // line with a turn enclosing top left
    x = 126.5 * sx, y = 155 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 24.8 * sx, y - 43 * sy);
    dCtx.lineTo(x + 140.3 * sx, y - 43 * sy);
    dCtx.stroke();

    // line with a turn extending bottom left
    x = 298 * sx, y = 260 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 24.8 * sx, y + 43 * sy);
    dCtx.lineTo(x + 140.3 * sx, y + 43 * sy);
    dCtx.stroke();

    // big Hexagon with triangle
    x = 254.5 * sx, y = 166.5 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 55 * sx, y + 94.5 * sy);
    dCtx.lineTo(x + 162.5 * sx, y + 94.5 * sy);
    dCtx.lineTo(x + 217 * sx, y);
    dCtx.lineTo(x + 162.5 * sx, y - 94.5 * sy);
    dCtx.lineTo(x + 55 * sx, y - 94.5 * sy);
    dCtx.closePath();
    dCtx.stroke();

    // big Hexagon 
    x = 424.5 * sx, y = 265.5 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 55 * sx, y + 94.5 * sy);
    dCtx.lineTo(x + 162.5 * sx, y + 94.5 * sy);
    dCtx.lineTo(x + 217 * sx, y);
    dCtx.lineTo(x + 162.5 * sx, y - 94.5 * sy);
    dCtx.lineTo(x + 55 * sx, y - 94.5 * sy);
    dCtx.closePath();
    dCtx.stroke();

    //bottom line
    x = 590.5 * sx, y = 365.2 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 24.8 * sx, y + 43 * sy);
    dCtx.lineTo(x + 194.5 * sx, y + 43 * sy);
    dCtx.stroke();

    // Long line
    x = 424.5 * sx, y = 67.5 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 54 * sx, y + 94.5 * sy);
    dCtx.lineTo(x + 422.5 * sx, y + 94.5 * sy);
    dCtx.stroke();
    
    //network line
    x = 721.5 * sx, y = 166.2 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 24.8 * sx, y + 43 * sy);
    dCtx.lineTo(x + 194.5 * sx, y + 43 * sy);
    dCtx.stroke();

    // Top line
    x = 663.3 * sx, y = 0;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 20.5 * sx, y + 36 * sy);
    dCtx.lineTo(x + 157 * sx, y + 36 * sy);
    dCtx.stroke();

    // Big Triangle
    dCtx.beginPath();
    dCtx.moveTo(cbtx, cbty);
    dCtx.lineTo(cbtx1, cbty1);
    dCtx.lineTo(cbtx2, cbty2);
    dCtx.closePath();
    dCtx.fill();

    // Small Triangle top
    x = 446.4 * sx, y = 3.8 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 33 * sx, y);
    dCtx.lineTo(x + 16.5 * sx, y + 28 * sy);
    dCtx.closePath();
    dCtx.stroke();

    // Small Triangle right
    x = 732.4 * sx, y = 112 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 33 * sx, y);
    dCtx.lineTo(x + 16.5 * sx, y - 28 * sy);
    dCtx.closePath();
    dCtx.stroke();

    // small hexagon top middle
    x = 465.4 * sx, y = 37.8 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 21 * sx, y + 34.8 * sy);
    dCtx.lineTo(x + 61.5 * sx, y + 34.8 * sy);
    dCtx.lineTo(x + 82.5 * sx, y);
    dCtx.lineTo(x + 61.5 * sx, y - 34.8 * sy);
    dCtx.lineTo(x + 21 * sx, y - 34.8 * sy);
    dCtx.closePath();
    dCtx.fill();

    // small empty hexagon below middle
    x = 465.4 * sx, y = 115.3 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 21 * sx, y + 34.8 * sy);
    dCtx.lineTo(x + 61.5 * sx, y + 34.8 * sy);
    dCtx.lineTo(x + 82.5 * sx, y);
    dCtx.lineTo(x + 61.5 * sx, y - 34.8 * sy);
    dCtx.lineTo(x + 21 * sx, y - 34.8 * sy);
    dCtx.closePath();
    dCtx.stroke();

    // small hexagon next to stacked hexagons
    x = 530.4 * sx, y = 76.55 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 21 * sx, y + 34.8 * sy);
    dCtx.lineTo(x + 61.5 * sx, y + 34.8 * sy);
    dCtx.lineTo(x + 82.5 * sx, y);
    dCtx.lineTo(x + 61.5 * sx, y - 34.8 * sy);
    dCtx.lineTo(x + 21 * sx, y - 34.8 * sy);
    dCtx.closePath();
    dCtx.fill();

    // small hexagon filled top right
    x = 595.4 * sx, y = 37.8 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 21 * sx, y + 34.8 * sy);
    dCtx.lineTo(x + 61.5 * sx, y + 34.8 * sy);
    dCtx.lineTo(x + 82.5 * sx, y);
    dCtx.lineTo(x + 61.5 * sx, y - 34.8 * sy);
    dCtx.lineTo(x + 21 * sx, y - 34.8 * sy);
    dCtx.closePath();
    dCtx.fill();

    // small hexagon right
    x = 660.4 * sx, y = 76.55 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 21 * sx, y + 34.8 * sy);
    dCtx.lineTo(x + 61.5 * sx, y + 34.8 * sy);
    dCtx.lineTo(x + 82.5 * sx, y);
    dCtx.lineTo(x + 61.5 * sx, y - 34.8 * sy);
    dCtx.lineTo(x + 21 * sx, y - 34.8 * sy);
    dCtx.closePath();
    dCtx.stroke();

    // small hexagon filled bottom
    x = 612.4 * sx, y = 204.8 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x + 21 * sx, y + 34.8 * sy);
    dCtx.lineTo(x + 61.5 * sx, y + 34.8 * sy);
    dCtx.lineTo(x + 82.5 * sx, y);
    dCtx.lineTo(x + 61.5 * sx, y - 34.8 * sy);
    dCtx.lineTo(x + 21 * sx, y - 34.8 * sy);
    dCtx.closePath();
    dCtx.fill();

    // line between digits
    dCtx.lineWidth = 2;
    x = 660.5 * sx, y = 355 * sy;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.lineTo(x, y + 41 * sy);
    dCtx.stroke();



    // Systems
    dCtx.fillStyle = "#a7a7a7";
    dCtx.strokeStyle = "#a7a7a7";
    dCtx.font = (18 * sx) + "px Spartan";
    dCtx.shadowColor = "transparent";
    dCtx.lineWidth = 2;
    //// CPU
    if (isCpuShown) {
        x = 505.4 * sx, y = 37.8 * sy;
        dCtx.fillText("CPU", x, y - 4 * sy);
        dCtx.fillText(cpuUsage, x, y + 22 * sy);
    }
    drawUsage(470.4 * sx, 37.8 * sy, cpuUsage);
    //// GPU
    if (isGpuShown) {
        x = 570.4 * sx, y = 76.55 * sy;
        dCtx.fillText("GPU", x, y - 4 * sy);
        dCtx.fillText(gpuUsage, x, y + 22 * sy);
    }
    drawUsage(535.4 * sx, 76.55 * sy, gpuUsage);

    //// RAM
    if (isRamShown) {
        x = 635.4 * sx, y = 37.8 * sy;
        dCtx.fillText("RAM", x, y - 4 * sy);
        dCtx.fillText(ramUsage, x, y + 22 * sy);
    }
    drawUsage(600.4 * sx, 37.8 * sy, ramUsage);

    function drawUsage(x, y, usage) {
        let usageLength = usage / 100 * 6;
        let hex1x = x + 18.5 * Math.min(Math.max(usageLength, 0), 1) * sx, hex1y = y + 29.8 * Math.min(Math.max(usageLength, 0), 1) * sy,
            hex2x = hex1x + 35.5 * Math.min(Math.max(usageLength - 1, 0), 1) * sx, hex2y = hex1y,
            hex3x = hex2x + 18.5 * Math.min(Math.max(usageLength - 2, 0), 1) * sx, hex3y = hex2y - 29.8* Math.min(Math.max(usageLength - 2, 0), 1) * sy,
            hex4x = hex3x - 18.5 * Math.min(Math.max(usageLength - 3, 0), 1) * sx, hex4y = hex3y - 29.8 * Math.min(Math.max(usageLength - 3, 0), 1) * sy,
            hex5x = hex4x - 35.5 * Math.min(Math.max(usageLength - 4, 0), 1) * sx, hex5y = hex4y,
            hex6x = hex5x - 18.5 * Math.min(Math.max(usageLength - 5, 0), 1) * sx, hex6y = hex5y + 29.8 * Math.min(Math.max(usageLength - 5, 0), 1) * sy;
        dCtx.beginPath();
        dCtx.moveTo(x, y);
        dCtx.lineTo(hex1x, hex1y);
        dCtx.lineTo(hex2x, hex2y);
        dCtx.lineTo(hex3x, hex3y);
        dCtx.lineTo(hex4x, hex4y);
        dCtx.lineTo(hex5x, hex5y);
        dCtx.lineTo(hex6x, hex6y);
        dCtx.stroke();
    }
    //// NETup

    let w, h;
    w = canvas.width;
    h = canvas.height;
    let corners = [[25 * sx,12 * sy],
    [w - 8 * sx, 8 * sy],
    [w*.5 + 18 * sx, h*.5 - 3 * sy], //center
    [35 * sx,h],
    [w, h - 33 * sy]];
    drawRotatedCanvas(dCanvas, canvas, corners)
    
}

function drawRotatedCanvas(fromCanvas, toCanvas, corners) {
    const img = new Image(916.833, 410);
    img.src = fromCanvas.toDataURL();

    fromCanvas.getContext('2d').clearRect(0, 0, fromCanvas.width, fromCanvas.height);

    let w, h;
    w = toCanvas.width;
    h = toCanvas.height;

    const toCtx = toCanvas.getContext('2d');
    
    function updateUI() {

        function drawTriangle(s1, s2, s3, d1, d2, d3) {
            //Overlap the destination areas a little
            //to avoid hairline cracks when drawing multiple connected triangles.
            const [d1x, d2x, d3x] = utils.expandTriangle(d1, d2, d3, .3),
                [s1x, s2x, s3x] = utils.expandTriangle(s1, s2, s3, .3);
            
            utils.drawImageTriangle(img, toCtx,
                                    s1x, s2x, s3x,
                                    d1x, d2x, d3x);
        }

        toCtx.clearRect(0,0, w,h);
        
        drawTriangle([0, 0], [w/2, h/2], [0, h], 
                    corners[0], corners[2], corners[3]);
        drawTriangle([0, 0], [w/2, h/2], [w, 0], 
                    corners[0], corners[2], corners[1]);

        drawTriangle([w, 0], [w/2, h/2], [w, h], 
                    corners[1], corners[2], corners[4]);

        drawTriangle([0, h], [w/2, h/2], [w, h], 
                    corners[3], corners[2], corners[4]);
    }

    img.onload = function()
    {
        updateUI();
    };
}


/**************************************
 * Audio
 *************************************/
function drawAudio() {
    //clear the audio canvas
    aCtx.clearRect(0, 0, aCanvas.width, aCanvas.height);

    const w = aCanvas.width;
    const h = aCanvas.height;
    const corners = [[13 * sx,127 * sy],
            [w - 18 * sx, 11 * sy],
            [18 * sx,h - 13 * sy],
            [w - 22 * sx, h - 180 * sy]];


    // calculate the width of the audio bar based on the width of the canvas
    const barWidth = (aCanvas.width / audio.length - padding) * (barWidthSetting / 100 + 0.5);

    let x1 = corners[2][0],y1 = corners[2][1]; // Bottom left
    let x2 = corners[0][0],y2 = corners[0][1]; // Top left
    let x3 = corners[1][0] - audio.length * padding,y3 = corners[1][1]; // Top right
    let x4 = corners[3][0] - audio.length * padding,y4 = corners[3][1]; // Bottom right
    // Vectors
    let xb = (x4 - x1) / audio.length,xt = (x3 - x2) / audio.length;
    let yb = (y4 - y1) / audio.length,yt = (y3 - y2) / audio.length;
    //draw the audio waveform by looping through the audio array and drawing a polygon with the audio values as y coordinates
    for (let i = 0; i < audio.length; i++) {
        const aud = audio[i];
        let heightTopA = y2 + i * yt;
        let heightTopB = y2 + (i + 1) * yt;
        
        const heightBotA =  y1 + i * yb;
        const heightBotB = y1 + (i + 1) * yb;
        
        heightTopA = heightBotA + (heightTopA - heightBotA) * aud;
        heightTopB = heightBotB + (heightTopB - heightBotB) * aud;


        aCtx.beginPath();
        aCtx.moveTo(x1 + i * xb + (i - 1) * padding, heightBotA); // Bottom left
        aCtx.lineTo(x2 + i * xt + (i - 1) * padding, heightTopA); // Top left
        aCtx.lineTo(x2 + barWidth + i * xt + (i - 1) * padding, heightTopB); // Top right
        aCtx.lineTo(x1 + barWidth + i * xb + (i - 1) * padding, heightBotB); // Bottom right
        aCtx.lineTo(x1 + i * xb + (i - 1) * padding, heightBotA); // back to Bottom left
        let color = hexToRgb(barColor);
        aCtx.fillStyle = `rgba(${color.r},${color.g},${color.b},${barOpacity})`;
        if (hasShadow) {
            let barShadowColor = hexToRgb(shadowColor);
            aCtx.shadowColor = `rgba(${barShadowColor.r},${barShadowColor.g},${barShadowColor.b},${shadowOpacity})`;
            aCtx.shadowOffsetX = 0;
            aCtx.shadowOffsetY = 0;
            aCtx.shadowBlur = 10 * sx;
        } else {
            aCtx.shadowColor = 'transparent';
        }
        aCtx.fill();
    }

}

/**************************************
 * Screens
 *************************************/
function drawScreens() {
    // s1Ctx.beginPath();
    // s1Ctx.moveTo(0, 0);
    // s1Ctx.lineTo(s1Canvas.width, 0);
    // s1Ctx.lineTo(s1Canvas.width, s1Canvas.height);
    // s1Ctx.lineTo(0, s1Canvas.height);
    // s1Ctx.closePath();
    // s1Ctx.fillStyle = "red";
    // s1Ctx.fill();

    const imgS1 = new Image(s1Canvas.width, s1Canvas.height);
    imgS1.src = 'rsc/Screenshot_89.png';
    debug.appendChild(imgS1);
    
    imgS1.onload = function() {
        s1Ctx.drawImage(imgS1, 0, 0, s1Canvas.width / 2.9, s1Canvas.height / 2.5);
        let w, h, corners;
        w = s1Canvas.width;
        h = s1Canvas.height;
        corners = [
            [40 * sx, 28 * sy],
            [w - 38 * sx, 24 * sy],
            [w*.5 + 10 * sx, h*.5 - 10 * sy], //center
            [38 * sx,h - 9 * sy],
            [w + - 42 * sx, h - 22 * sy]
        ];
        drawRotatedCanvas(s1Canvas, s1Canvas, corners);
    }


    s2Ctx.beginPath();
    s2Ctx.moveTo(0, 0);
    s2Ctx.lineTo(s1Canvas.width, 0);
    s2Ctx.lineTo(s1Canvas.width, s1Canvas.height);
    s2Ctx.lineTo(0, s1Canvas.height);
    s2Ctx.closePath();
    s2Ctx.fillStyle = "green";
    s2Ctx.fill();

    w = s2Canvas.width;
    h = s2Canvas.height;
    corners = [
        [25 * sx,12 * sy],
        [w - 8 * sx, 8 * sy],
        [w*.5 + 18 * sx, h*.5 - 3 * sy], //center
        [35 * sx,h],
        [w + -9 * sx, h - 33 * sy]
    ];
    drawRotatedCanvas(s2Canvas, s2Canvas, corners);
}


/**************************************
 * Utils
 *************************************/

//http://mike.teczno.com/notes/canvas-warp.html
//http://s3.amazonaws.com/canvas-warp/2009-11-01/index.html
const utils = {

    rndInt(max) {
        return Math.round(Math.random() * max);
    },
    
    /**
     * https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle
     * https://math.stackexchange.com/questions/1413372/find-cartesian-coordinates-of-the-incenter
     * https://www.mathopenref.com/coordincenter.html
     */
    calcIncircle(A, B, C) {
        function lineLen(p1, p2) {
            const dx = p2[0] - p1[0],
                    dy = p2[1] - p1[1];
            return Math.sqrt(dx*dx + dy*dy);
        }
        
        //Side lengths, perimeter p and semi-perimeter s:
        const a = lineLen(B, C),
                b = lineLen(C, A),
                c = lineLen(A, B),
                p = (a + b + c),
                s = p/2;
        
        //Heron's formula
        //https://www.wikihow.com/Calculate-the-Area-of-a-Triangle#Using_Side_Lengths
        const area = Math.sqrt(s * (s-a) * (s-b) * (s-c));
        //Faster(?) alternative:
        //http://geomalgorithms.com/a01-_area.html#Modern-Triangles
        //const area = Math.abs( (B[0]-A[0])*(C[1]-A[1]) - (C[0]-A[0])*(B[1]-A[1]) )/2;

        //Incircle radius r
        //  https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle#Relation_to_area_of_the_triangle
        //..and center [cx, cy]
        //  https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle#Cartesian_coordinates
        //  https://www.mathopenref.com/coordincenter.html
        const r = area/s,
                cx = (a*A[0] + b*B[0] + c*C[0]) / p,
                cy = (a*A[1] + b*B[1] + c*C[1]) / p;
        return {
            r,
            c: [cx, cy],
        }
    },
    
    /*
        * https://math.stackexchange.com/questions/17561/how-to-shrink-a-triangle
        */
    expandTriangle(A, B, C, amount) {
        const inCircle = this.calcIncircle(A, B, C),
                c = inCircle.c,
                factor = (inCircle.r + amount)/(inCircle.r);
        
        function extendPoint(p) {
            const dx = p[0] - c[0],
                    dy = p[1] - c[1],
                    x2 = (dx * factor) + c[0],
                    y2 = (dy * factor) + c[1];
            return [x2, y2];
        }
        
        const A2 = extendPoint(A),
                B2 = extendPoint(B),
                C2 = extendPoint(C);
        return[A2, B2, C2];
    },

    /**
     *  Solves a system of linear equations.
     *
     *  t1 = (a * r1) + (b + s1) + c
     *  t2 = (a * r2) + (b + s2) + c
     *  t3 = (a * r3) + (b + s3) + c
     *
     *  r1 - t3 are the known values.
     *  a, b, c are the unknowns to be solved.
     *  returns the a, b, c coefficients.
     */
    linearSolution(r1, s1, t1, r2, s2, t2, r3, s3, t3)
    {
        const a = (((t2 - t3) * (s1 - s2)) - ((t1 - t2) * (s2 - s3))) / (((r2 - r3) * (s1 - s2)) - ((r1 - r2) * (s2 - s3)));
        const b = (((t2 - t3) * (r1 - r2)) - ((t1 - t2) * (r2 - r3))) / (((s2 - s3) * (r1 - r2)) - ((s1 - s2) * (r2 - r3)));
        const c = t1 - (r1 * a) - (s1 * b);

        return [a, b, c];
    },

    /**
     *  This draws a triangular area from an image onto a canvas,
     *  similar to how ctx.drawImage() draws a rectangular area from an image onto a canvas.
     *
     *  s1-3 are the corners of the triangular area on the source image, and
     *  d1-3 are the corresponding corners of the area on the destination canvas.
     *
     *  Those corner coordinates ([x, y]) can be given in any order,
     *  just make sure s1 corresponds to d1 and so forth.
     */
    drawImageTriangle(img, tCtx, s1, s2, s3, d1, d2, d3) {
        //I assume the "m" is for "magic"...
        const xm = this.linearSolution(s1[0], s1[1], d1[0],  s2[0], s2[1], d2[0],  s3[0], s3[1], d3[0]),
                ym = this.linearSolution(s1[0], s1[1], d1[1],  s2[0], s2[1], d2[1],  s3[0], s3[1], d3[1]);

        tCtx.save();

        tCtx.setTransform(xm[0], ym[0], xm[1], ym[1], xm[2], ym[2]);
        tCtx.beginPath();
        tCtx.moveTo(s1[0], s1[1]);
        tCtx.lineTo(s2[0], s2[1]);
        tCtx.lineTo(s3[0], s3[1]);
        tCtx.closePath();
        //Leaves a faint black (or whatever .fillStyle) border around the drawn triangle
        //  ctx.fill();
        tCtx.clip();
        tCtx.drawImage(img, 0, 0, img.width, img.height);

        tCtx.restore();
    },

    /**
     * Draws a 90-degree rotated text on a canvas.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {String} text 
     * @param {int} x 
     * @param {int} y 
     */
    drawRotatedText(tCtx, text, x, y) {
        tCtx.save();
        tCtx.translate(x, y);
        tCtx.rotate(-Math.PI/2);
        tCtx.fillText(text, 0, 0);
        tCtx.restore();
    },
    /**
     * Utility for the point in Triangle check function.
     */
    sign (p1x, p1y, p2x, p2y, p3x, p3y)
    {
        return (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);
    },
    /**
     * Checks if a point is inside a triangle.
     * @returns if the point is inside the triangle
     */
    pointInTriangle (ptx, pty, v1x, v1y, v2x, v2y, v3x, v3y)
    {
        let d1, d2, d3;
        let has_neg, has_pos;

        d1 = this.sign(ptx, pty, v1x, v1y, v2x, v2y);
        d2 = this.sign(ptx, pty, v2x, v2y, v3x, v3y);
        d3 = this.sign(ptx, pty, v3x, v3y, v1x, v1y);

        has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

        return !(has_neg && has_pos);
    },
    pointInRectangle (ptx, pty, v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y)
    {
        // Check if point is in the rectangle of the defined vertices by checking if the value is greater or smaller then others.
        return (ptx > v1x && ptx < v3x &&
            pty > v1y && pty < v3y)
    },
    pointInHexagon (ptx, pty, v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y, v5x, v5y, v6x, v6y) {
        if (this.pointInRectangle(ptx, pty, v6x, v6y, v5x, v5y, v3x, v3y, v2x, v2y) ||
            this.pointInTriangle(ptx, pty, v1x, v1y, v2x, v2y, v6x, v6y) ||
            this.pointInTriangle(ptx, pty, v3x, v3y, v4x, v4y, v5x, v5y)) {
            return true;
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    livelyAudioListener([0])
  })

let triangleAnimator;
let progress = 0;
let angle = 0;

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return { x, y };
}

function drawRotatedTriangle(angle) {
    cbtx = btcx + (Math.cos((angle - 180 + 330) * Math.PI / 180) * 90) * btrad;
    cbty = btcy + (Math.sin((angle - 180 + 330) * Math.PI / 180) * 90) * btrad;
    cbtx1 = btcx + (Math.cos((angle - 180 + 90) * Math.PI / 180) * 90) * btrad;
    cbty1 = btcy + (Math.sin((angle - 180 + 90) * Math.PI / 180) * 90) * btrad;
    cbtx2 = btcx + (Math.cos((angle - 180 + 210) * Math.PI / 180) * 90) * btrad;
    cbty2 = btcy + (Math.sin((angle - 180 + 210) * Math.PI / 180) * 90) * btrad;
    drawSystem();
}

canvas.addEventListener('mousedown', function(e) {
    const pos = getCursorPosition(canvas, e);
    if (utils.pointInTriangle(pos.x, pos.y, mbtx, mbty, mbtx1, mbty1, mbtx2, mbty2)) {
        clearInterval(triangleAnimator);
        progress = 0;
        angle = 0;
        triangleAnimator = setInterval(() => {
            if (progress < 241 * 1.355) {
                // calculate the 3 points of the triangle cbtx, cbty, cbtx1, cbty1, cbtx2, cbty2 who start at: 330, 210 and 90 degree angles. Rotate them by progress degrees.
                drawRotatedTriangle(angle);

                // console.log("cbtx: " + cbtx + " cbty: " + cbty + " cbtx1: " + cbtx1 + " cbty1: " + cbty1 + " cbtx2: " + cbtx2 + " cbty2: " + cbty2)
                const vx = progress / 241;
                
                progress += 1;
                angle += (-5.69173 * vx * vx * vx + 8.87011 * vx * vx - 2.17838 * vx) * 8;
            } else {
                drawRotatedTriangle(0);
                clearInterval(triangleAnimator);
            }
        }, 1);
    }
});

canvas.addEventListener('mousemove', function(e) {
    const pos = getCursorPosition(canvas, e);
    // console.log(pos.x + " " + parseInt(pos.y));
    let wasShownBefore = isCpuShown;
    isCpuShown = false;
    if (utils.pointInHexagon(pos.x, pos.y, 475 * sx, 43.8 * sy, 497 * sx, 75.8 * sy, 536 * sx, 75.8 * sy, 553 * sx, 42.8 * sy, 534 * sx, 10.8 * sy, 493 * sx, 11.8 * sy)) {
        if (!wasShownBefore) {
            drawSystem();
        }
        isCpuShown = true;
    }
    wasShownBefore = isGpuShown;
    isGpuShown = false;
    if (utils.pointInHexagon(pos.x, pos.y, 537 * sx, 80.8 * sy, 561 * sx, 111.8 * sy, 601 * sx, 111.8 * sy, 618 * sx, 78.8 * sy, 597 * sx, 47.8 * sy, 558 * sx, 48.8 * sy)) {
        if (!wasShownBefore) {
            drawSystem();
        }
        isGpuShown = true;
    }
    wasShownBefore = isRamShown;
    isRamShown = false;
    if (utils.pointInHexagon(pos.x, pos.y, 601 * sx, 43.8 * sy, 621 * sx, 75.8 * sy, 661 * sx, 75.8 * sy, 679 * sx, 42.8 * sy, 658 * sx, 11.8 * sy, 619 * sx, 11.8 * sy)) {
        if (!wasShownBefore) {
            drawSystem();
        }
        isRamShown = true;
    }
});