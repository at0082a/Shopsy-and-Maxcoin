// request is a module that makes http calls easier
const request = require('request');
const MongoClient = require('mongodb').MongoClient;
const dsn = 'mongodb://localhost:37017/maxcoin'
const redis = require('redis');
const mysql = require('mysql');

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
    const values = ['values'];

    Object.keys(data).forEach ((key) => {
        values.push(data[key]);
        values.push(key);
    });

    client.zadd(values, callback);
}

const redisClient = redis.createClient(7379);
redisClient.on('connect', () => {
    console.time('redis');
    console.log('successfully connected to redis');

    fetchFromAPI ((err, data) => {
        if (err) throw err;
        insertRedis(redisClient, data.bpi, (err, results) => {
            if (err) throw err
            console.log(`successfully inserted ${results} key/value pairs into redis`);

            redisClient.zrange('values', -1, -1, 'withscores', (err, result) => {
                if (err) throw err;
                console.log(`Redis: The one month max value is ${result[1]} and it was reached on ${result[0]}`);
                redisClient.end();
            });
        });
    });
});

function insertMySql (connection, data, callback) {
    const values = [];
    const sql = 'INSERT INTO coinvalues (valuedate, coinvalue) VALUES ? ';
    
    Object.keys(data).forEach ((key) => {
        values.push([key, data[key]]);
    });

    connection.query(sql, [values], callback)
}

const connection = mySql.createConnection({
    host: 'localhost',
    port: 3406,
    user: 'root',
    password: 'password',
    database: 'maxcoin'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Successfully connected to mysql');
    fetchFromAPI((err, data) => {
        if (err) throw err

        insertMySql((connection, data.bpi, (err, results, fields)) => {
            if (err) throw err;
            console.log(`Successfully inserted ${results.affectedRows} into database`);
            connection.query('SELECT * FROM coinvalues ORDER By coinvalue DESC LIMIT 0, 1', (err, results) => {
                if (err) throw err;
                console.log(`MySQL: the max one month value is ${results[0].coinvalue} and was reached on ${results[0].valuedate}`);
                connection.end();
            });
        });
    });
});