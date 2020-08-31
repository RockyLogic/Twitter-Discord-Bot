const Discord = require('discord.js')
const Twitter = require('twit')
const { send } = require('process')
const client = new Discord.Client()
const base64 = require("node-base64-image");
var successChannel = "743989101157679286"
require('dotenv').config()
var author;

var twitterClient = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

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
                        console.log(tweet.id);
                        message.channel.send({
                            embed: {
                                color: 4701043,
                                description: `Posted To Twitter :white_check_mark:`
                            }
                        });
                    })

                })
            })
        }
    }
})

client.login('Token')