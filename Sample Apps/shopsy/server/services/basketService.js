let client = null

// add item
async function add(itemId, userId) {
  return new Promise ((reject, resolve) => {
    client.hget(`basket: ${userId}`, itemId, (err, obj) => {
      if (err) return reject(err);
      if (!obj) {
        client.hset(`basket: ${userId}`, itemId, (error, res) => {
          if (error) return reject(err);
          return resolve(res);
        });
      }
      return client.hincrby(`basket: ${userId}`, itemId, (incerr, res) => {
        if (incerr) return reject(incerr);
        return resolve(res);
      });
    });
  });
}

// get all items
async function getAll(userId) {
  return new Promise ((reject, resolve) => {
    client.hgetall(`basket: ${userId}`, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}

// delete items
async function remove(itemId, userId) {
  return new Promise ((reject, resolve) => {
    client.hdel(`basket: ${userId}`, itemId, (err, res) => {
      if (err) throw reject(err);
      return resolve(res);
    });
  });
}

module.exports = (_client) => {
  if (!_client) throw new Error('missing redis client object');
  client = _client;

  return {
    add,
    remove,
    getAll
  };
};
