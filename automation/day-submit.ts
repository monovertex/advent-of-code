import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { readFile } from '../years/common';
import { FILENAME_ANSWERS, FILENAME_DESCRIPTION, buildAnswersContent, buildDayFilePath, createDayFile, deleteFile, submitDayAnswer } from './common';

dotenv.config();

async function submitDay(year: string, day: string): Promise<any> {
    const { default: answers } = await import(`../years/${year}/${day}/answers`);
    const { solvePart1, solvePart2 } = await import(`../years/${year}/${day}/solution`);
    const level = !answers.part1 ? '1' : (!answers.part2 ? '2' : null);
    const solve = level === '1' ? solvePart1 : solvePart2;

    if (level === null) throw new Error('All answers already submitted');

    const input = readFile(`./years/${year}/${day}/input.txt`);
    const answer = await solve(input);
    const isCorrect = await submitDayAnswer(year, day, level, answer);
    if (!isCorrect) return;

    // Replace answers.
    const newAnswers = { ...answers, [`part${level}`]: String(answer) };
    await deleteFile(buildDayFilePath(year, day, FILENAME_ANSWERS));
    createDayFile(year, day, FILENAME_ANSWERS, buildAnswersContent(newAnswers));

    // Replace description.
    await deleteFile(buildDayFilePath(year, day, FILENAME_DESCRIPTION));
    execSync(`npm run init ${year} ${day}`, { stdio: 'inherit' });
}

const year: string | undefined = process.argv.length === 4 ? process.argv[2] : process.env.npm_package_config_year;
const day: string = process.argv.length === 4 ? process.argv[3] : process.argv[2];

if (!year) throw new Error('Year not specified');

submitDay(year, day);
