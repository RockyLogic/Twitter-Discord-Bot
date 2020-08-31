const Discord = require('discord.js')
const Twitter = require('twit')
const { send } = require('process')
const client = new Discord.Client()
const base64 = require("node-base64-image");
const { Console } = require('console');
var successChannel = "743989101157679286"
require('dotenv').config()
var author;

var twitterClient = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

//discord and twitter associations (discord, twitter)
var associations = new Map()

const sendToLogs = (msg) => {
    let time = new Date()
    console.log(`[${time.toLocaleString('en-US', { timeZone: 'America/New_York' })}] ${msg}`)
}


client.on('ready', () => {
    sendToLogs(`Logged in as ${client.user.tag}!`)
    sendToLogs("Success Bot Live");
})

client.on('message', message => {
    if (message.channel.id === successChannel) {
        if (message.attachments.size > 0) {
            message.react('🗑')
            let filter = (reaction, user) => {
                return reaction.emoji.name === '🗑' && user.id === message.author.id;
            };
            message.awaitReactions(filter, { max: 1, time: 600000 })
                .then(collected => {
                    message.delete()
                    twitterClient.post(`statuses/destroy/:id`, { id: associations.get(message.id) }, function (err, data, response) {
                        if (err) {
                            console.log(err);
                        }
                    })
                    associations.delete(message.id)
                    message.channel.send({
                        embed: {
                            color: 16737913,
                            description: `Deleted From Twitter :white_check_mark:`
                        }
                    })

                })
            message.attachments.forEach(async image => {
                author = message.author.username + "#" + message.author.discriminator

                let url = image.proxyURL;
                let options = {
                    string: true,
                };

                let imageData = await base64.encode(url, options);

                twitterClient.post('media/upload', { media_data: imageData }, function (err, data, response) {
                    if (err) {
                        console.log(err)
                    }

                    var mediaIdStr = data.media_id_string
                    var params = { status: `Success By ${author}`, media_ids: [mediaIdStr] }

                    twitterClient.post('statuses/update', params, function (err, tweet, response) {
                        if (err) {
                            console.log(err)
                        }

                        associations.set(message.id, tweet.id_str)

                        message.channel.send({
                            embed: {
                                color: 4701043,
                                description: `Posted To Twitter :white_check_mark:`
                            }
                        })
                    })
                })
            })
        }
    }
})

client.login('NzQ5NjU3NDMyMTQ1MjY0NzUx.X0vK4w.JWl4YqXbrRKNrW_jyRoH1nGEbEs')