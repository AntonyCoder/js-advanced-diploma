import { calcTileType } from "../utils";

// test("Проверка отрисовки границ поля", () => {
//     expect(calcTileType(0, 8)).toBe("top-left");
//     expect(calcTileType(4, 8)).toBe("top");
//     expect(calcTileType(7, 8)).toBe("top-right");
//     expect(calcTileType(8, 8)).toBe("left");
//     expect(calcTileType(15, 8)).toBe("right");
//     expect(calcTileType(25, 8)).toBe("center");
//     expect(calcTileType(63, 8)).toBe("bottom-right");
//     expect(calcTileType(60, 8)).toBe("bottom");
//     expect(calcTileType(56, 8)).toBe("bottom-left");
// })

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