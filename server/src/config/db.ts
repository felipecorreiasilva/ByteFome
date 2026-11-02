import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Podes apagar ou comentar este bloco no teu src/config/db.ts:
/*
pool.on('connect', () => {
  console.log('Base de dados PostgreSQL conectada com sucesso!');
});
*/

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente PostgreSQL', err);
  process.exit(-1);
});