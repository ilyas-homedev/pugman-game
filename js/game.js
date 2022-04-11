import map from "./map.js";

const canvas = document.querySelector("canvas");
const canvasContainer = document.querySelector(".canvas-container");
const gameDataEl = document.querySelector("#game-data");

const c = canvas.getContext("2d");

const scoreEl = document.querySelector("#score");

const decreaseBtn = document.querySelector("#decreaseEl");
const increaseBtn = document.querySelector("#increaseEl");
const ghostsAmountEl = document.querySelector("#ghostsAmountEl");

const decreaseSpeedBtn = document.querySelector("#decreaseSpeedEl");
const increaseSpeedBtn = document.querySelector("#increaseSpeedEl");
const ghostsSpeedEl = document.querySelector("#ghostsSpeedEl");

const startBtn = document.querySelector("#start");
const stopBtn = document.querySelector("#stop");

const startingScreenEl = document.querySelector("#startingScreenEl");
const banner = document.querySelector("#banner");
const endGamePhraseEl = document.querySelector("#endGamePhraseEl");
const winnerScoreEl = document.querySelector("#winnerScore");

// arrays and constants for displaying all parts of the game
let boundaries = [];
let pellets = [];
let boosters = [];
let ghosts = [];
let boundaryWidth;
let playerRadius;
let ghostRadius;
let playerSpeed;
let ghostSpeed = 3;
let amountOfGhosts = 3;
let minGhostSpeed;
let maxGhostSpeed;
let score = 0;
let endGamePhrase = "You Lose!";

// Reset values depending on the screen size
function resetValues() {
  canvas.height = canvasContainer.offsetHeight;
  gameDataEl.style.height = canvasContainer.offsetHeight;

  boundaryWidth =
    Math.floor(canvas.height / 21) % 2 === 0
      ? Math.floor(canvas.height / 21)
      : Math.floor(canvas.height / 21) - 1;
  if (boundaryWidth > 40) {
    boundaryWidth = 40;
  }

  canvas.width = 19 * boundaryWidth;
  canvasContainer.style.width = canvas.width;

  playerRadius = Math.floor((boundaryWidth * 0.75) / 2);
  ghostRadius = Math.floor((boundaryWidth * 0.75) / 2);

  if (boundaryWidth < 30) {
    playerSpeed = 2;
    minGhostSpeed = 2;
    maxGhostSpeed = 3;
  } else if (boundaryWidth < 40) {
    playerSpeed = 3;
    minGhostSpeed = 2;
    maxGhostSpeed = 3;
  } else {
    playerSpeed = 4;
    minGhostSpeed = 2;
    maxGhostSpeed = 5;
  }
}
resetValues();

decreaseBtn.addEventListener("click", () => {
  if (amountOfGhosts > 2) {
    amountOfGhosts -= 1;
  }
  ghostsAmountEl.textContent = amountOfGhosts;
});

increaseBtn.addEventListener("click", () => {
  if (amountOfGhosts < 6) {
    amountOfGhosts += 1;
  }
  ghostsAmountEl.textContent = amountOfGhosts;
});

decreaseSpeedBtn.addEventListener("click", () => {
  if (ghostSpeed > minGhostSpeed) {
    ghostSpeed -= 1;
  }
  ghostsSpeedEl.textContent = ghostSpeed;
});

increaseSpeedBtn.addEventListener("click", () => {
  if (ghostSpeed < maxGhostSpeed) {
    ghostSpeed += 1;
  }
  ghostsSpeedEl.textContent = ghostSpeed;
});

startBtn.addEventListener("click", startGame);

stopBtn.addEventListener("click", stopGame);

