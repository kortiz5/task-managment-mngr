import sqlite3 from 'sqlite3';
import { SqlQuery } from '../src/enums/sqlQuery.enum';

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run(SqlQuery.CREATE_TABLE);
});

export default db;
