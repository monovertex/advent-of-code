import chai from 'chai';
import { describe, it } from 'mocha';
import { solvePart1, solvePart2 } from './solution';
import answers from './answers';
import { readFile } from '../../common';

chai.should();

describe('year 2023, day 24', function () {
    const inputExample = readFile('./years/2023/24/input-example.txt');
    const input = readFile('./years/2023/24/input.txt');

    it('part 1 - example', async function () {
        solvePart1(inputExample).toString().should.equal(answers.part1Example.toString());
    });

    it('part 1', function () {
        solvePart1(input).toString().should.equal(answers.part1.toString());
    });

    it('part 2 - example', async function () {
        (await solvePart2(inputExample)).toString().should.equal(answers.part2Example.toString());
    });

    it('part 2', async function () {
        (await solvePart2(input)).toString().should.equal(answers.part2.toString());
    });
});