class Boundary {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw() {
    c.fillStyle = "blue";
    c.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Player {
  constructor({ x, y, radius, velocity }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.velocity = velocity;
    this.color = "gold";
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Pellet {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = "white";
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }
}

class Booster {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = "white";
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }
}

class Ghost {
  constructor({ x, y, radius, velocity, ready }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.velocity = velocity;
    this.color = "red";
    this.prevCollisions = [];
    this.ready = ready;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

// Fill in boundary array and pellets array
function createMap() {
  map.forEach((row, rawIndex) => {
    row.forEach((wall, wallIndex) => {
      switch (wall) {
        case "-":
          boundaries.push(
            new Boundary(
              wallIndex * boundaryWidth,
              rawIndex * boundaryWidth, // Width and Height of boundary are equal to each other
              boundaryWidth,
              boundaryWidth
            )
          );
          break;
        case ".":
          pellets.push(
            new Pellet(
              wallIndex * boundaryWidth + boundaryWidth / 2,
              rawIndex * boundaryWidth + boundaryWidth / 2, // Width and Height of boundary are equal to each other
              2
            )
          );
          break;
        case "o":
          boosters.push(
            new Booster(
              wallIndex * boundaryWidth + boundaryWidth / 2,
              rawIndex * boundaryWidth + boundaryWidth / 2, // Width and Height of boundary are equal to each other
              8
            )
          );
          break;
        case "g":
          for (let i = 0; i < amountOfGhosts; i++) {
            ghosts.push(
              new Ghost({
                x: wallIndex * boundaryWidth + boundaryWidth / 2,
                y: rawIndex * boundaryWidth + boundaryWidth / 2, // Width and Height of boundary are equal to each other
                radius: ghostRadius,
                velocity: { x: ghostSpeed, y: 0 },
                ready: false,
              })
            );
          }
          break;
      }
    });
  });
}
// Creating player
let player = new Player({
  x: 9 * boundaryWidth + boundaryWidth / 2,
  y: 11 * boundaryWidth + boundaryWidth / 2,
  radius: playerRadius,
  velocity: { x: -playerSpeed, y: 0 },
});

// Defining keys of keyboard
const keys = {
  right: { pressed: false },
  left: { pressed: false },
  up: { pressed: false },
  down: { pressed: false },
};
let lastKey;
addEventListener("keydown", (event) => {
  const key = event.key;
  switch (key) {
    case "ArrowRight":
      keys.right.pressed = true;
      lastKey = "ArrowRight";
      break;
    case "ArrowLeft":
      keys.left.pressed = true;
      lastKey = "ArrowLeft";
      break;
    case "ArrowDown":
      keys.down.pressed = true;
      lastKey = "ArrowDown";
      break;
    case "ArrowUp":
      keys.up.pressed = true;
      lastKey = "ArrowUp";
      break;
    case " ":
      startGame();
  }
});

addEventListener("keyup", (event) => {
  const key = event.key;
  switch (key) {
    case "ArrowRight":
      keys.right.pressed = false;
      break;
    case "ArrowLeft":
      keys.left.pressed = false;
      break;
    case "ArrowDown":
      keys.down.pressed = false;
      break;
    case "ArrowUp":
      keys.up.pressed = false;
      break;
  }
});

function circleCollidesWith({ circle, anything }) {
  const distance = anything.width / 2 - circle.radius - 2;
  return (
    circle.x + circle.radius + circle.velocity.x >= anything.x - distance &&
    circle.x - circle.radius + circle.velocity.x <=
      anything.x + anything.width + distance &&
    circle.y + circle.radius + circle.velocity.y >= anything.y - distance &&
    circle.y - circle.radius + circle.velocity.y <=
      anything.y + anything.height + distance
  );
}

// Animating
let animationId;
function animate() {
  c.clearRect(0, 0, innerWidth, innerHeight);
  animationId = requestAnimationFrame(animate);

  scoreEl.textContent = score;
  winnerScoreEl.textContent = score;

  handlePlayerCollisionsWithBoundaries();
  // Creating boundaries
  // Setting player's and ghost's velocity to 0 in case of collisions with boundaries
  boundariesSettings();
  // Creating pellets and eating it + changing score
  pelletsSettings();
  // Win the game
  if (pellets.length === 0) {
    gameOver("You Won!");
  }
  // Creating boosters and eating it + changing score
  boostersSettings();
  // Creating ghosts, processing it's behaviour and interaction with boundaries and player
  ghostSettings();

  player.update();
}

// Each ghosts appears after time
function prepareGhost(ghost, index) {
  setTimeout(() => {
    ghost.ready = true;
  }, index * 5000);
}

// Ghosts become blue and you can eat them
function scaredGhosts() {
  ghosts.forEach((ghost) => {
    const defaultColor = ghost.color;
    if (defaultColor !== "blue") {
      ghost.color = "blue";
      setTimeout(() => {
        ghost.color = defaultColor;
      }, 6000);
    }
  });
}

// Starts new game
function startGame() {
  stopGame();
  banner.classList.remove("close");
  startingScreenEl.style.display = "none";
  player = new Player({
    x: 9 * boundaryWidth + boundaryWidth / 2,
    y: 11 * boundaryWidth + boundaryWidth / 2,
    radius: playerRadius,
    velocity: { x: -playerSpeed, y: 0 },
  });
  decreaseBtn.disabled = true;
  increaseBtn.disabled = true;
  decreaseSpeedBtn.disabled = true;
  increaseSpeedBtn.disabled = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  createMap();
  animate();
}

// Restarts the game
function stopGame() {
  resetValues();
  boundaries = [];
  pellets = [];
  boosters = [];
  ghosts = [];
  score = 0;
  ghostsAmountEl.textContent = amountOfGhosts;
  ghostsSpeedEl.textContent = ghostSpeed;
  decreaseBtn.disabled = false;
  increaseBtn.disabled = false;
  decreaseSpeedBtn.disabled = false;
  increaseSpeedBtn.disabled = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  cancelAnimationFrame(animationId);
}

// After winning or loosing a game
function gameOver(phrase) {
  stopGame();
  endGamePhrase = phrase;
  banner.classList.add("close");
  endGamePhraseEl.textContent = endGamePhrase;
}

function handlePlayerCollisionsWithBoundaries() {
  if (keys.right.pressed && lastKey === "ArrowRight") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      const playerCollidesWithBoundaryRight = circleCollidesWith({
        circle: { ...player, velocity: { x: playerSpeed, y: 0 } },
        anything: boundary,
      });

      if (playerCollidesWithBoundaryRight) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = playerSpeed;
      }
    }
  }
  if (keys.left.pressed && lastKey === "ArrowLeft") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      const playerCollidesWithBoundaryLeft = circleCollidesWith({
        circle: { ...player, velocity: { x: -playerSpeed, y: 0 } },
        anything: boundary,
      });

