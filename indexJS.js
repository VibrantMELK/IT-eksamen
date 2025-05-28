


// --- Variabler og oppsett for canvas og spill ---
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const ballRadius = 10;
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// Ballens startposisjon og hastighet
let x = canvas.width / 5;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

// Tastetrykk status
let rightPressed = false;
let leftPressed = false;
let interval = 0;  // Spilleloop
let score = 0;
let lives = 3;

//Brikker
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 }; // status 1 = aktiv
  }
}

//tastatur og  mus bevegelser
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
// mus bevegelser
function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

// Tegnefunksjoner for spill-elementer 
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#30BCED";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#FC5130";
  ctx.fill();
  ctx.closePath();
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#FC5130";
  ctx.fill();
  ctx.closePath();
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0; // Fjern stein
          score++;
          if (score === brickRowCount * brickColumnCount) {
            alert("You win, congratulations!");
            lagreScore(); // Lagre poengsum i cookies.
            document.location.reload(); // Start på nytt
            clearInterval(interval);
          }
        }
      }
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#050401";
  ctx.fillText(`Score: ${score}`, 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#050401";
  ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

//Hovedspill loopen
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Tøm skjermen
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  collisionDetection();

  // Vegg kollisjon høyre/venstre
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  
  // Vegg kollisjon topp
  if (y + dy < ballRadius) dy = -dy;
  // Ballen treffer bunn - sjekk om paddle treffer
  else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy; // Ballen spretter tilbake
    } else {
      lives--; // Mister liv
      if (!lives) {
        clearInterval(interval);
        lagreScore();   // Lagre score i DB
      } else {
        // Reset ball og paddle
        x = canvas.width / 5;
        y = canvas.height - 30;
        dx = 2;
        dy = -2;
        paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  }

  // Flytt paddle med tastetrykk
  if (rightPressed) paddleX = Math.min(paddleX + 7, canvas.width - paddleWidth);
  else if (leftPressed) paddleX = Math.max(paddleX - 7, 0);

  // Flytt ballen
  x += dx;
  y += dy;
}

// startknapp, start spill når trykket 
document.getElementById("runButton").addEventListener("click", function () {
  startGame();
  this.disabled = true; // Deaktiver knapp mens spillet pågår
});

function startGame() {
  const name = getCookie("playerName");
  if (!name) {
    const inputName = prompt("Hva heter du?");
    if (inputName && inputName.trim() !== "") {
      setCookie("playerName", inputName, 30);
      alert("Lykke til, " + inputName + "!");
    } else {
      alert("Du må skrive inn et navn for å spille.");
      return;
    }
  } else {
    alert("Velkommen tilbake, " + name + "!");
  }

  interval = setInterval(draw, 10);
}


function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

function getCookie(name) {
  const cname = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');
  for (let c of cookies) {
    c = c.trim();
    if (c.indexOf(cname) === 0) {
      return c.substring(cname.length, c.length);
    }
  }
  return "";
}



  function lagreScore() {
    const highscore = parseInt(getCookie("highscore") || "0");
    if (score > highscore) {
      setCookie("highscore", score, 30);
      alert("Ny rekord! " + score + " poeng.");
    } else {
      alert("Din poengsum: " + score + ". Rekorden er: " + highscore);
    }
  }
  

function slettSpiller() {
  // sett cookie med dato i fortiden for å slette den 
  setCookie("playerName", "", -1);
  setCookie("highscore", "", -1);
  alert("Spiller og rekord er slettet!");
  nullstillSkjerm();
}

function nullstillSkjerm() {
  // Tilbakestill spillvariabler
  score = 0;
  lives = 3;
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2;
  dy = -2;
  paddleX = (canvas.width - paddleWidth) / 2;

  // Gjenopprett brikkene
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
    }
  }

  // Stopp eventuelt spill
  clearInterval(interval);
  document.getElementById("runButton").disabled = false;

  // Tøm canvas og tegn opp nullstilt tilstand
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
}

document.getElementById("slettSpiller").addEventListener("click", slettSpiller);
