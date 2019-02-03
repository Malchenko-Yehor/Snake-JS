import { Point } from ".";
import { level1, level2, level3, level4, level5 } from "./levels";

export class GameController {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scoreElement: HTMLElement;
  private scoreArchive: number[];
  private snake: Point[];
  private chosenLevel: Point[];
  private levels;
  private dx: number;
  private dy: number;
  private changingDirection: boolean;
  private foodX: number;
  private foodY: number;
  private powerupX: number;
  private powerupY: number;
  private powerupDuartion: number;
  private powerupStrength: number;
  private canWalkThroughWalls: boolean;
  private foodCollected: number;
  private gameSpeed: number;
  private speedEfector: number;
  private levelScoreModificator: number;

  constructor() {
    this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.changingDirection = false;
    this.levels = {
      level1: level1,
      level2: level2,
      level3: level3,
      level4: level4,
      level5: level5,
    };

    this.scoreElement = document.getElementById('score');
    this.scoreArchive = [];

    document.addEventListener("keydown", this.changeDirection);
  }

  private clearCanvas(): void {
    const BORDER_COLOUR = '#000';
    const BACKGROUND_COLOUR = "#fff";


    this.ctx.fillStyle = BACKGROUND_COLOUR;
    this.ctx.strokeStyle = BORDER_COLOUR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawLevel();
  }

  private createSnake(): void {
    this.snake = [
      { x: 10, y: 60 },
      { x: 10, y: 50 },
      { x: 10, y: 40 },
      { x: 10, y: 30 },
      { x: 10, y: 20 },
      { x: 10, y: 10 },
    ];
  }

  private drawSnake(): void {
    this.snake.forEach(snakePart => {
      this.ctx.fillStyle = 'lightblue';
      this.ctx.strokeStyle = 'darkblue';

      if (this.canWalkThroughWalls) {
        this.ctx.fillStyle = 'purple';
      }

      this.ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
      this.ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
    });
  }

  private advanceSnake(): void {
    let head: Point;
    const sceneWidth = this.canvas.width;
    const sceneHeight = this.canvas.height;
    const didEatFood = this.snake[0].x === this.foodX && this.snake[0].y === this.foodY;
    const didEatPowerup = this.snake[0].x === this.powerupX && this.snake[0].y === this.powerupY;

    if (this.snake[0].x + this.dx > sceneWidth - 2) {
      head = { x: 0, y: this.snake[0].y + this.dy }
    } else if (this.snake[0].x + this.dx < 0) {
      head = { x: sceneWidth, y: this.snake[0].y + this.dy }
    } else if (this.snake[0].y + this.dy > sceneHeight - 2) {
      head = { x: this.snake[0].x + this.dx, y: 0 }
    } else if (this.snake[0].y + this.dy < 0) {
      head = { x: this.snake[0].x + this.dx, y: sceneHeight };
    } else {
      head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
    }


    this.snake.unshift(head);

    if (didEatFood) {
      this.createFood();
      this.scoreUpdate();

      this.foodCollected++;

      if (this.foodCollected === 3) {
        this.createPowerUp();
        this.foodCollected = 0;
      }
    } else this.snake.pop();

    if (didEatPowerup) {
      this.applyPowerup();
      this.powerupX = 1000;
      this.powerupY = 1000;
    }
  }

  private applyPowerup(): void {
    const powerups = [
      this.allowWalkThroughWalls,
      this.addBonusPoints,
      this.makeSnakeLonger,
      this.makeSnakeShorter,
      this.speedUp,
      this.slowDown
    ];

    powerups[Math.floor(Math.random() * powerups.length)]();
  }

  // Powerups
  private allowWalkThroughWalls = () => {
    this.canWalkThroughWalls = true;

    console.log('allowWalkThroughWalls');

    setTimeout(() => {
      this.canWalkThroughWalls = false;
    }, this.powerupDuartion * 1000);
  }

  private addBonusPoints = () => {
    const score = +this.scoreElement.innerText;

    console.log('addBonusPoints');

    this.scoreElement.innerHTML = (Math.floor(score + ((10 * this.levelScoreModificator * 100) / this.gameSpeed) * this.powerupStrength)).toString();
  }

