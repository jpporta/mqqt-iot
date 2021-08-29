const mariadb = require('mariadb')
const uuid = require('uuid')
require('dotenv').config()
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectionLimit: 5,
})

async function saveData(device, sensor, value) { // device uuid, sensor_position int, value number
  let conn;
  try {
    conn = await pool.getConnection();
    // check if device exists, if not create
    const devices = await conn.query(`
      SELECT id from iot.devices WHERE id = '${device}' LIMIT 1;
    `)

    if (!devices || !devices[0] || !devices[0].id) { //device does not exist
      await conn.query(`
        INSERT INTO iot.devices (id) VALUES ('${device}');
      `)
    }
    // console.log(device)
    // check if sensor exists. if not create
    let sensors = await conn.query(`
      SELECT id FROM iot.sensors WHERE device_id = '${device}' AND sensor_position = ${sensor} LIMIT 1;
    `)
    if (!sensors || !sensors[0] || !sensors[0].id) { // sensor does not exist
      await conn.query(`
        INSERT INTO iot.sensors (id, device_id, sensor_position) VALUES ('${uuid.v4()}', '${device}', ${sensor});
      `)
      sensors = await conn.query(`
      SELECT id FROM iot.sensors WHERE device_id = '${device}' AND sensor_position = ${sensor} LIMIT 1;
    `)
    }
    // console.log(sensors)
    // save data
    await conn.query(`
      INSERT INTO iot.data (id, sensor_id, value) VALUES ('${uuid.v4()}', '${sensors[0].id}', '${value}');
    `)
  } catch (err) {
    // console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function getDevices() {
  let conn;
  let devices;
  try {
    conn = await pool.getConnection();
    devices = await conn.query(
      `SELECT id from iot.devices;`
    );
    delete devices.meta
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
  return devices;
}

module.exports = {
  saveData,
  getDevices,
}