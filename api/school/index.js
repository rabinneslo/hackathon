const client = require('../../config/connections'),
      rx = require('rxjs');

exports.get = (req, res, next)=>{
    let promise = client.search({
        index: 'adr',
        type: 'school',
        size: 5,
        body:
        {
            "_source":{
                "include": ["brin_nr", "bg_nr", "naam", "locatie.*", "adres.plaats", "afstand", "score.*", "kosten.totaal.*", "gewicht", "leerlingen.totaal"]
            },
            "query" : {
                "constant_score" : { 
                    "filter" : {
                        "bool" : {
                            "should" : [
                                { 
                                    "query_string" : {
                                        "query" : req.query.term
                                    }
                                }
                            ],
                            "must" : {
                                "range" : {
                                    "score.ware" : {
                                        "gte" : 500
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "aggregations": {
                "gemeenten": {
                    "terms": {"field": "adres.gemeente.raw", size: 390},
                    "aggregations": {
                        "scores":{
                             "avg": {"field": "score.ware"}
                        },
                        "leerlingen":{
                            "avg": {"field": "leerlingen.totaal"}
                        },
                        "afstand":{
                            "avg": {"field": "afstand"}
                        },
                        "bijdrage":{
                            "avg": {"field": "kosten.totaal.kostprijs"}
                        }
                    }
                }
            }
        }

    });
    let search = rx.Observable.fromPromise(promise);
    search.subscribe((x)=>{
        res.send(x);
    },
    (err)=>{
        console.log(err);
        res.send(err);
    });
};

exports.simple_search = (req, res, next)=>{
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