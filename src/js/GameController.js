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
    this.currentThemeIndex = 0;
    this.themes = [themes.prairie, themes.desert, themes.arctic, themes.mountain];
    this.playerTeamSize = 3;  // Начальный размер команды игрока
    this.enemyTeamSize = 3;   // Начальный размер команды противника
    this.isGameOver = false;
    this.currentLevel = 1;
  }

  //Генерация позиций игроков
  generatePositions() {
    const playerTypes = [Bowman, Swordsman, Magician];
    const enemyTypes = [Daemon, Undead, Vampire];

    const playerTeam = generateTeam(playerTypes, this.playerTeamSize, this.playerTeamSize);
    const enemyTeam = generateTeam(enemyTypes, this.enemyTeamSize, this.enemyTeamSize);

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
    if (this.isGameOver) return;
    this.showBorder(index); //Отображение обводки 
    this.moveChar(index); //Передвижение персонажа
    this.attackPlayer(index); // Атака противника
    this.attackEnemy(); // Противник атакует нас
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
    } else if (this.isEnemyChar && !this.selectedChar) {
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

  //Мы атакуем противника
  attackPlayer(index) {
    if (this.selectedChar && this.isEnemyChar && this.allowedAttackCells.has(index)) {
      this.attack(this.selectedChar, this.hoveredChar);
    }
  }

  //Вычисление атаки и отображение урона
  attack(attacker, target) {
    if (!attacker || !target) {
      return;
    }

    const damage = Math.max(attacker.character.attack - target.character.defence, attacker.character.attack * 0.1)
    target.character.health -= damage;
    this.gamePlay.showDamage(target.position, damage).then(() => {
      this.positions = this.positions.filter(pos => pos.character.health > 0); // удаляем игроков у которых здоровье = 0

      if (this.selectedChar && this.selectedChar.character.health <= 0) {
        this.gamePlay.deselectCell(this.selectedChar.position);
        this.selectedChar = null;
      }

      this.gamePlay.redrawPositions(this.positions);
      this.checkEndGame();
      if (this.checkGameOver()) return
    });

    this.gameState.switchTurn();
  }

  //Противник атакует нас
  attackEnemy() {
    this.enemyChars = this.positions.filter(pos =>
      ['daemon', 'undead', 'vampire'].includes(pos.character?.type));

    this.playerChars = this.positions.filter(pos =>
      ['bowman', 'swordsman', 'magician'].includes(pos.character?.type));
    if (this.gameState.currentTurn === 'computer') {

      let actionDone = false;

      for (const enemy of this.enemyChars) {
        for (const player of this.playerChars) {

          const attackRadius = this.findAttackRadius(enemy.position, enemy.character.attackRadius);

          if (attackRadius.has(player.position)) {
            this.attack(enemy, player);
            actionDone = true;
            break;
          }
        }
        if (actionDone) break;
      }
    }
  }

  // Проверка окончания раунда игры
  checkEndGame() {
    if (this.checkGameOver()) return;

    this.enemyChars = this.positions.filter(pos =>
      ['daemon', 'undead', 'vampire'].includes(pos.character?.type)
    )
    if (!this.enemyChars.length) {
      this.selectedChar = null;
      this.nextLevel();
      this.levelUp();
    }
  }

  // Повышение уровня 
  levelUp() {
    this.positions.forEach((item) => {
      item.character.level += 1;
      item.character.health = Math.min(100, item.character.health + 80)
      item.character.defence = Math.max(item.character.defence, item.character.defence * (80 + item.character.health) / 100);
      item.character.attack = Math.max(item.character.attack, item.character.attack * (80 + item.character.health) / 100);

    })
    this.gamePlay.redrawPositions(this.positions)
  }

  // Следующий уровень игры
  nextLevel() {
    if (this.checkGameOver()) return;

    this.currentLevel += 1;

    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    this.gamePlay.drawUi(this.themes[this.currentThemeIndex]);

    const aliveChar = this.positions.filter(pos =>
      ['bowman', 'swordsman', 'magician'].includes(pos.character?.type)
    )

    this.playerTeamSize += 1;
    this.enemyTeamSize += 1;

    const newPlayers = generateTeam([Bowman, Swordsman, Magician], this.playerTeamSize, this.playerTeamSize - aliveChar.length);
    const newEnemies = generateTeam([Daemon, Undead, Vampire], this.enemyTeamSize, this.enemyTeamSize);

    const occupiedPositions = new Set();
    aliveChar.forEach(pos => occupiedPositions.add(pos.position));

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

    newPlayers.characters.forEach((char) => {
      const position = getPlayerPosition();
      aliveChar.push(new PositionedCharacter(char, position));
    });

    const newEnemiesPositions = [];
    newEnemies.characters.forEach((char) => {
      const position = getEnemyPosition();
      newEnemiesPositions.push(new PositionedCharacter(char, position));
    });

    this.positions = [...aliveChar, ...newEnemiesPositions];

    this.gamePlay.redrawPositions(this.positions);

  }

  //Логика формирования информации об игроке
  createMessage(character) {
    const { level, attack, defence, health } = character.character;
    const message = `🎖${level} ⚔${attack} 🛡${defence} ❤${health}`;
    return message;
  }

  // Наведение на ячейку с игроком
  onCellEnter(index) {
    if (this.isGameOver) return;
    this.hoveredChar = this.positions.find((pos) => pos.position === index); // курсор указывает на персонажа

    this.allowedMovesCells = this.findMovementRadius(this.selectedChar?.position, this.selectedChar?.character.moveRadius) // доступные клетки для передвижения
    this.allowedAttackCells = this.findAttackRadius(this.selectedChar?.position, this.selectedChar?.character.attackRadius)// доступные клетки для атаки

    this.isPlayerChar = ['bowman', 'swordsman', 'magician'].includes(this.hoveredChar?.character.type); //Наведение на своего игрока
    this.isEnemyChar = ['daemon', 'undead', 'vampire'].includes(this.hoveredChar?.character.type); //Наведение на противника
    // показ подсказки
    if (this.hoveredChar) {
      const message = this.createMessage(this.hoveredChar);
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

        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
          allowedAttack.add(newPos);
        }

      }
    }
    return allowedAttack;
  }

  //Покидание ячейки с игроком
  onCellLeave(index) {
    if (this.isGameOver) return;
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
    this.hoveredChar = null;

    if (this.selectedChar?.position !== index) {
      this.gamePlay.deselectCell(index);
    }
  }

  //Завершение игры при победе или проигрыше
  checkGameOver() {
    const aliveChar = this.positions.filter(pos =>
      ['bowman', 'swordsman', 'magician'].includes(pos.character?.type)
    )

    if (aliveChar.length === 0) {
      this.blockField();
      GamePlay.showMessage('К сожалению в проиграли!');
      return true;
    }

    if (this.currentLevel > 4) {
      this.blockField();
      GamePlay.showMessage('Поздравляем, вы прошли игру!');
      return true;
    }

    return false;
  }

  // Блокировка игрового поля при проигрыше или прохождении 4 уровней
  blockField() {
    this.isGameOver = true;
    this.gamePlay.setCursor(cursors.notallowed)
  }

  //Запуск игры
  init() {
    this.gamePlay.drawUi(themes.prairie); // отрисовка поля
    this.generatePositions(); // генерация позиции персонажей
    this.gamePlay.redrawPositions(this.positions); // отрисовка персонажей
    this.doHoverActions(); // действия при наведении
    this.doClickActions(); // действия при нажатии
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }
}
