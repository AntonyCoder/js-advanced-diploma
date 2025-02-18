import GameController from "../GameController";
import GamePlay from "../GamePlay";
import PositionedCharacter from "../PositionedCharacter";
import Bowman from "../characters/Bowman";

jest.mock("../GamePlay"); // Мокаем GamePlay

describe("GameController Tooltip", () => {
  let gameController;
  let mockGamePlay;

  beforeEach(() => {
    mockGamePlay = new GamePlay();
    mockGamePlay.showCellTooltip = jest.fn(); // Мокаем метод
    mockGamePlay.hideCellTooltip = jest.fn();
    
    gameController = new GameController(mockGamePlay, {});
    gameController.positions = [
      new PositionedCharacter(new Bowman(1), 10),
    ];
  });

  test("должен отображать подсказку при наведении на ячейку с персонажем", () => {
    gameController.onCellEnter(10);

    expect(mockGamePlay.showCellTooltip).toHaveBeenCalledTimes(1);
    expect(mockGamePlay.showCellTooltip).toHaveBeenCalledWith("🎖1 ⚔25 🛡25 ❤50", 10);
  });

  test("не должен отображать подсказку, если в ячейке нет персонажа", () => {
    gameController.onCellEnter(5);

    expect(mockGamePlay.showCellTooltip).not.toHaveBeenCalled();
  });

  test("должен скрывать подсказку при выходе из ячейки", () => {
    gameController.onCellLeave(10);

    expect(mockGamePlay.hideCellTooltip).toHaveBeenCalledTimes(1);
    expect(mockGamePlay.hideCellTooltip).toHaveBeenCalledWith(10);
  });
});
