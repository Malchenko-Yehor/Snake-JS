import './styles/main.scss';
import { GameController } from './game-controller';

const gameController = new GameController();

document.getElementById('startButton').addEventListener('mousedown', () => {
  gameController.startGame();
  (<HTMLButtonElement>document.getElementById('startButton')).disabled = true;
});

document.getElementById('displayScore').addEventListener('mousedown', () => {
  gameController.displayScoreTable();
});

