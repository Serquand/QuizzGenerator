import { promisify } from 'util';
import { glob } from 'glob';
import { Client, Collection } from 'discord.js';

const pGlob = promisify(glob);

export const commands = new Collection();
export const modalResponseMethods = new Collection();
export const buttonResponseMethods = new Collection();

export const eventHandler = async (client: Client) => {
    (await pGlob(`${process.cwd()}/src/events/*.ts`)).map(async (eventFile: string) => {
        const event = (await import(eventFile)).default;
        console.log('Evenement chargé :  ' + event.name);
        if(event.once == true) {
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }
    })
}

export const commandHandler = async () => {
    (await pGlob(`${process.cwd()}/src/commands/*.ts`)).map(async (cmdFile: string) => {
        const cmd = (await import(cmdFile)).default;
        if(cmd.isDisabled) return;
        if(!cmd.name || !cmd.description) {
            return console.error("------\nCommande pas chargée : Pas de description ou de nom\n------")
        }
        commands.set(cmd.name, cmd);
        console.log("Commande chargée : ", cmd.name);
    });
}

export const buttonsHandler = async () => {
    (await pGlob(`${process.cwd()}/src/buttons/*.ts`)).map(async (buttonFile: string) => {
        const buttonReponseMethod = (await import(buttonFile)).default;
        if(!buttonReponseMethod.name || !buttonReponseMethod.execute) {
            return console.error("------\nMéthode de réponse au bouton pas chargée : Pas de méthode ou de nom\n------")
        } else {
            buttonResponseMethods.set(buttonReponseMethod.name, buttonReponseMethod);
            console.log(`Méthode de réponse au bouton chargée : ${buttonReponseMethod.name}`);
        }
    });
}

export const modalHandler = async () => {
    (await pGlob(`${process.cwd()}/src/modals/*.ts`)).map(async (modalFile: string) => {
        const modalResponseMethod = (await import(modalFile)).default;
        if(!modalResponseMethod.name || !modalResponseMethod.execute) {
            return console.error("------\nMéthode de réponse au modal pas chargée : Pas de méthode ou de nom\n------")
        } else {
            modalResponseMethods.set(modalResponseMethod.name, modalResponseMethod);
            console.log(`Méthode de réponse au modal chargée : ${modalResponseMethod.name}`);
        }
    });
}