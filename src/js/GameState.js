export default class GameState {
  constructor() {
    this.currentTurn = 'player';
    this.positions = [];
    this.currentLevel = 1;
    this.currentThemeIndex = 0;
    this.playerTeamSize = 3;
    this.enemyTeamSize = 3;
  }
  static from(object) {
    const gameState = new GameState();
    Object.assign(gameState, object);
    return gameState;
  }



  switchTurn(){
    this.currentTurn = this.currentTurn === 'player' ? 'computer' : 'player';
  }
}
