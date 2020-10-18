require("dotenv").config();

const { Pool } = require("pg");

// const isProduction = process.env.NODE_ENV === 'production';

const connectionString = 'postgres://qdqtamfw:Z-Kp_TlGY-RUW9WfN2lLbPzxQ5s8hKGh@john.db.elephantsql.com:5432/qdqtamfw'

const pool = new Pool({
    connectionString: connectionString
});

// pool.query('SELECT * FROM users', (err, res) => {
//     console.log(err, res)
//     pool.end()
// })

module.exports = { pool };