      if (playerCollidesWithBoundaryLeft) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = -playerSpeed;
      }
    }
  }
  if (keys.down.pressed && lastKey === "ArrowDown") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      const playerCollidesWithBoundaryDown = circleCollidesWith({
        circle: { ...player, velocity: { x: 0, y: playerSpeed } },
        anything: boundary,
      });

      if (playerCollidesWithBoundaryDown) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = playerSpeed;
      }
    }
  }
  if (keys.up.pressed && lastKey === "ArrowUp") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      const playerCollidesWithBoundaryUp = circleCollidesWith({
        circle: { ...player, velocity: { x: 0, y: -playerSpeed } },
        anything: boundary,
      });

      if (playerCollidesWithBoundaryUp) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = -playerSpeed;
      }
    }
  }
}

function boundariesSettings() {
  boundaries.forEach((boundary) => {
    boundary.draw();

    if (circleCollidesWith({ circle: player, anything: boundary })) {
      player.velocity.x = 0;
      player.velocity.y = 0;
    }

    ghosts.forEach((ghost) => {
      if (circleCollidesWith({ circle: ghost, anything: boundary })) {
        ghost.velocity.x = 0;
        ghost.velocity.y = 0;
      }
    });
  });
}

function pelletsSettings() {
  pellets.forEach((pellet, pelletIndex) => {
    pellet.draw();
    const distanceToPlayer = Math.hypot(
      player.x - pellet.x,
      player.y - pellet.y
    );

    if (distanceToPlayer <= 0) {
      setTimeout(() => pellets.splice(pelletIndex, 1), 0);
      score += 100;
    }
  });
}

