import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

async function runDay(year: string, day: string): Promise<any> {
    execSync(`npx mocha --timeout 0 --recursive --parallel ./years/${year}/${day}/*.ts`, { stdio: 'inherit' });
}

const year: string | undefined = process.argv.length === 4 ? process.argv[2] : process.env.npm_package_config_year;
const day: string = process.argv.length === 4 ? process.argv[3] : process.argv[2];

if (!year) throw new Error('Year not specified');

runDay(year, day);
