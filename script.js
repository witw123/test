const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const restartButton = document.getElementById("restart");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMessage = document.getElementById("overlay-message");
const overlayAction = document.getElementById("overlay-action");

const gridSize = 20;
const cells = canvas.width / gridSize;
const tickSpeed = 140;

let snake;
let direction;
let nextDirection;
let food;
let score;
let isPaused = false;
let isGameOver = false;
let lastTick = 0;
let bestScore = Number.parseInt(localStorage.getItem("snake-best"), 10) || 0;

bestScoreEl.textContent = bestScore;

const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function resetGame() {
  snake = [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  isPaused = false;
  isGameOver = false;
  lastTick = 0;
  scoreEl.textContent = score;
  overlay.classList.add("hidden");
  placeFood();
  draw();
}

function placeFood() {
  let candidate;
  do {
    candidate = {
      x: Math.floor(Math.random() * cells),
      y: Math.floor(Math.random() * cells),
    };
  } while (snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y));
  food = candidate;
}

function updateScore() {
  scoreEl.textContent = score;
  if (score > bestScore) {
    bestScore = score;
    bestScoreEl.textContent = bestScore;
    localStorage.setItem("snake-best", bestScore.toString());
  }
}

function setDirection(newDirection) {
  if (!newDirection) {
    return;
  }
  if (isGameOver) {
    return;
  }
  if (newDirection.x + direction.x === 0 && newDirection.y + direction.y === 0) {
    return;
  }
  nextDirection = newDirection;
}

function togglePause() {
  if (isGameOver) {
    return;
  }
  isPaused = !isPaused;
  overlayTitle.textContent = isPaused ? "已暂停" : "";
  overlayMessage.textContent = isPaused ? "按空格继续游戏" : "";
  overlay.classList.toggle("hidden", !isPaused);
}

function endGame() {
  isGameOver = true;
  overlayTitle.textContent = "游戏结束";
  overlayMessage.textContent = `你的得分为 ${score} 分。`;
  overlayAction.textContent = "再来一局";
  overlay.classList.remove("hidden");
}

function step() {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells) {
    endGame();
    return;
  }

  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    updateScore();
    placeFood();
  } else {
    snake.pop();
  }
}

function drawGrid() {
  context.strokeStyle = "rgba(148, 163, 184, 0.08)";
  context.lineWidth = 1;
  for (let i = 0; i <= cells; i += 1) {
    const pos = i * gridSize;
    context.beginPath();
    context.moveTo(pos, 0);
    context.lineTo(pos, canvas.height);
    context.stroke();
    context.beginPath();
    context.moveTo(0, pos);
    context.lineTo(canvas.width, pos);
    context.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const gradient = context.createLinearGradient(
      segment.x * gridSize,
      segment.y * gridSize,
      (segment.x + 1) * gridSize,
      (segment.y + 1) * gridSize
    );
    gradient.addColorStop(0, index === 0 ? "#34d399" : "#22c55e");
    gradient.addColorStop(1, "#16a34a");
    context.fillStyle = gradient;
    context.fillRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
  });
}

function drawFood() {
  context.fillStyle = "#f97316";
  context.beginPath();
  context.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2.5,
    0,
    Math.PI * 2
  );
  context.fill();
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSnake();
}

function loop(timestamp) {
  if (!lastTick) {
    lastTick = timestamp;
  }
  const elapsed = timestamp - lastTick;
  if (!isPaused && !isGameOver && elapsed > tickSpeed) {
    step();
    lastTick = timestamp;
  }
  draw();
  window.requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }
  setDirection(directions[event.key]);
});

restartButton.addEventListener("click", resetGame);
overlayAction.addEventListener("click", resetGame);

resetGame();
window.requestAnimationFrame(loop);