function boostersSettings() {
  boosters.forEach((booster, boosterIndex) => {
    booster.draw();
    const distanceToPlayer = Math.hypot(
      player.x - booster.x,
      player.y - booster.y
    );

    if (distanceToPlayer <= 0) {
      setTimeout(() => boosters.splice(boosterIndex, 1), 0);
      score += 200;

      scaredGhosts();
    }
  });
}

function ghostSettings() {
  ghosts.forEach((ghost, ghostIndex) => {
    prepareGhost(ghost, ghostIndex);
    if (ghost.ready) {
      ghost.update();
    }
    const ghostEatsPlayer =
      Math.hypot(player.x - ghost.x, player.y - ghost.y) <=
        player.radius + ghost.radius &&
      ghost.color !== "blue" &&
      ghost.ready;

    if (ghostEatsPlayer) {
      gameOver("You Lose!");
    }

    const playerEatsGhost =
      Math.hypot(player.x - ghost.x, player.y - ghost.y) <=
        player.radius + ghost.radius && ghost.color === "blue";

    if (playerEatsGhost) {
      ghosts.splice(ghostIndex, 1);
      score += 300;
      ghosts.push(
        new Ghost({
          x: 9 * boundaryWidth + boundaryWidth / 2,
          y: 9 * boundaryWidth + boundaryWidth / 2,
          radius: ghostRadius,
          velocity: { x: ghostSpeed, y: 0 },
          ready: false,
        })
      );
    }

    const collisions = [];
    boundaries.forEach((boundary) => {
      if (
        !collisions.includes("right") &&
        circleCollidesWith({
          circle: { ...ghost, velocity: { x: ghostSpeed, y: 0 } },
          anything: boundary,
        })
      ) {
        collisions.push("right");
      }

      if (
        !collisions.includes("left") &&
        circleCollidesWith({
          circle: { ...ghost, velocity: { x: -ghostSpeed, y: 0 } },
          anything: boundary,
        })
      ) {
        collisions.push("left");
      }

      if (
        !collisions.includes("down") &&
        circleCollidesWith({
          circle: { ...ghost, velocity: { x: 0, y: ghostSpeed } },
          anything: boundary,
        })
      ) {
        collisions.push("down");
      }

      if (
        !collisions.includes("up") &&
        circleCollidesWith({
          circle: { ...ghost, velocity: { x: 0, y: -ghostSpeed } },
          anything: boundary,
        })
      ) {
        collisions.push("up");
      }
    });

    if (collisions.length > ghost.prevCollisions.length) {
      ghost.prevCollisions = collisions;
    }

    if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
      if (ghost.velocity.x > 0) ghost.prevCollisions.push("right");
      else if (ghost.velocity.x < 0) ghost.prevCollisions.push("left");
      else if (ghost.velocity.y > 0) ghost.prevCollisions.push("down");
      else if (ghost.velocity.y < 0) ghost.prevCollisions.push("up");

      const pathways = ghost.prevCollisions.filter((collision) => {
        return !collisions.includes(collision);
      });

      const direction = pathways[Math.floor(Math.random() * pathways.length)];

      switch (direction) {
        case "down":
          ghost.velocity.y = ghostSpeed;
          ghost.velocity.x = 0;
          break;
        case "up":
          ghost.velocity.y = -ghostSpeed;
          ghost.velocity.x = 0;
          break;
        case "right":
          ghost.velocity.x = ghostSpeed;
          ghost.velocity.y = 0;
          break;
        case "left":
          ghost.velocity.x = -ghostSpeed;
          ghost.velocity.y = 0;
          break;
      }

      ghost.prevCollisions = [];
    }
  });
}
