import fs from 'fs';
import pdf from 'pdf-parse';
import { Request, Response } from 'express';
import { embeddings } from '../File Handling/langchainEmbeddings';
import { Pinecone } from '@pinecone-database/pinecone';


let extractedText: any;

export const fileupload = async (req: Request, res: Response) => {
  try {
    let databuffer = fs.readFileSync(
      '/home/essence/Desktop/AI-pdf-main/uploads/file.pdf'
    );
    const data = await pdf(databuffer);
    extractedText = data.text.split('.')
    console.log('Extracted Text:', extractedText);

    res.status(200).send('File uploaded successfully');
  } catch (err) {
    console.error('Error processing file:', err);
    res.status(500).send('Error processing file');
  }
};

let res1: any[][] = [];
// let arrayofextraction;

export const extraction = async(req: Request, res: Response)=> {
  try {
    console.log('------> fist lineof try')
  
    const documentRes = await embeddings.embedDocuments(extractedText);
    console.log(documentRes)
    res1 = documentRes;
    return res.send({res1})
  } catch (error) {
    console.log(error)
    return res.send(error)
  }
  
}


const pc = new Pinecone({
  apiKey: '6a1f7b7d-8de0-4181-a35b-febd57bac350',
});

export const upsertData = async (req: Request, res: Response) => {
  try {
    const indexName :any= 'test11';

    const indexex= await pc.listIndexes()
    if(indexex.indexes?.includes(indexName)){
      await pc.createIndex({
        name: indexName,
        dimension: 1024,
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });
      console.log('Created index:', indexName);
    }

    for (let i = 0; i < res1.length; i++) {
      await pc
        .index(indexName)
        .namespace('ns1')
        .upsert([
          {
            id: JSON.stringify(i),
            values: res1[i],
          },
        ]);
      console.log(`Upserted vector ${i}:`, res1[i]);
    }

    res.status(200).send('Vectors embedded successfully');
  } catch (error) {
    if (error instanceof Pinecone) {
      console.error(error);
    } else {
      console.error('Unknown Error:', error);
    }
    res.status(500).send('Error embedding vectors');
  }
};

const index = pc.index('test11');
export const queryData = async (req: Request, res: Response) => {
  const res2q = await embeddings.embedQuery('Imagine you are Gerrard. Tell your friend what happened when the Intruder broke  into your  house.');
  console.log(res2q);

  const queryResponse = await index.namespace('ns1').query({
    topK: 3,
    vector: res2q,
  });
  const arro=queryResponse.matches
  const rest=arro.map((e:any)=> extractedText[e.id])
  return res.send(rest);
};

