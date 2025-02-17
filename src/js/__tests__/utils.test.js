import { calcTileType } from "../utils";

describe("Тест функции calcTileType", () => {
    test.each([
        [0, 8, "top-left"],
        [4, 8, "top"],
        [7, 8, "top-right"],
        [8, 8, "left"],
        [15, 8, "right"],
        [25, 8, "center"],
        [63, 8, "bottom-right"],
        [56, 8, "bottom-left"],
        [60, 8, "bottom"]
    ])("Проверка соответствия индексов и возвращаемых значений", (index, boardSize, expected) => {
        expect(calcTileType(index, boardSize)).toBe(expected);
    });
});