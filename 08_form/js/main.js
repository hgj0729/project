"use strict";


/* =========================
   DOM
========================= */

const canvas =
  document.getElementById("gameCanvas");

const ctx =
  canvas.getContext("2d");


const previewCanvas =
  document.getElementById("previewCanvas");

const previewCtx =
  previewCanvas.getContext("2d");


const scoreElement =
  document.getElementById("score");

const bestScoreElement =
  document.getElementById("bestScore");


const pauseBtn =
  document.getElementById("pauseBtn");

const startBtn =
  document.getElementById("startBtn");


const overlay =
  document.getElementById("gameOverlay");

const overlayTitle =
  document.getElementById("overlayTitle");

const overlayText =
  document.getElementById("overlayText");


const controllerButtons =
  document.querySelectorAll(
    ".controller button"
  );



/* =========================
   게임 설정
========================= */

const COLS = 10;

const ROWS = 20;

const BLOCK = 18;


/* 블록 색상 */

const COLORS = {

  I: "#2490ee",

  J: "#2689d9",

  L: "#ffb626",

  O: "#ffc62d",

  S: "#42bf59",

  T: "#bf3edf",

  Z: "#e93548"

};


/* =========================
   테트리스 모양
========================= */

const SHAPES = {

  I: [
    [1, 1, 1, 1]
  ],

  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],

  L: [
    [0, 0, 1],
    [1, 1, 1]
  ],

  O: [
    [1, 1],
    [1, 1]
  ],

  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],

  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],

  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ]

};



/* =========================
   변수
========================= */

let board =
  createBoard();


let player = null;


let queue = [];


let score = 0;


let bestScore =
  Number(
    localStorage.getItem(
      "miniTetrisBest"
    )
  ) || 99;


let playing = false;

let paused = false;

let gameOver = false;


let lastTime = 0;

let dropCounter = 0;

let dropInterval = 650;


let animationFrame;



/* =========================
   보드 생성
========================= */

function createBoard() {

  return Array.from(
    {
      length: ROWS
    },
    () =>
      Array(COLS).fill(null)
  );

}



/* =========================
   블록 생성
========================= */

function randomPiece() {

  const types =
    Object.keys(SHAPES);


  const type =
    types[
      Math.floor(
        Math.random() *
        types.length
      )
    ];


  const matrix =
    SHAPES[type].map(
      row => [...row]
    );


  return {

    type,

    matrix,

    color:
      COLORS[type],

    x:
      Math.floor(
        COLS / 2
      )
      -
      Math.ceil(
        matrix[0].length / 2
      ),

    y: 0

  };

}



/* =========================
   블록 Queue
========================= */

function createQueue() {

  queue = [];


  for (
    let i = 0;
    i < 8;
    i++
  ) {

    queue.push(
      randomPiece()
    );

  }

}



function nextPlayer() {

  player =
    queue.shift();


  queue.push(
    randomPiece()
  );


  player.x =
    Math.floor(
      COLS / 2
    )
    -
    Math.ceil(
      player.matrix[0].length / 2
    );


  player.y = 0;


  drawPreview();


  if (
    collision(
      player,
      0,
      0
    )
  ) {

    finishGame();

  }

}



/* =========================
   충돌
========================= */

function collision(
  piece,
  moveX,
  moveY,
  matrix = piece.matrix
) {

  for (
    let y = 0;
    y < matrix.length;
    y++
  ) {

    for (
      let x = 0;
      x < matrix[y].length;
      x++
    ) {

      if (
        matrix[y][x] === 0
      ) {

        continue;

      }


      const newX =
        piece.x
        +
        x
        +
        moveX;


      const newY =
        piece.y
        +
        y
        +
        moveY;


      if (
        newX < 0
        ||
        newX >= COLS
        ||
        newY >= ROWS
      ) {

        return true;

      }


      if (
        newY >= 0
        &&
        board[newY][newX]
      ) {

        return true;

      }

    }

  }


  return false;

}



/* =========================
   블록 고정
========================= */

function merge() {

  player.matrix.forEach(
    (row, y) => {

      row.forEach(
        (value, x) => {

          if (!value) {
            return;
          }


          const boardY =
            player.y + y;


          const boardX =
            player.x + x;


          if (
            boardY >= 0
          ) {

            board[boardY][boardX]
              =
              player.color;

          }

        }
      );

    }
  );


  clearLines();

  nextPlayer();

}



/* =========================
   줄 제거
========================= */

function clearLines() {

  let lineCount = 0;


  for (
    let y =
      ROWS - 1;

    y >= 0;

    y--
  ) {

    if (
      board[y].every(
        cell =>
          cell !== null
      )
    ) {

      board.splice(
        y,
        1
      );


      board.unshift(
        Array(COLS).fill(null)
      );


      lineCount++;

      y++;

    }

  }


  if (
    lineCount > 0
  ) {

    const pointTable =
      [
        0,
        10,
        30,
        60,
        100
      ];


    score +=
      pointTable[lineCount];


    updateScore();

  }

}



