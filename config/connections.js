let elasticsearch = require('elasticsearch');
let client = new elasticsearch.Client({
    hosts : [
        'http://localhost:9200'
    ]
});

module.exports = client;