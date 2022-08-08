require("dotenv").config();

const { Pool } = require("pg");

// const isProduction = process.env.NODE_ENV === 'production';

const connectionString = ''

const pool = new Pool({
    connectionString: connectionString
});

// pool.query('SELECT * FROM users', (err, res) => {
//     console.log(err, res)
//     pool.end()
// })

module.exports = { pool };
