export default class GameState {
  constructor() {
    this.currentTurn = 'player';
  }
  static from(object) {
    const gameState = new GameState();
    Object.assign(gameState, object);
    return gameState;
  }

  switchTurn(){
    this.currentTurn = this.currentTurn === 'player' ? 'copmuter' : 'player';
  }
}
