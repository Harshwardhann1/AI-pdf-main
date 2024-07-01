import express from 'express'
import routes from './Routes/FileRoutes';
// import { resultcohere } from './File Handling/langchainEmbeddings';
const app = express();

app.use(express.json());
app.use('/api', routes)

app.listen(3000, () =>
  console.log('App started on port 3000.')
)
