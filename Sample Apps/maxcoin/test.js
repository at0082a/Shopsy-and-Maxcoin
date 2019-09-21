// request is a module that makes http calls easier
const request = require('request');
const MongoClient = require('mongodb').MongoClient;
const dsn = 'mongodb://localhost:37017/maxcoin'
const redis = require('redis');


function insertMongodb(collection, data) {
    const promisedInserts = [];
    
    Object.keys(data).forEach ((key) => {
        promisedInserts.push(
            collection.insertOne({date: key, value: data[key]})
            );
        });
    return Promise.all(promisedInserts);
}

function fetchFromAPI(callback) {
    
    // We are using fat arrow (=>) syntax here. This is a new way to create anonymous functions in Node
    // Please review the Node.js documentation if this looks unfamiliar to you
    request.get('https://api.coindesk.com/v1/bpi/historical/close.json', (err, raw, body) => {
        return callback(err, JSON.parse(body));
    });
}
      
MongoClient.connect(dsn, (err, db) => {
    if (err) throw err;
    console.log("connected to mongodb server");
    fetchFromAPI((err, data) => {   
        if (err) throw err;
        const collection = db.collection('value');

        insertMongodb(collection, data.bpi).then ((result) => {
            console.log(`successfully inserted ${result.length} of documents`);
            const options = {'sort': [['value', 'desc']]};
            collection.findOne({}, options, (err, doc) => {
                if (err) throw err;
                console.log(`found the largest one month value which is ${doc.value} reached on ${doc.date}`);
                db.close();
            });
        })
        .catch ((err) => {
            console.log(err);
            process.exit();
        });
    });
});

function insertRedis (client, data, callback) {
    const values = ['values']

    Object.keys(data).forEach ((key) => {
        values.push(data[key]);
        values.push(key);
    });

    client.zadd(values, callback);
}

const redisclient = redis.createClient(7379);
redisclient.on('connect', () {

});