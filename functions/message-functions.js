const dataHandle = require('./data')
// CONFIG FUNCTIONS
/* -------------------------------------------------------------------------- */
const idConfigFunctions = {
  wifi(client, id) { // config/{id} - ssid
    // console.log(id, 'asked for wifi')
    client.publish(`config/${id}/wifi`, `${process.env.WIFI_SSID}|${process.env.WIFI_PASSWORD}`, { qos: 1 });
  },
}

const configFunctions = {
  alive(client, message) { // config/alive
    // console.log(message, 'is alive')
    client.subscribe(`config/${message}`, (err) => { if (err) console.log(err) })
  },
  connected(client, message) { // config/connected
    // console.log(message, 'is connected to wifi')
    client.subscribe(`data/${message}`, (err) => { if (err) console.log(err) })
  },
  id(client, subTopic, message) { // config/{id}
    if (idConfigFunctions[message]) idConfigFunctions[message](client, subTopic);
  }
}

// TOPIC FUNCTIONS
/* -------------------------------------------------------------------------- */
const topicFunctions = {
  config(client, subTopic, message) { // config/*
    if (configFunctions[subTopic]) return configFunctions[subTopic](client, message);
    return configFunctions.id(client, subTopic, message);
  },
  data(client, subTopic, message) { // data/*
    // console.log(`${subTopic} sent data -> ${message}`)
    dataHandle(subTopic, message)
  }
}

module.exports = (client, topic, message) => {
  // console.log(topic, message)
  const [mainTopic, ...subTopics] = topic.split('/');
  if (topicFunctions[mainTopic]) return topicFunctions[mainTopic](client, subTopics.join('/'), message)
}