  private makeSnakeShorter = () => {
    console.log('makeSnakeShorter');

    for (let i = 0; i < this.powerupStrength; i++) {
      if (this.snake.length > 1) this.snake.pop();
    }
  }

  private makeSnakeLonger = () => {
    console.log('makeSnakeLonger');

    const xDirection = this.snake[this.snake.length - 1].x - this.snake[this.snake.length - 2].x;
    const yDirection = this.snake[this.snake.length - 1].y - this.snake[this.snake.length - 2].y;
    const lastElement = this.snake[this.snake.length - 1];

    for (let i = 1; i <= this.powerupStrength; i++) {
      this.snake.push({
        x: lastElement.x + xDirection * i,
        y: lastElement.y + yDirection * i
      });
    }
  }

  private speedUp = () => {
    console.log('speedUp')

    this.speedEfector = 0.5;

    setTimeout(() => {
      this.speedEfector = 1;
    }, this.powerupDuartion * 1000);
  }

  private slowDown = () => {
    console.log('slowDown');

    this.speedEfector = 1.5;

    setTimeout(() => {
      this.speedEfector = 1;
    }, this.powerupDuartion * 1000);
  }

  private gameLoop = () => {
    if (this.didGameEnd()) {
      this.scoreArchive.push(+this.scoreElement.innerText);
      (<HTMLButtonElement>document.getElementById('startButton')).disabled = false;
      return;
    };

    setTimeout(() => {
      this.changingDirection = false;

      this.clearCanvas();
      this.drawFood();
      this.drawPowerUp();
      this.advanceSnake();
      this.drawSnake();

      this.gameLoop();
    }, this.gameSpeed * this.speedEfector);
  }

  private changeDirection = (event) => {
    const LEFT_KEY = 37;
    const ALT_LEFT_KEY = 65;
    const RIGHT_KEY = 39;
    const ALT_RIGHT_KEY = 68
    const UP_KEY = 38;
    const ALT_UP_KEY = 87;
    const DOWN_KEY = 40;
    const ALT_DOWN_KEY = 83
    const keyPressed = event.keyCode;
    const goingUp = this.dy === -10;
    const goingDown = this.dy === 10;
    const goingRight = this.dx === 10;
    const goingLeft = this.dx === -10;

    if (this.changingDirection) return;

    this.changingDirection = true;



    if ((keyPressed === LEFT_KEY || keyPressed === ALT_LEFT_KEY) && !goingRight) {
      this.dx = -10;
      this.dy = 0;
    }
    if ((keyPressed === UP_KEY || keyPressed === ALT_UP_KEY) && !goingDown) {
      this.dx = 0;
      this.dy = -10;
    }
    if ((keyPressed === RIGHT_KEY || keyPressed === ALT_RIGHT_KEY) && !goingLeft) {
      this.dx = 10;
      this.dy = 0;
    }
    if ((keyPressed === DOWN_KEY || keyPressed === ALT_DOWN_KEY) && !goingUp) {
      this.dx = 0;
      this.dy = 10;
    }
  }

  private randomTen(min, max): number {
    return Math.round((Math.random() * (max - min) + min) / 10) * 10;
  }

  private createFood(): void {
    this.foodX = this.randomTen(0, this.canvas.width - 10);
    this.foodY = this.randomTen(0, this.canvas.height - 10);

    this.snake.forEach(part => {
      const foodIsOnSnake = part.x == this.foodX && part.y == this.foodY;

      if (foodIsOnSnake)
        this.createFood();
    });

    this.chosenLevel.forEach(part => {
      const foodIsOnObstacle = part.x == this.foodX && part.y == this.foodY;

      if (foodIsOnObstacle)
        this.createFood();
    })
  }

  private drawFood(): void {
    this.ctx.fillStyle = 'red';
    this.ctx.strokeStyle = 'darkred';
    this.ctx.fillRect(this.foodX, this.foodY, 10, 10);
    this.ctx.strokeRect(this.foodX, this.foodY, 10, 10);
  }