/* =========================
   점수
========================= */

function updateScore() {

  scoreElement.textContent =
    score;


  if (
    score >
    bestScore
  ) {

    bestScore =
      score;


    localStorage.setItem(
      "miniTetrisBest",
      bestScore
    );

  }


  bestScoreElement.textContent =
    bestScore;

}



/* =========================
   블록 이동
========================= */

function move(
  x,
  y
) {

  if (
    !playing
    ||
    paused
    ||
    gameOver
  ) {

    return;

  }


  if (
    !collision(
      player,
      x,
      y
    )
  ) {

    player.x += x;

    player.y += y;

  }

}



/* =========================
   아래 이동
========================= */

function drop() {

  if (
    !playing
    ||
    paused
    ||
    gameOver
  ) {

    return;

  }


  if (
    !collision(
      player,
      0,
      1
    )
  ) {

    player.y++;

  }

  else {

    merge();

  }


  dropCounter = 0;

}



/* =========================
   DROP
========================= */

function hardDrop() {

  if (
    !playing
    ||
    paused
    ||
    gameOver
  ) {

    return;

  }


  while (
    !collision(
      player,
      0,
      1
    )
  ) {

    player.y++;

  }


  merge();


  dropCounter = 0;

}



/* =========================
   회전
========================= */

function rotate() {

  if (
    !playing
    ||
    paused
    ||
    gameOver
  ) {

    return;

  }


  const oldMatrix =
    player.matrix;


  const rotated =
    oldMatrix[0]
      .map(
        (_, index) =>
          oldMatrix
            .map(
              row =>
                row[index]
            )
            .reverse()
      );


  const offsets =
    [
      0,
      -1,
      1,
      -2,
      2
    ];


  for (
    const offset
    of offsets
  ) {

    if (
      !collision(
        player,
        offset,
        0,
        rotated
      )
    ) {

      player.matrix =
        rotated;

      player.x +=
        offset;

      return;

    }

  }

}



/* =========================
   배경 그리기
========================= */

function drawBackground() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  ctx.fillStyle =
    "#062f53";


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

}



/* =========================
   작은 사각형 블록
========================= */

function drawSquare(
  context,
  px,
  py,
  color,
  size = BLOCK
) {

  const padding = 1;


  const x =
    px + padding;


  const y =
    py + padding;


  const width =
    size - 2;


  /* 바탕 */

  context.fillStyle =
    color;


  context.fillRect(
    x,
    y,
    width,
    width
  );


  /* 상단 하이라이트 */

  context.fillStyle =
    "rgba(255,255,255,0.30)";


  context.fillRect(
    x + 2,
    y + 2,
    width - 4,
    3
  );


  /* 왼쪽 */

  context.fillStyle =
    "rgba(255,255,255,0.12)";


  context.fillRect(
    x + 1,
    y + 3,
    2,
    width - 5
  );


  /* 아래 그림자 */

  context.fillStyle =
    "rgba(0,0,0,0.22)";


  context.fillRect(
    x + 2,
    y + width - 4,
    width - 4,
    3
  );


  /* 오른쪽 그림자 */

  context.fillRect(
    x + width - 4,
    y + 3,
    3,
    width - 5
  );

}



/* =========================
   보드 그리기
========================= */

function drawBoard() {

  board.forEach(
    (row, y) => {

      row.forEach(
        (color, x) => {

          if (!color) {
            return;
          }


          drawSquare(
            ctx,

            x * BLOCK,

            y * BLOCK,

            color
          );

        }
      );

    }
  );

}



/* =========================
   현재 블록
========================= */

function drawPlayer() {

  if (!player) {
    return;
  }


  player.matrix.forEach(
    (row, y) => {

      row.forEach(
        (value, x) => {

          if (!value) {
            return;
          }


          drawSquare(
            ctx,

            (
              player.x + x
            )
            *
            BLOCK,

            (
              player.y + y
            )
            *
            BLOCK,

            player.color
          );

        }
      );

    }
  );

}



/* =========================
   오른쪽 블록 Queue
========================= */

function drawPreview() {

  previewCtx.clearRect(
    0,
    0,
    previewCanvas.width,
    previewCanvas.height
  );


  const size = 6;


  queue
    .slice(
      0,
      8
    )
    .forEach(
      (
        piece,
        index
      ) => {

        const matrix =
          piece.matrix;


        const maxWidth =
          Math.max(
            ...matrix.map(
              row =>
                row.length
            )
          )
          *
          size;


        const startX =
          (
            previewCanvas.width
            -
            maxWidth
          )
          /
          2;


        const startY =
          index * 42;


        matrix.forEach(
          (row, y) => {

            row.forEach(
              (
                value,
                x
              ) => {

                if (!value) {
                  return;
                }


                drawPreviewSquare(
                  startX
                  +
                  x * size,

                  startY
                  +
                  y * size,

                  piece.color,

                  size
                );

              }
            );

          }
        );

      }
    );

}



