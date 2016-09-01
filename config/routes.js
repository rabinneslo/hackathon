'use strict';
let express = require('express');

module.exports = function (app, io) {

    let schoolRouter = express.Router();
    schoolRouter.route('/')
        .get(require('../api/school/index').get);
    app.use('/api/school', schoolRouter);
    // Always send index.html
    // let sendIndex = (req, res, next)=> {
    //     res.sendFile('index.html');
    // };
    // app.all('/*', sendIndex);

}