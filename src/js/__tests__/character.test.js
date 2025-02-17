import Character from "../Character";
import Bowman from "../characters/Bowman";
import Daemon from "../characters/Daemon";
import Magician from "../characters/Magician";
import Undead from "../characters/Undead";
import Swordsman from "../characters/Swordsman";
import Vampire from "../characters/Vampire";

describe('Проверка работы класса Character и его наследников', () => {
    test('Проверка на ошибку при создание класса Character', () => {
        expect(() => new Character(2)).toThrow(Error);
    })

    test('Проверка создания класса Bowman', () => {
        const bowman = new Bowman(3);
        expect(bowman.level).toBe(3);
    })

    test.each([
        [Bowman, 25, 25, 1, 50, "bowman"],
        [Daemon, 10, 10, 1, 50, "daemon"],
        [Swordsman, 40, 10, 1, 50, "swordsman"],
        [Vampire, 25, 25, 1, 50, "vampire"],
        [Undead, 40, 10, 1, 50, "undead"],
        [Magician, 10, 40, 1, 50, "magician"],
    ])('Проверка х-тик персонажей 1 уровня', (character, attack, defence, level, health, type) => {
        const charCharacter = new character(1)
        expect(charCharacter.attack).toBe(attack);
        expect(charCharacter.defence).toBe(defence);
        expect(charCharacter.level).toBe(level);
        expect(charCharacter.health).toBe(health);
        expect(charCharacter.type).toBe(type);
    })
    
})
