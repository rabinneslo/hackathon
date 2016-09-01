let express = require('express'),
    fs = require('fs');


/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

//Create new app and attach database connection to it
let app = express();


let port = process.env.PORT || 80;
let http = require('http'),
    server = http.createServer(app),
    io = require('socket.io')(server);
server = server.listen(port);
// express settings
require('./config/express')(app, io);

exports = module.exports = server;

