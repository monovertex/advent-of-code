import chai from 'chai';
import { describe, it } from 'mocha';
import { solvePart1, solvePart2 } from './solution';
import answers from './answers';
import { readFile } from '../../common';

chai.should();

describe('year 2023, day 20', function () {
    const input = readFile('./years/2023/20/input.txt');

    it('part 1 - example 1', function () {
        solvePart1(readFile('./years/2023/20/input-example1.txt')).toString().should.equal(answers.part1Example1.toString());
    });

    it('part 1 - example 2', function () {
        solvePart1(readFile('./years/2023/20/input-example2.txt')).toString().should.equal(answers.part1Example2.toString());
    });

    it('part 1', function () {
        solvePart1(input).toString().should.equal(answers.part1.toString());
    });

    it('part 2', function () {
        solvePart2(input).toString().should.equal(answers.part2.toString());
    });
});
