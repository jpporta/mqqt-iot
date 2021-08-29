const dotenv = require('dotenv')
const mqtt = require('mqtt')
const { getDevices } = require('./functions/database');
const uuid = require('uuid')

const messageFunctions = require('./functions/message-functions')

dotenv.config()
const client = mqtt.connect(
  process.env.MQTT_SERVER,
  {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD,
    clientId: uuid.v4()
  }
)

getDevices()
  .then(devices => {
    devices.forEach(device => {
      client.subscribe(`data/${device.id}`, (err) => { if (err) console.log("error", err) });
    })
  })

const handleNewMessage = (topic, message) => {
  const parsedMessage = message.toString();
  return messageFunctions(client, topic, parsedMessage)
}

client.on('connect', () => {
  client.subscribe('config/alive', (err) => { if (err) console.log(err) })
  client.subscribe('config/connected', (err) => { if (err) console.log(err) })
})

client.on('message', handleNewMessage)
