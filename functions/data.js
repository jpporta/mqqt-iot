const { saveData } = require('./database')

parseData = (data) => {
  return data.split('-')
}
module.exports = async (device, data) => {
  const [sensor, value] = parseData(data)
  await saveData(device, sensor, value);
}