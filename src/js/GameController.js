import themes from "./themes";
import PositionedCharacter from "./PositionedCharacter";
import Bowman from "./characters/Bowman";
import Daemon from "./characters/Daemon";
import Magician from "./characters/Magician";
import Swordsman from "./characters/Swordsman";
import Undead from "./characters/Undead";
import Vampire from "./characters/Vampire";
import { generateTeam } from "./generators";
import GamePlay from "./GamePlay";
import cursors from "./cursors";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.boardSize = 8;
    this.positions = [];
  }

  //Генерация позиций игроков
  generatePositions() {
    const playerTypes = [Bowman, Swordsman, Magician];
    const enemyTypes = [Daemon, Undead, Vampire];

    const playerTeam = generateTeam(playerTypes, 3, 3);
    const enemyTeam = generateTeam(enemyTypes, 3, 3);

    const occupiedPositions = new Set();

    function getPlayerPosition() {
      let pos;
      do {
        const row = Math.floor(Math.random() * 8);
        const col = Math.floor(Math.random() * 2);
        pos = row * 8 + col;
      } while (occupiedPositions.has(pos));
      occupiedPositions.add(pos);
      return pos;
    }

    function getEnemyPosition() {
      let pos;
      do {
        const row = Math.floor(Math.random() * 8);
        const col = 6 + Math.floor(Math.random() * 2);
        pos = row * 8 + col;
      } while (occupiedPositions.has(pos));
      occupiedPositions.add(pos);
      return pos;
    }

    playerTeam.characters.forEach((char) => {
      const position = getPlayerPosition();
      this.positions.push(new PositionedCharacter(char, position));
    });

    enemyTeam.characters.forEach((char) => {
      const position = getEnemyPosition();
      this.positions.push(new PositionedCharacter(char, position));
    });
  }

  // отображение информации об игроке
  tooltipStatus() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  //отображение обводки игрока
  showBorder() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  //Логика пояления обводки
  onCellClick(index) {
    const characterPlayer = this.positions.find((pos) => pos.position === index);
    const playerTeam = ['bowman', 'swordsman', 'magician'];

    if (playerTeam.includes(characterPlayer.character.type)) {
      this.selectedChar = characterPlayer;
      this.gamePlay.selectCell(index);
      for (let pos of this.positions) {
        if (pos.position !== index) {
          this.gamePlay.deselectCell(pos.position);
        }
      }
    } else {
      GamePlay.showError('Это персонаж противника!');
    }
  }

  //Логика формирования информации об игроке
  showTooltip(character) {
    const { level, attack, defence, health } = character.character;
    const message = `🎖${level} ⚔${attack} 🛡${defence} ❤${health}`;
    return message;
  }

  // Наведение на ячейку с игроком
  onCellEnter(index) {
    const hoveredChar = this.positions.find((pos) => pos.position === index);
    const selectedChar = this.positions.find((pos) =>
      this.gamePlay.cells?.[pos.position]?.classList.contains('selected-yellow')
    );

    if (hoveredChar) {
      const message = this.showTooltip(hoveredChar);
      this.gamePlay.showCellTooltip(message, index);

      const isPlayerChar = ['bowman', 'swordsman', 'magician'].includes(hoveredChar.character.type);

      if (isPlayerChar) {
        if (selectedChar && selectedChar !== hoveredChar) {
          this.gamePlay.setCursor(cursors.pointer);
        } else {
          this.gamePlay.setCursor(cursors.auto);
        }
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    } else if (selectedChar) {
      const allowedMoves = this.findMovementRadius(selectedChar.position, selectedChar.character.moveRadius)
      const allowedAttack = this.findAttackRadius(selectedChar.position, selectedChar.character.attackRadius)

      if (allowedMoves.has(index)) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
      } else if (allowedAttack.has(index) && hoveredChar) {
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor(cursors.crosshair);
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  createMessage() {

  }

  // Определение радиуса передвижение
  findMovementRadius(position, distance) {
    const allowedMoves = new Set();
    const { boardSize } = this
    const col = position % boardSize;
    const row = Math.floor(position / boardSize);

    for (let i = 1; i <= distance; i++) {
      //Определяем доступные ходы по горизонтали
      if (col + i < boardSize) allowedMoves.add(position + i)
      if (col - i >= 0) allowedMoves.add(position - i);

      //Определяем доступные ходы по вертикали
      if (row + i < boardSize) allowedMoves.add(position + i * boardSize);
      if (row - i >= 0) allowedMoves.add(position - i * boardSize);

      //Определяем доступные ходы по диагонали
      if (col + i < boardSize && row + i < boardSize) allowedMoves.add(position + i * (boardSize + 1))
      if (col - i >= 0 && row - i >= 0) allowedMoves.add(position - i * (boardSize + 1))
      if (col + i < boardSize && row - i >= 0) allowedMoves.add(position - i * (boardSize - 1))
      if (col - i >= 0 && row + i < boardSize) allowedMoves.add(position + i * (boardSize - 1))
    }
    return allowedMoves;
  }

  //Определение радиуса атаки
  findAttackRadius(position, attackRadius) {
    return this.findMovementRadius(position, attackRadius)
  }

  //Покидание ячейки с игроком
  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);

    if (this.selectedChar?.position !== index) {
      this.gamePlay.deselectCell(index);
    }
  }

  //Запуск игры
  init() {
    this.gamePlay.drawUi(themes.prairie); // отрисовка поля
    this.generatePositions(); // генерация позиции персонажей
    this.gamePlay.redrawPositions(this.positions); // отрисовка персонажей
    this.tooltipStatus(); // вывод информации
    this.showBorder();
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }
}
