import { useEffect, useState } from "react";
import { ROW, COL, Direction } from "../lib/constants";

import "./Board.css";
import { randomIntFromInterval } from "../lib/utils";

class LinkedListNode {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.next = null;
  }
}

class LinkedList {
  constructor(row, col, direction) {
    this.head = new LinkedListNode(row, col);
    this.tail = this.head;
    this.direction = direction;
  }
}

function Board2() {
  const [gameState, setGameState] = useState("Start");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState(createBoard(ROW, COL));
  const [diamond, setDiamond] = useState(() => {
    const MAX_VALUE = ROW * COL;
    return randomIntFromInterval(1, MAX_VALUE);
  });
  const [position, setPosition] = useState({
    row: 9,
    column: 0,
    cell: board[9][0],
  });
  const [snakes, setSnakes] = useState([]);
  const [snakeCells, setSnakeCells] = useState(new Map());

  const generateSnake = () => {
    const cells = snakeCells;
    let row = Math.floor(Math.random() * ROW);
    let col = Math.floor(Math.random() * COL);
    let cell = board[row][col];
    cells.set(cell, cells[cell] || 0 + 1);
    const length = randomIntFromInterval(1, 5);
    const direction = getRandomDirection(Direction.RIGHT);
    const snake = new LinkedList(row, col, direction);
    let current = snake.head;
    for (let i = 1; i < length; i++) {
      if (row < ROW - 1) {
        row++;
        current.next = new LinkedListNode(row, col);
        current = current.next;
        cell = board[row][col];
        cells.set(cell, cells[cell] || 0 + 1);
      } else {
        col++;
        current.next = new LinkedListNode(row, col);
        current = current.next;
        cell = board[row][col];
        cells.set(cell, cells[cell] || 0 + 1);
      }
    }
    setSnakeCells(cells);
    setSnakes([...snakes, snake]);
  };

  const handleMouseHover = (row, col) => {
    if (gameState === "over") return;
    if (board[row][col] === diamond) {
      setLevel((prevLevel) => prevLevel + 1);
      generateSnake();
      setScore((prevScore) => prevScore + 10);
      let newDiamond = randomIntFromInterval(1, ROW * COL);
      while (snakeCells.has(newDiamond)) {
        newDiamond = randomIntFromInterval(1, ROW * COL);
      }
      setDiamond(newDiamond);
    }
    if (snakeCells.has(board[row][col])) {
      setScore((prevScore) => prevScore - 10);
      if (score <= 0) {
        setGameState("over");
        setSnakeCells(() => new Map());
        setScore(0);
        return;
      }
    }
    setPosition({
      row,
      column: col,
      cell: board[row][col],
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { key } = e;
      // console.log(key);
      if (key === " ") {
        if (gameState === "over" || gameState === "Start") {
          setGameState("running");
          setSnakeCells(() => new Map());
          generateSnake();
          setScore(0);
          setLevel(1);
          setPosition({
            row: 9,
            column: 0,
            cell: board[9][0],
          });
          setDiamond(randomIntFromInterval(1, ROW * COL));
        } else {
          setSnakeCells(() => new Map());
          setGameState("over");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState, board]);

  if (gameState === "Start") {
    return (
      <div className="game-over">
        <h1>Snake Game</h1>
        <h3>Press Space to Start</h3>
      </div>
    );
  }

  if (gameState === "over") {
    return (
      <div className="game-over">
        <h1>Game Over</h1>
        <h2>Score: {score}</h2>
        <h2>Level: {level}</h2>
        <h3>Press Space to Restart</h3>
      </div>
    );
  }

  return (
    <>
      <div className="score">
        <h1>Score: {score}</h1>
        <h1>Level: {level}</h1>
      </div>
      <div className="board">
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="row">
            {row.map((cellValue, cellIdx) => {
              return (
                <div
                  key={cellIdx}
                  className={`cell ${
                    position.cell === cellValue ? "cell-green" : ""
                  } ${diamond === cellValue ? "cell-blue" : ""}
                    ${snakeCells.has(cellValue) ? "cell-red" : ""}
                  `}
                  onMouseEnter={() => handleMouseHover(rowIdx, cellIdx)}
                ></div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

const createBoard = (BOARD_ROW, BOARD_COL) => {
  let counter = 1;
  const board = [];
  for (let row = 0; row < BOARD_ROW; row++) {
    const currentRow = [];
    for (let col = 0; col < BOARD_COL; col++) {
      currentRow.push(counter++);
    }
    board.push(currentRow);
  }
  return board;
};

const getRandomDirection = (currentDirection) => {
  const directions = Object.values(Direction);
  const oppositeDirection = getOppositeDirection(currentDirection);
  const validDirections = directions.filter((dir) => dir !== oppositeDirection);
  const changeDirection = Math.random() < 0.3;
  if (changeDirection) {
    const randomIndex = Math.floor(Math.random() * validDirections.length);
    return validDirections[randomIndex];
  }
  return currentDirection;
};

const getOppositeDirection = (direction) => {
  if (direction === Direction.UP) return Direction.DOWN;
  if (direction === Direction.RIGHT) return Direction.LEFT;
  if (direction === Direction.DOWN) return Direction.UP;
  if (direction === Direction.LEFT) return Direction.RIGHT;
};

export default Board2;
