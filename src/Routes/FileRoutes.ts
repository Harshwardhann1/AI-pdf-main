import { Router } from "express";
import { upload } from "../File Handling/multer";
import { extraction, fileupload, queryData, upsertData } from "../Controllers/FileController";

const routes = Router();

routes.post('/upload', upload.single('file'), fileupload)
routes.get('/extraction', extraction)
routes.get('/upsert', upsertData)
routes.post('/query',(req,res)=> queryData(req,res))


export default routes;