  private createPowerUp(): void {
    this.powerupX = this.randomTen(0, this.canvas.width - 10);
    this.powerupY = this.randomTen(0, this.canvas.height - 10);

    this.snake.forEach(part => {
      const powerupIsOnSnake = part.x == this.powerupX && part.y == this.powerupY;

      if (powerupIsOnSnake)
        this.createPowerUp();
    });

    this.chosenLevel.forEach(part => {
      const powerupIsOnObstacle = part.x == this.powerupX && part.y == this.powerupY;

      if (powerupIsOnObstacle)
        this.createPowerUp();
    })
  }

  private drawPowerUp(): void {
    this.ctx.fillStyle = 'lightgreen';
    this.ctx.strokeStyle = 'darkgreen';
    this.ctx.fillRect(this.powerupX, this.powerupY, 10, 10);
    this.ctx.strokeRect(this.powerupX, this.powerupY, 10, 10);
  }

  private didGameEnd(): boolean {
    for (let i = 1; i < this.snake.length; i++) {
      const didCollide = this.snake[i].x === this.snake[0].x &&
        this.snake[i].y === this.snake[0].y;

      if (didCollide) return true
    }

    return this.chosenLevel.some(part => {
      return this.snake[0].x === part.x &&
        this.snake[0].y === part.y && !this.canWalkThroughWalls;

    })
  }

  private drawLevel(): void {
    this.chosenLevel.forEach(part => {
      this.ctx.fillStyle = 'grey';
      this.ctx.strokeStyle = 'black';
      this.ctx.fillRect(part.x, part.y, 10, 10);
      this.ctx.strokeRect(part.x, part.y, 10, 10);
    });
  }

  private scoreUpdate(): void {
    const score = +this.scoreElement.innerText;

    this.scoreElement.innerHTML = (Math.floor(score + (10 * this.levelScoreModificator * 100) / this.gameSpeed)).toString();
  }

  private setLevelScoreModificator(levelNumber: string): void {
    if (levelNumber === '1') this.levelScoreModificator = 1;
    if (levelNumber === '2') this.levelScoreModificator = 1.5;
    if (levelNumber === '3') this.levelScoreModificator = 2;
    if (levelNumber === '4') this.levelScoreModificator = 2.5;
    if (levelNumber === '5') this.levelScoreModificator = 3;
  }

  private collectOptions(): void {
    const levelSelect = document.getElementById('levelSelect') as HTMLSelectElement;
    const speedSelect = document.getElementById('speedSelect') as HTMLSelectElement;
    const powerupDuartionSelect = document.getElementById('powerupDuration') as HTMLSelectElement;
    const powerupStrengthSelect = document.getElementById('powerupStrength') as HTMLSelectElement;

    this.gameSpeed = parseInt(speedSelect.value);
    this.chosenLevel = this.levels[`level${levelSelect.value}`];
    this.powerupDuartion = +powerupDuartionSelect.value;
    this.powerupStrength = +powerupStrengthSelect.value;


    this.setLevelScoreModificator(levelSelect.value);
  }

  startGame(): void {
    this.dx = 0;
    this.dy = 10;
    this.powerupX = 1000;
    this.powerupY = 1000;
    this.speedEfector = 1;
    this.scoreElement.innerHTML = '0';
    this.foodCollected = 0;
    this.canWalkThroughWalls = false;

    this.collectOptions();
    this.createSnake();
    this.createFood();
    this.clearCanvas();
    this.gameLoop();
  }

  displayScoreTable(): void {
    const sortedScore = this.scoreArchive.sort((a, b) => b - a);

    alert(`
      SCORE TABLE:
      1: ${sortedScore[0] ? sortedScore[0] : '-'}
      2: ${sortedScore[1] ? sortedScore[1] : '-'}
      3: ${sortedScore[2] ? sortedScore[2] : '-'}
      4: ${sortedScore[3] ? sortedScore[3] : '-'}
      5: ${sortedScore[4] ? sortedScore[4] : '-'}
    `);
  }
}