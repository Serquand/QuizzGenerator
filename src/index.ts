import * as dotenv from 'dotenv';
dotenv.config();

import { Client } from 'discord.js';
import { buttonsHandler, commandHandler, eventHandler, modalHandler } from './tools/handlers';
import DbSync from './models/DbSync';
import { setupCronjobs } from './tools/date';
import { setup as setupChatGpt } from './tools/chatgpt';

(async () => {
    const client = new Client({ intents: Number.parseInt(process.env.DISCORD_INTENTS) });
    client.login(process.env.BOT_TOKEN);
    await Promise.all([ eventHandler(client), commandHandler(), buttonsHandler(), modalHandler() ]);

    setupChatGpt();
    setTimeout(async () => {
        await DbSync();
        setupCronjobs(client);
    }, 5_000);
})();