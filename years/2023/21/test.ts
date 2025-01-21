import * as chai from 'chai';
import { describe, it } from 'mocha';
import { solvePart1, solvePart2 } from './solution';
import answers from './answers';
import { readFile } from '../../common';

chai.should();

describe('year 2023, day 21', function () {
    const inputExample = readFile('./years/2023/21/input-example.txt');
    const input = readFile('./years/2023/21/input.txt');

    it('part 1 - example', function () {
        solvePart1(6, inputExample).toString().should.equal(answers.part1Example.toString());
    });

    it('part 1', function () {
        solvePart1(64, input).toString().should.equal(answers.part1.toString());
    });

    it('part 2 - example 1', function () {
        solvePart2(10, inputExample).toString().should.equal(answers.part2Example1.toString());
    });

    it('part 2 - example 2', function () {
        solvePart2(50, inputExample).toString().should.equal(answers.part2Example2.toString());
    });

    it('part 2 - example 3', function () {
        solvePart2(100, inputExample).toString().should.equal(answers.part2Example3.toString());
    });

    it('part 2 - example 4', function () {
        solvePart2(500, inputExample).toString().should.equal(answers.part2Example4.toString());
    });

    it('part 2', function () {
        solvePart2(26501365, input).toString().should.equal(answers.part2.toString());
    });
});
