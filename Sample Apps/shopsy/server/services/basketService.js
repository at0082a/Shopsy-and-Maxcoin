let client = null


async function

module.exports = (_client) => {
  if (!_client) throw new Error('missing redis client object');
  client = _client;

  return {

  };
};
