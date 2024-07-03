import express from 'express'
import routes from './Routes/FileRoutes';
import { fileupload, harsh } from './Controllers/FileController';
const app = express();

app.use(express.json());

app.use('/api', routes)

app.listen(3000, async () =>{
  await fileupload()
  console.log("file has been read",harsh)
  console.log('App started on port 3000.')
}
)
