'use strict';

require('dotenv').config();
var restify = require('restify');
var builder = require('botbuilder');
var schedule = require('node-schedule');
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var inMemoryStorage = new builder.MemoryBotStorage();

var bot = new builder.UniversalBot(connector).set('storage', inMemoryStorage); // Register in memory storage

// send simple notification
function sendProactiveMessage(address) {
    var msg = new builder.Message().address(address);
    msg.text('Hello, this is a notification');
    msg.textLocale('en-US');
    bot.send(msg);
}

var savedAddress;
server.post('/api/messages', connector.listen());

// Do GET this endpoint to delivey a notification
server.get('/api/CustomWebApi', (req, res, next) => {
    sendProactiveMessage(savedAddress);
    res.send('triggered');
    next();
}
);

// root dialog
bot.dialog('/', function (session, args) {

    savedAddress = session.message.address;

    var message = 'http://localhost:' + server.address().port + '/api/CustomWebApi';
    session.send(message);
    var j = schedule.scheduleJob('5 * * * * *', function () {
        sendProactiveMessage(savedAddress);
    });
});