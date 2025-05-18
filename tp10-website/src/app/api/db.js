import mysql from "mysql2/promise";

// In a real project, you’d keep these in .env.local or some safe place
const pool = mysql.createPool({
    host: "13.60.174.225",   // or your DB host
    user: "remoteuser",        // your DB user
    password: "Admin123@",
    database: "TP10",  // name of the DB
});

export default pool;
