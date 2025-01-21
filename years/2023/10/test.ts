import * as chai from 'chai';
import { describe, it } from 'mocha';
import { solvePart1, solvePart2 } from './solution';
import answers from './answers';
import { readFile } from '@common';

chai.should();

describe('year 2023, day 10', function () {
    const input = readFile('./years/2023/10/input.txt');

    it('part 1 - example 1', function () {
        const inputExample = readFile('./years/2023/10/input-part1example1.txt');
        solvePart1(inputExample).toString().should.equal(answers.part1Example1.toString());
    });

    it('part 1 - example 2', function () {
        const inputExample = readFile('./years/2023/10/input-part1example2.txt');
        solvePart1(inputExample).toString().should.equal(answers.part1Example2.toString());
    });

    it('part 1', function () {
        solvePart1(input).toString().should.equal(answers.part1.toString());
    });

    it('part 2 - example 1', function () {
        const inputExample = readFile('./years/2023/10/input-part2example1.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example1.toString());
    });

    it('part 2 - example 2', function () {
        const inputExample = readFile('./years/2023/10/input-part2example2.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example2.toString());
    });

    it('part 2 - example 3', function () {
        const inputExample = readFile('./years/2023/10/input-part2example3.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example3.toString());
    });

    it('part 2', function () {
        solvePart2(input).toString().should.equal(answers.part2.toString());
    });
});
