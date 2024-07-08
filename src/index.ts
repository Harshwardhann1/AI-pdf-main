import express from 'express'
import routes from './Routes/FileRoutes';
import { fileupload, harsh } from './Controllers/FileController';
import { main } from './db/migration';
const app = express();

app.use(express.json());

app.use('/api', routes)

app.listen(3000, async () =>{
  await main()
  await fileupload()
  console.log("file has been read",harsh)
  console.log('App started on port 3000.')
}
)
