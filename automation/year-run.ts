import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

async function runYear(year: string): Promise<any> {
    execSync(`npx ts-mocha --timeout 0 --recursive --parallel ./years/${year}/**/*.ts`, { stdio: 'inherit' });
}

const year: string | undefined = process.argv.length === 3 ? process.argv[2] : process.env.npm_package_config_year;

if (!year) throw new Error('Year not specified');

runYear(year);
