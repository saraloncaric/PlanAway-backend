import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()
const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})
pool.connect((error, client, release) => {
  if(error) {
    console.error('Greška prilikom spajanja na bazu:', error.stack);
  } else {
    console.log('Uspješno spojeno na bazu')
    release()
  }
})