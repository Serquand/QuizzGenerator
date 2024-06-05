import type { KeyFunction } from "./types";

export function groupBy<T>(array: T[], keyFunction: KeyFunction<T>): Record<string, T[]> {
    return array.reduce((result, item) => {
        const key = keyFunction(item).toString();
        if (!result[key]) result[key] = [];
        result[key].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

export function convertPlaceToString(place: number): string {
    if(place === 1) return "🥇 First";
    else if(place === 2) return "🥈 Second";
    else if(place === 3) return "🥉 Third";
    else return place + 'th';
}

export function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}