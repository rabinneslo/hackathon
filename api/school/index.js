const client = require('../../config/connections'),
      rx = require('rxjs');
exports.get = (req, res, next)=>{
    let query = req.query && req.query.query ? req.query.query : '*';
    console.log(query);
    let promise = client.search({  
        index: 'adr',
        type: 'school',
        body: {
            query: {
                simple_query_string : {
                    query: query
                }
            }
        }
    });
    let search = rx.Observable.fromPromise(promise);
    search.subscribe((x)=>{
        res.send(x);
    },
    (err)=>{
        res.send(err);
    });
};