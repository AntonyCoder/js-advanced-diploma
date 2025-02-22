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
import GameState from "./GameState";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.boardSize = 8;
    this.positions = [];
    this.gameState = new GameState();
    this.selectedChar = null;
    this.hoveredChar = null;
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

  // Действия при наведении и уводе с клетки
  doHoverActions() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  //Действия при клике на клетку
  doClickActions() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  //Действия при нажатии на клетку
  onCellClick(index) {
    this.showBorder(index); //Отображение обводки 
    this.moveChar(index); //Передвижение персонажа
    this.attackEnemy(index); // Атака противника
  }

  // Отображение обводки игрока
  showBorder(index) {
    if (this.isPlayerChar) {
      this.selectedChar = this.hoveredChar;
      this.gamePlay.selectCell(index);

      for (let pos of this.positions) {
        if (pos.position !== index) {
          this.gamePlay.deselectCell(pos.position);
        }
      }
    } else if (this.isEnemyChar && !this.allowedAttackCells) {
      GamePlay.showError('Это персонаж противника!');
    }
  }

  //Движение игрока
  moveChar(index) {
    if (this.selectedChar) {
      const allowedMoves = this.findMovementRadius(this.selectedChar.position, this.selectedChar.character.moveRadius)
      if (allowedMoves.has(index) && !this.hoveredChar) {
        this.gamePlay.deselectCell(this.selectedChar.position)
        this.selectedChar.position = index;
        this.gamePlay.redrawPositions(this.positions);
        this.gamePlay.selectCell(this.selectedChar.position);
        this.gameState.switchTurn();
      }
    }
  }

  //Атака противника
  attackEnemy(index) {
    if (this.selectedChar && this.isEnemyChar && this.allowedAttackCells.has(index)) {
      const damage = Math.max(this.selectedChar.character.attack - this.hoveredChar.character.defence, this.selectedChar.character.attack * 0.1)
      this.hoveredChar.character.health -= damage;
      const result = this.gamePlay.redrawPositions(this.positions);
      this.gamePlay.showDamage(index, damage).then(result);
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
    this.hoveredChar = this.positions.find((pos) => pos.position === index); // курсор указывает на персонажа

    this.allowedMovesCells = this.findMovementRadius(this.selectedChar?.position, this.selectedChar?.character.moveRadius) // доступные клетки для передвижения
    this.allowedAttackCells = this.findAttackRadius(this.selectedChar?.position, this.selectedChar?.character.attackRadius)// доступные клетки для атаки

    this.isPlayerChar = ['bowman', 'swordsman', 'magician'].includes(this.hoveredChar?.character.type); //Наведение на своего игрока
    this.isEnemyChar = ['daemon', 'undead', 'vampire'].includes(this.hoveredChar?.character.type); //Наведение на противника
    // показ подсказки
    if (this.hoveredChar) {
      const message = this.showTooltip(this.hoveredChar);
      this.gamePlay.showCellTooltip(message, index);


      //изменение курсора и появление красной обводки
      if (this.isPlayerChar) {
        if (this.selectedChar && this.selectedChar !== this.hoveredChar) {
          this.gamePlay.setCursor(cursors.pointer);
        } else {
          this.gamePlay.setCursor(cursors.auto);
        }
      } else if (this.isEnemyChar) {
        if (this.allowedAttackCells.has(index)) {
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
      //Появление зеленой обводки
    } else if (this.selectedChar) {
      if (this.allowedMovesCells.has(index)) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
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
    const allowedAttack = new Set();
    const { boardSize } = this
    const col = position % boardSize;
    const row = Math.floor(position / boardSize);

    for (let r = -attackRadius; r <= attackRadius; r++) {
      for (let c = -attackRadius; c <= attackRadius; c++) {
        const newRow = row + r;
        const newCol = col + c;
        const newPos = newRow * boardSize + newCol;

        if(
          newRow >0 && newRow <= boardSize &&
          newCol > 0 && newCol <= boardSize &&
          Math.abs(r)+ Math.abs(c)<= boardSize
        ){
          allowedAttack.add(newPos);
        }

      }
    }
    return allowedAttack;
  }

  //Покидание ячейки с игроком
  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
    this.hoveredChar = null;

    if (this.selectedChar?.position !== index) {
      this.gamePlay.deselectCell(index);
    }
  }

  //Запуск игры
  init() {
    this.gamePlay.drawUi(themes.prairie); // отрисовка поля
    this.generatePositions(); // генерация позиции персонажей
    this.gamePlay.redrawPositions(this.positions); // отрисовка персонажей
    this.doHoverActions(); // вывод информации
    this.doClickActions();
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }
}
