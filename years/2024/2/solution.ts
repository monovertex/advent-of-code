import '../../prototype-extensions';

function checkReportSafety(report: number[]): boolean {
    const reportAsString = report.join('');
    const isSortedAscending = report.sortAscendingNumbers().join('') === reportAsString;
    const isSortedDescending = report.sortDescendingNumbers().join('') === reportAsString;
    if (!isSortedAscending && !isSortedDescending) return false;

    for (let i = 1; i < report.length; i++) {
        const difference = Math.abs(report[i] - report[i - 1]);
        if (difference < 1 || difference > 3) return false;
    }

    return true;
}

export function solvePart1(input: string): number {
    const reports = input.splitByNewLine().map((line) => line.splitByWhitespace().toNumbers());
    return reports.countBy(checkReportSafety);
}

export function solvePart2(input: string): number {
    const reports = input.splitByNewLine().map((line) => line.splitByWhitespace().toNumbers());
    return reports.countBy((report: number[]) => {
        if (checkReportSafety(report)) return true;

        return report.some((_, index) => {
            const newReport = [...report];
            newReport.splice(index, 1);
            return checkReportSafety(newReport);
        });
    });
}
