import fs from 'fs';
import path from 'path';
import fetch, { HeadersInit } from 'node-fetch';
import { fileURLToPath } from 'url';
import { parse as parseHtml, HTMLElement } from 'node-html-parser';

export const FILENAME_DESCRIPTION = 'description.md';
export const FILENAME_ANSWERS = 'answers.ts';

export function getProjectPath(): string {
    return path.basename(path.dirname(fileURLToPath(import.meta.url)));
}

export function buildYearPath(year: string): string {
    return path.join(path.dirname(getProjectPath()), 'years', year);
}

export function buildDayPath(year: string, day: string): string {
    return path.join(buildYearPath(year), day);
}

export function buildDayFilePath(year: string, day: string, filename: string) {
    return path.join(buildDayPath(year, day), filename);
}

export function createFolder(path: string) {
    if (fs.existsSync(path)) return;
    fs.mkdirSync(path);
}

export function createFile(path: string, content: string = '') {
    if (fs.existsSync(path)) return;
    fs.writeFileSync(path, content);
}

export function createDayFile(year: string, day: string, filename: string, content: string = ''): void {
    createFile(buildDayFilePath(year, day, filename), content);
}

export function deleteFile(path: string) {
    if (!fs.existsSync(path)) return;
    fs.unlinkSync(path);
}

export async function fetchAOC(path: string = '', method: string = 'GET', body: any = ''): Promise<string> {
    const url = `${process.env.npm_package_config_aocHost}${path}`;
    const headers: HeadersInit = {
        'User-Agent': process.env.npm_package_config_userAgent!,
        'Cookie': process.env.SESSION_COOKIE!,
        'Cache-Control': 'no-cache',
    };
    const options: { method: string, headers: HeadersInit, body: string | undefined } = { method, headers, body: undefined };

    if (method !== 'GET' && method !== 'HEAD') {
        options.body = body;
        if (body instanceof URLSearchParams)
            options.headers = { ...options.headers, 'Content-Type': 'application/x-www-form-urlencoded' };
    }

    const response = await fetch(url, options);
    return response.text();
}

export async function fetchDayDescription(year: string, day: string): Promise<HTMLElement> {
    const pageContent = await fetchAOC(`/${year}/day/${day}`);
    const safePageContent = pageContent.replace('</pre></code>', '</code></pre>');
    const root = parseHtml(safePageContent, { blockTextElements: {
        script: true,
        noscript: true,
        style: true
    } });
    return root.querySelector('main')!;
}

export async function fetchDayInput(year: string, day: string): Promise<string> {
    return await fetchAOC(`/${year}/day/${day}/input`);
}

export async function submitDayAnswer(year: string, day: string, level: string, answer: string): Promise<boolean> {
    const body = new URLSearchParams();
    body.append('level', level);
    body.append('answer', answer);
    const response = await fetchAOC(`/${year}/day/${day}/answer`, 'POST', body);
    if (response.includes('That\'s the right answer')) return true;
    if (response.includes('That\'s not the right answer.')) throw new Error(`Part ${level} answer is incorrect: ${answer}`);
    console.log(response);
    throw new Error('Unknown response');
}

export function buildAnswersContent(answers: Object): string {
    const answersAsString: string = JSON.stringify(answers, null, 4);
    return `export default ${answersAsString};`;
}

export function extractAnswersFromDescription(description: HTMLElement): Object {
    const descriptionAsString: string = description.text;
    const answers = [...descriptionAsString.matchAll(/Your puzzle answer was (.+?)\./g)].map((match) => match[1]);
    const answersExample = description.querySelectorAll('code > em').map((element) => element.text);
    return {
        part1Example: answersExample[0] || '',
        part1: answers[0] || '',
        part2Example: answersExample[1] || '',
        part2: answers[1] || '',
    };
}

export function buildSolutionContent(): string {
    return `import '../../prototype-extensions';

export function solvePart1(input: string): number {
    return 0;
}

export function solvePart2(input: string): number {
    return 0;
}
`;
}

export function buildTestContent(year: string, day: string): string {
    return `import chai from 'chai';
import { describe, it } from 'mocha';
import { solvePart1, solvePart2 } from './solution';
import answers from './answers';
import { readFile } from '../../common';

chai.should();

describe('year ${year}, day ${day}', function () {
    const inputExample = readFile('./years/${year}/${day}/input-example.txt');
    const input = readFile('./years/${year}/${day}/input.txt');

    it('part 1 - example', function () {
        solvePart1(inputExample).toString().should.equal(answers.part1Example.toString());
    });

    it('part 1', function () {
        solvePart1(input).toString().should.equal(answers.part1.toString());
    });

    it('part 2 - example', function () {
        solvePart2(inputExample).toString().should.equal(answers.part2Example.toString());
    });

    it('part 2', function () {
        solvePart2(input).toString().should.equal(answers.part2.toString());
    });
});
`;
}
