import {Client} from 'discordx';
import {Guild} from 'discord.js';
const axios = require('axios');

require('dotenv').config();

const client = new Client({
  intents: ['GUILDS'],
  silent: true,
});

/**
 * sleep - i am not a ts dev
 * @param {number} ms milliseconds to sleep
 * @return {Promise} promise
 */
function delay(ms: number) {
  return new Promise( (resolve) => setTimeout(resolve, ms) );
}

async function getCollection() {
  try {
    const response = await axios.get(`https://api-mainnet.magiceden.dev/v2/collections/${process.env.SLUG}/stats`, {
      headers: {
          "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:95.0) Gecko/20100101 Firefox/95.0",
          "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "cross-site",
          "Content-Type": "application/json; charset=utf-8"
      },
      referrer: "https://magiceden.io/",
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error(error);
  }
}

client.once('ready', async () => {
  await client.initApplicationPermissions(true);

  console.log(`watching ${process.env.SLUG}`);

  const guilds = client.guilds.cache;

  console.log('Bot started');

  while (true) {

    const basicInfo = await getCollection()

    if (process.env.NICKNAME) {
      await client.user?.setActivity(process.env.SLUG || 'magiceden.io', {type: 'WATCHING'});

      guilds.map(async (guild: Guild) => {
        //console.log(`changing name in ${guild}`);
        try {
          const floorPriceDiv =  basicInfo.data.floorPrice/1000000000;
          //console.log(quotient);
          await guild.me?.setNickname(
              `${floorPriceDiv} SOL`,
          );
          console.log(`changed nickname in ${guild}`);
        } catch (DiscordAPIError) {
          console.log(`unable to change nickname in ${guild}`);
        }
      });
    } else {
      const floorPriceDiv =  basicInfo.data.floorPrice/1000000000;
      await client.user?.setActivity(`Floor: ${floorPriceDiv} SOL`, {type: 'WATCHING'});
      console.log(`updated activity`);
    }

    await delay(parseInt(process.env.FREQUENCY || '3600000'));
  }
});

client.login(process.env.DISCORD_BOT_TOKEN ?? '');
