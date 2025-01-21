import '@prototype-extensions';

function findMarker(input: string, requiredMarkerLength: number): number {
    let marker: string[] = [];
    let position: number = 0;

    for (position = 0; position < input.length; position++) {
        const currentCharacter: string = input[position];
        const duplicatePosition: number = marker.indexOf(currentCharacter);
        if (duplicatePosition !== null) marker = marker.slice(duplicatePosition + 1);
        marker.push(currentCharacter);
        if (marker.length === requiredMarkerLength) break;
    }

    return position + 1;
}

export function solvePart1(input: string): any {
    return findMarker(input, 4);
}

export function solvePart2(input: string): any {
    return findMarker(input, 14);
}
