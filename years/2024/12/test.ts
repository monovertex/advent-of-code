import * as chai from 'chai';
import { describe, it } from 'mocha';
import { solvePart1, solvePart2 } from './solution';
import answers from './answers';
import { readFile } from '../../common';

chai.should();

describe('year 2024, day 12', function () {
    const input = readFile('./years/2024/12/input.txt');

    it('part 1 - example 1', function () {
        const inputExample = readFile('./years/2024/12/input-example1.txt');
        solvePart1(inputExample).toString().should.equal(answers.part1Example1.toString());
    });

    it('part 1 - example 2', function () {
        const inputExample = readFile('./years/2024/12/input-example2.txt');
        solvePart1(inputExample).toString().should.equal(answers.part1Example2.toString());
    });

    it('part 1 - example 3', function () {
        const inputExample = readFile('./years/2024/12/input-example3.txt');
        solvePart1(inputExample).toString().should.equal(answers.part1Example3.toString());
    });

    it('part 1', function () {
        solvePart1(input).toString().should.equal(answers.part1.toString());
    });

    it('part 2 - example 1', function () {
        const inputExample = readFile('./years/2024/12/input-example1.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example1.toString());
    });

    it('part 2 - example 2', function () {
        const inputExample = readFile('./years/2024/12/input-example2.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example2.toString());
    });

    it('part 2 - example 3', function () {
        const inputExample = readFile('./years/2024/12/input-example3.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example3.toString());
    });

    it('part 2 - example 4', function () {
        const inputExample = readFile('./years/2024/12/input-example4.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example4.toString());
    });

    it('part 2 - example 5', function () {
        const inputExample = readFile('./years/2024/12/input-example5.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example5.toString());
    });

    it('part 2 - example 6', function () {
        const inputExample = readFile('./years/2024/12/input-example6.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example6.toString());
    });

    it('part 2 - example 7', function () {
        const inputExample = readFile('./years/2024/12/input-example7.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example7.toString());
    });

    it('part 2 - example 8', function () {
        const inputExample = readFile('./years/2024/12/input-example8.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example8.toString());
    });

    it('part 2 - example 9', function () {
        const inputExample = readFile('./years/2024/12/input-example9.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example9.toString());
    });

    it('part 2 - example 10', function () {
        const inputExample = readFile('./years/2024/12/input-example10.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example10.toString());
    });

    it('part 2 - example 11', function () {
        const inputExample = readFile('./years/2024/12/input-example11.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example11.toString());
    });

    it('part 2 - example 12', function () {
        const inputExample = readFile('./years/2024/12/input-example12.txt');
        solvePart2(inputExample).toString().should.equal(answers.part2Example12.toString());
    });

    it('part 2', function () {
        solvePart2(input).toString().should.equal(answers.part2.toString());
    });
});
