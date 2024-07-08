
import Postgrator from "postgrator";
import { Client } from "pg";
import path from "path";

export async function main() {
  const client = new Client({
    host: "localhost",
    port: 5432,
    database: "harsh",
    user: "postgres",
    password: "123456",
  });

  try {
    await client.connect();
    console.log("database connection success !!!")
  } catch (error) {
    console.error(error);
  }

  const postgrator = new Postgrator({
    migrationPattern: path.resolve(__dirname + "../../../migrations/*"),
    driver: "pg",
    database: "harsh",
    schemaTable: "schemaversion",
    execQuery: (query) => client.query(query),
  });

    postgrator.on("migration-started", (migration) => console.log(migration));
    postgrator.on("migration-finished", (migration) => console.log(migration));

  try{
    console.log("logging , migration function started ")
    await postgrator.migrate();
    console.log("logging , migration function ended ") 
  }
  catch(err){
    console.log("some error while migration file creation ",err)
    process.exit(1)
  }

  await client.end();
}