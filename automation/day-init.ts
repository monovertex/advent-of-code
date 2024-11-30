import dotenv from 'dotenv';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { FILENAME_ANSWERS, FILENAME_DESCRIPTION, buildAnswersContent, buildDayPath, buildSolutionContent, buildTestContent, buildYearPath, createDayFile, createFolder, extractAnswersFromDescription, fetchDayDescription, fetchDayInput } from './common';

dotenv.config();

function createDayFolder(year: string, day: string): void {
    createFolder(buildYearPath(year));
    createFolder(buildDayPath(year, day));
}

async function initDay(year: string, day: string): Promise<any> {
    const [description, input] = await Promise.all([
        fetchDayDescription(year, day),
        fetchDayInput(year, day),
    ]);
    const descriptionMarkdown: string = NodeHtmlMarkdown.translate(description.toString());
    const exampleInput: string = description.querySelector('pre > code')!.text;
    const answers = extractAnswersFromDescription(description);

    createDayFolder(year, day);
    createDayFile(year, day, FILENAME_DESCRIPTION, descriptionMarkdown);
    createDayFile(year, day, 'input.txt', input.trimEnd());
    createDayFile(year, day, 'input-example.txt', exampleInput.trimEnd());
    createDayFile(year, day, 'solution.ts', buildSolutionContent());
    createDayFile(year, day, 'test.ts', buildTestContent(year, day));
    createDayFile(year, day, FILENAME_ANSWERS, buildAnswersContent(answers));
}

const year: string | undefined = process.argv.length === 4 ? process.argv[2] : process.env.npm_package_config_year;
const day: string = process.argv.length === 4 ? process.argv[3] : process.argv[2];

if (!year) throw new Error('Year not specified');

initDay(year, day);
