const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://localhost')

const aliveFunction = (message) => {
	client.subscribe(`config/${message}`, (err) => {if(err) console.log(err)})
}

const configFunction = (id, message) => {
	console.log(`${id} sent ${message}`)
}

const handleNewMessage = (topic, message) => {
	const parsedMessage = message.toString();
	console.log(topic, parsedMessage)
	if(topic === 'config/alive') return aliveFunction(parsedMessage);
	if(topic.split('/')[0] === 'config') return configFunction(topic.split('/')[1], parsedMessage)
	console.log('unknown topic', topic, parsedMessage)
}

client.on('connect', () => {
	client.subscribe('config/alive', (err) => {
		if(err) console.log(err)
	})
})

client.on('message', handleNewMessage)
