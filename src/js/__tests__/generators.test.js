import { characterGenerator, generateTeam } from '../generators'
import Bowman from '../characters/Bowman'
import Swordsman from '../characters/Swordsman'
import Magician from '../characters/Magician'

describe('characterGenerator', () => {
    it('должен бесконечно генерировать персонажей из списка allowedTypes', () => {
        const allowedTypes = [Bowman, Swordsman, Magician];
        const maxLevel = 3;
        const generator = characterGenerator(allowedTypes, maxLevel);

        const generatedCharacters = new Set();
        for (let i = 0; i < 100; i++) {
            const character = generator.next().value;
            expect(allowedTypes).toContain(character.constructor);
            generatedCharacters.add(character.constructor);
        }

        expect(generatedCharacters.size).toBeGreaterThan(1);
    });
});

describe('generateTeam', () => {
    it('должен корректно генерировать создавать персонажей в команде', () => {
        const allowedTypes = [Bowman, Swordsman, Magician];
        const maxLevel = 3;
        const characterCount = 3;
        const team = generateTeam(allowedTypes, maxLevel, characterCount);

        expect(team.characters.length).toBe(3);

        for(let item of team.characters){
            expect(item.level).toBeLessThanOrEqual(3);
        }
        
    });
});