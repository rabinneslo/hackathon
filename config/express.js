/**
 * Module dependencies.
 */
const compress = require('compression'),
    express = require('express'),
    bodyParser = require('body-parser'),
    pkg = require('../package.json');
/**
 *
 * @param app
 * @param config
 * @param passport
 * @param io
 */
module.exports = (app,io) => {
    //settings
    app.set('showStackError', true);
    // should be placed before express.static
    app.use(compress({
        filter: function (req, res) {
            return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
        },
        level: 5
    }));
    app.use(require('connect-livereload')());

    // serve static content
    app.use(express.static('public'));
    app.use(express.static('node_modules'));
    // expose package.json to views
    app.use((req, res, next)=> {
        res.locals.pkg = pkg;
        next();
    });

    // parse application/json
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended:true}));
    app.use(require('method-override')());

    // This could be moved to view-helpers :-)
    app.use((req, res, next) =>{
        let ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
        console.log(ip);
        //res.locals._csrf = req.csrfToken();
        next();
    });
    require('./routes')(app, io);

    // development env config
    let env = process.env.NODE_ENV || 'development';
    if ('development' == env) {
        app.locals.pretty = true
    }
};
