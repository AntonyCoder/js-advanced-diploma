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

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.boardSize = 8;
    this.positions = [];
  }

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

  tooltipStatus() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this))
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this))
  }

  showBorder(){
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this))
  }


  init() {
    this.gamePlay.drawUi(themes.prairie); // отрисовка поля
    this.generatePositions(); // генерация позиции персонажей
    this.gamePlay.redrawPositions(this.positions); // отрисовка персонажей
    this.tooltipStatus(); // вывод информации
    this.showBorder();
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }


  onCellClick(index) {
    const characterPlayer = this.positions.find((pos) => pos.position === index);
    const playerTeam = ['bowman', 'swordsman', 'magician'];

    if(playerTeam.includes(characterPlayer.character.type)){
      this.gamePlay.selectCell(index);
      for(let pos of this.positions){
        if(pos.position !== index){
          this.gamePlay.deselectCell(pos.position);
        }
      }
    } else {
      GamePlay.showError('Это персонаж противника!');
    }
  }

  showTooltip(character) {
    const { level, attack, defence, health } = character.character;
    const message = `🎖${level} ⚔${attack} 🛡${defence} ❤${health}`;
    return message;
  }

  onCellEnter(index) {
    const character = this.positions.find((pos) => pos.position === index);
    if (character) {
      const message = this.showTooltip(character);
      this.gamePlay.showCellTooltip(message, index);
    }
  }

  createMessage() {

  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index)
  }
}
