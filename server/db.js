import { DATABASE_URL, DB_CONFIG } from './config.js';
import postgres from 'postgres';

const sql = postgres(DATABASE_URL, DB_CONFIG);

export default sql;
