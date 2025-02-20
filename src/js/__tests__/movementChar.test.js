import Bowman from "../characters/Bowman";
import Magician from "../characters/Magician";
import Undead from "../characters/Undead";
import Vampire from "../characters/Vampire";
import GameController from "../GameController";

test('Проверка движения персонажа Bowman', () => {
    const game = new GameController(null, null);
    const position = 0;
    const bowman = new Bowman(1);
    const result = game.findMovementRadius(position, bowman.moveRadius);

    const expected = new Set([
        8, 16,
        1, 2,
        9, 18,
    ]);

    expect(result).toEqual(expected)
});

test('Проверка движения персонажа Magician', () => {
    const game = new GameController(null, null);
    const position = 27;
    const magician = new Magician(1)

    const result = game.findMovementRadius(position, magician.moveRadius);


    const expected = new Set([
        19, 26, 28, 35,
        18, 20, 34, 36
    ]);

    expect(result).toEqual(expected);
});

test('Проверка атаки персонажа Vampire', () => {
    const game = new GameController(null, null);
    const position = 0;
    const vampire = new Vampire(1);
    const result = game.findAttackRadius(position, vampire.attackRadius);

    const expected = new Set([
        8, 16,
        1, 2,
        9, 18,
    ]);

    expect(result).toEqual(expected)
});

test('Проверка движения персонажа Undead', () => {
    const game = new GameController(null, null);
    const position = 27;
    const undead = new Undead(1)

    const result = game.findAttackRadius(position, undead.attackRadius);


    const expected = new Set([
        19, 26, 28, 35,
        18, 20, 34, 36
    ]);

    expect(result).toEqual(expected);
});
