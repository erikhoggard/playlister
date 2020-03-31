var Discord = require('discord.js');
var logger = require('winston');
var shortUrl = require('node-url-shortener');
var auth = require('./auth.json');
const shuffle = requrie('./utils').shuffle;

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';


const bot = new Discord.Client();

bot.on("ready", () => {
    console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`);
    bot.user.setActivity(`!playlist`);
});

bot.on('ready', function(evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});


bot.on('message', async function(message) {

    if (message.content.substring(0, 1) == '!') {
        let args = message.content.substring(1).split(' ');
        let cmd = args[0];

        args = args.splice(1);
        switch (cmd) {
            case 'playlist':
                {
                    let allMessages = [];
                    let currMessages = [];
                    let lastMessageId;
                    let cmdMessage;

                    do {
                        if (!lastMessageId) {
                            currMessages = await message.channel.messages.fetch({ "limit": 100 });
                            cmdMessage = Array.from(currMessages)[0];
                        } else {
                            currMessages = await message.channel.messages.fetch({ "before": lastMessageId, "limit": 100 });
                        }
                        allMessages = [...allMessages, ...currMessages];
                        lastMessageId = Array.from(currMessages)[currMessages.size - 1][0];
                    } while (currMessages.size === 100);

                    //only concerned with embedded links, for now
                    const vidIds = allMessages
                        .filter(x => x[1].embeds.length === 1 && x[1].embeds[0].url.startsWith("https://www.youtube.com/watch?v="))
                        .map(([, { embeds: [{ url }] }]) => url.split("https://www.youtube.com/watch?v=")[1].split("&")[0])

                    //since we can only make playlists of <50 vids, shuffle so we dont' always take the same first 50 
                    const playlistUrl = shuffle(playlist)
                        .join(',')
                        .replace(/^/, "https://www.youtube.com/watch_videos?video_ids=");

                    shortUrl.short(playlistUrl, (err, url) => {
                        message.channel.send(`${message.channel.name.charAt(0).toUpperCase() + message.channel.name.slice(1)} Playlist Generated:\n${url}\nThis link will be visible for 10 seconds...`)
                            .then(msg => {
                                cmdMessage[1].delete();
                                msg.delete({ timeout: 10000 });
                            })
                    })
                }
        }
    }
});

bot.login(auth.token);