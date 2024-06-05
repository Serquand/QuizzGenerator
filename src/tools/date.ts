import cron from 'node-cron';
import { launchQuizzNow } from './Quizz';
import { Client } from 'discord.js';

export const isValidDate: (date: string) => boolean = (date: string): boolean => {
    if (typeof date !== 'string') return false;

    const hour = date.split(' ')[1];
    if (!hour) return false;

    const fullDate = date.split(' ')[0];
    const splittedHour = hour.split(':');
    if (splittedHour.length !== 2 || splittedHour[0].length !== 2 || Number.isNaN(splittedHour[0]) || splittedHour[1].length !== 2 || Number.isNaN(splittedHour[1])) return false;

    const splittedDate = fullDate.split('/');
    return !(
        splittedDate.length !== 3 ||
        splittedDate[0].length !== 2 || Number.isNaN(splittedDate[0]) ||
        splittedDate[1].length !== 2 || Number.isNaN(splittedDate[1]) ||
        splittedDate[2].length !== 4 || Number.isNaN(splittedDate[2])
    );
}

export function convertDateToTimestamp (date: string): number {
    const splittedHour = date.split(' ')[1].split(':');
    const splittedDate = date.split(' ')[0].split('/');
    return new Date(`${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}T${splittedHour[0]}:${splittedHour[1]}:00`).getTime();
}

export function convertSecondsToPrintableTime(seconds: number): string {
    if(seconds < 0) return '';
    const numberOfHours = Math.floor(seconds / 3600);
    let stillingSeconds = seconds % 3600;
    const numberOfMinutes = Math.floor(stillingSeconds / 60);
    const numberOfSeconds = stillingSeconds % 60;
    return `${numberOfHours > 0 ? numberOfHours + 'h ' : ''} ${numberOfMinutes > 0 ? numberOfMinutes + 'mn ' : ''} ${numberOfSeconds > 0 ? numberOfSeconds + 's ' : ''}`.trim();
}

export function convertPrintableTimeToSeconds(printableTime: string): number {
    const hours = printableTime.includes('h') ? Number.parseInt(printableTime.split('h')[0].trim()) : 0;
    const minutes = printableTime.includes('mn') ? Number.parseInt(printableTime.split('mn')[0].trim().split(' ').at(-1)) : 0;
    const seconds = printableTime.includes('s') ? Number.parseInt(printableTime.split('s')[0].trim().split(' ').at(-1)) : 0;
    return hours * 3_600 + minutes * 60 + seconds;
}

export function getTimestampForCurrentMinute() {
    const date = new Date();
    date.setSeconds(0, 0);
    return date.getTime();
}

export async function setupCronjobs (client: Client) {
    cron.schedule('* * * * *', () => launchQuizzNow(client));
}