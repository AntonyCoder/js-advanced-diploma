import GameStateService from '../GameStateService';
import GamePlay from '../GamePlay';
import GameController from '../GameController';

jest.mock('../GamePlay', () => ({
  showError: jest.fn(),
  showMessage: jest.fn(),
}));

describe('GameStateService load method', () => {
  let storage;
  let stateService;
  let gamePlay;

  beforeEach(() => {
    storage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    stateService = new GameStateService(storage);

    gamePlay = {
      drawUi: jest.fn(),
      redrawPositions: jest.fn(),
    };
  });

  it('should load state successfully', () => {
    const mockState = { currentTurn: 'player', positions: [] };
    storage.getItem.mockReturnValue(JSON.stringify(mockState));

    const gameController = new GameController(gamePlay, stateService);

    gameController.loadGame();

    expect(gameController.positions).toEqual(mockState.positions);
    expect(storage.getItem).toHaveBeenCalledWith('state');
  });

  it('should handle load error and show error message', () => {
    storage.getItem.mockReturnValue('invalid JSON');

    const gameController = new GameController(gamePlay, stateService);

    gameController.loadGame();

    expect(GamePlay.showError).toHaveBeenCalledWith('Invalid state');
  });
});