/* 작은 Queue 블록 */

function drawPreviewSquare(
  x,
  y,
  color,
  size
) {

  previewCtx.fillStyle =
    color;


  previewCtx.fillRect(
    x,
    y,
    size - 1,
    size - 1
  );


  previewCtx.fillStyle =
    "rgba(255,255,255,0.32)";


  previewCtx.fillRect(
    x + 1,
    y + 1,
    size - 3,
    1
  );


  previewCtx.fillStyle =
    "rgba(0,0,0,0.24)";


  previewCtx.fillRect(
    x + 1,
    y + size - 2,
    size - 2,
    1
  );

}



/* =========================
   전체 그리기
========================= */

function draw() {

  drawBackground();

  drawBoard();

  drawPlayer();

}



/* =========================
   시작
========================= */

function startGame() {

  cancelAnimationFrame(
    animationFrame
  );


  board =
    createBoard();


  score = 0;


  playing = true;

  paused = false;

  gameOver = false;


  dropCounter = 0;

  dropInterval = 650;


  createQueue();

  nextPlayer();


  overlay.classList.add(
    "hide"
  );


  pauseBtn.textContent =
    "Ⅱ";


  updateScore();


  lastTime =
    performance.now();


  animationFrame =
    requestAnimationFrame(
      update
    );

}



/* =========================
   일시정지
========================= */

function togglePause() {

  if (
    !playing
    ||
    gameOver
  ) {

    return;

  }


  paused =
    !paused;


  if (paused) {

    pauseBtn.textContent =
      "▶";


    overlayTitle.textContent =
      "PAUSE";


    overlayText.innerHTML =
      "게임이 일시정지되었습니다.";


    startBtn.textContent =
      "CONTINUE";


    overlay.classList.remove(
      "hide"
    );

  }

  else {

    pauseBtn.textContent =
      "Ⅱ";


    overlay.classList.add(
      "hide"
    );


    lastTime =
      performance.now();

  }

}



/* =========================
   게임 종료
========================= */

function finishGame() {

  gameOver = true;

  playing = false;


  cancelAnimationFrame(
    animationFrame
  );


  updateScore();


  overlayTitle.textContent =
    "GAME OVER";


  overlayText.innerHTML =
    `SCORE<br><strong>${score}</strong>`;


  startBtn.textContent =
    "RESTART";


  overlay.classList.remove(
    "hide"
  );

}



/* =========================
   Loop
========================= */

function update(
  time = 0
) {

  const delta =
    time - lastTime;


  lastTime =
    time;


  if (
    !paused
    &&
    !gameOver
  ) {

    dropCounter +=
      delta;


    if (
      dropCounter >
      dropInterval
    ) {

      drop();

    }


    draw();

  }


  if (
    !gameOver
  ) {

    animationFrame =
      requestAnimationFrame(
        update
      );

  }

}



/* =========================
   키보드
========================= */

document.addEventListener(
  "keydown",
  function(event) {

    switch (
      event.key
    ) {

      case "ArrowLeft":

        event.preventDefault();

        move(
          -1,
          0
        );

        break;


      case "ArrowRight":

        event.preventDefault();

        move(
          1,
          0
        );

        break;


      case "ArrowDown":

        event.preventDefault();

        drop();

        break;


      case "ArrowUp":

        event.preventDefault();

        rotate();

        break;


      case " ":

        event.preventDefault();

        hardDrop();

        break;


      case "p":

      case "P":

        togglePause();

        break;

    }


    draw();

  }
);



/* =========================
   버튼
========================= */

startBtn.addEventListener(
  "click",
  function() {

    if (
      paused
      &&
      !gameOver
    ) {

      togglePause();

    }

    else {

      startGame();

    }

  }
);



pauseBtn.addEventListener(
  "click",
  togglePause
);



/* =========================
   모바일 조작
========================= */

controllerButtons.forEach(
  button => {

    button.addEventListener(
      "pointerdown",
      function(event) {

        event.preventDefault();


        const control =
          button.dataset.control;


        if (
          control === "left"
        ) {

          move(
            -1,
            0
          );

        }


        if (
          control === "right"
        ) {

          move(
            1,
            0
          );

        }


        if (
          control === "down"
        ) {

          drop();

        }


        if (
          control === "rotate"
        ) {

          rotate();

        }


        if (
          control === "drop"
        ) {

          hardDrop();

        }


        draw();

      }
    );

  }
);



/* =========================
   초기 화면
========================= */

bestScoreElement.textContent =
  bestScore;


drawBackground();