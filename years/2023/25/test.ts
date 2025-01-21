import * as chai from 'chai';
import { describe, it } from 'mocha';
import { readFile } from '@common';
import answers from './answers';
import { solvePart1 } from './solution';

chai.should();

describe('year 2023, day 25', function () {
    const inputExample = readFile('./years/2023/25/input-example.txt');
    const input = readFile('./years/2023/25/input.txt');

    it('part 1 - example', function () {
        solvePart1(inputExample).toString().should.equal(answers.part1Example.toString());
    });

    it('part 1', function () {
        solvePart1(input).toString().should.equal(answers.part1.toString());
    });
});
