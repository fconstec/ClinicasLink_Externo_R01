module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './clinicaslink.sqlite' // IGUAL ao do db.ts!
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    }
  }
};