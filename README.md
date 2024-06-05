# QuizzGenerator

### Purpose
**This BOT has been created for a school project**
The purpose of the QuizzGenerator BOT is to facilitate interactive learning and engagement on Discord servers through quizzes. It leverages the OpenAI API to manage and generate quiz content, including multiple-choice and open-ended questions. This BOT aims to make learning fun and accessible, providing an engaging way for community members to test their knowledge and learn new information in a social setting.


### Installation and configuration
To install and run the BOT, please, follow these different steps:

Step 1 : Creation of the BOT Discord
1. Create a Discord account
2. Create a new application on [the Discord Developper portal](https://discord.com/developers/applications)
3. Create a new bot on the application
4. Copy the token (it will be usefull for the next step)

Step 2 : Invite the BOT Discord on the server
1. Go on your application
2. Go on the OAuth2 page
3. Select the Scope bot
4. Copy the generated URL
5. Paste the URL on a new tab
6. Select your Discord server
7. Click on "Autoriser"
8. Your BOT has successfully joined your server

Step 3 : Compute the INTENTS
1. [Go here](https://discord-intents-calculator.vercel.app/)
2. Check all the intents that you need (at least DIRECT_MESSAGES, GUILDS, GUILD_MODERATION, GUILD_EMOJIS_AND_STICKERS)
3. Copy the result (it will be usefull for the next step)

Step 4 : Create a new OpenAI project
1. [Go here](https://platform.openai.com/)
2. Create a new project
3. Copy the project ID
4. [Go here](https://platform.openai.com/settings/organization/billing/overview)
5. If you don't have credit, put some money on your credit balance
6. [Go here](https://platform.openai.com/api-keys)
7. Create a new secret key
8. Copy the secret key

Step 5 : Final setup
1. Clone the repository
2. Install the dependencies with npm install
3. Install Docker [here](https://www.docker.com/get-started/)
4. Install DockerCompose [here](https://docs.docker.com/compose/install)
5. Create a .env file and paste the content of .env.template inside it
6. Fill the different env variables with the right values
7. Run `docker compose up --build`