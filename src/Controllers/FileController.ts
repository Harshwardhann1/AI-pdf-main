import fs from 'fs';
import pdf from 'pdf-parse';
import { Request, Response } from 'express';
import { embeddings } from '../File Handling/langchainEmbeddings';
import { Pinecone } from '@pinecone-database/pinecone';
import { ChatCohere } from '@langchain/cohere';
import { ChatPromptTemplate } from "@langchain/core/prompts";

// let extractedText: any;
let refined: any;
export let harsh: any[] = [];

export const fileupload = async (req:any='', res: any="") => {
  try {
    const databuffer = fs.readFileSync(
      '/home/essence/Desktop/AI-pdf-main/uploads/file.pdf'
    );
    const data: any = await pdf(databuffer);
    refined = data.text.split(" ");

    for (let i = 0; i < refined.length; i += 200) {
      harsh.push(refined.slice(i, i + 200).join(" "));
    }
    if(res="")
    res.status(200).send('File uploaded successfully');
  } catch (err) {
    console.error('Error processing file:', err);
    if(res="")
    res.status(500).send('Error processing file');
  }
};

let res1: any[][] = [];

export const extraction = async (req: Request, res: Response) => {
  try {
    const documentRes = await embeddings.embedDocuments(harsh);
    console.log(documentRes)
    res1 = documentRes;
    return res.send({ res1 });
  } catch (error) {
    console.error("------------->>>>>>.",error);
    return res.status(500).send(error);
  }
};

const pc = new Pinecone({
  apiKey: '6a1f7b7d-8de0-4181-a35b-febd57bac350',
});

export const upsertData = async (req: Request, res: Response) => {
  try {
    const indexName: any = 'cricket';

    const indexex = await pc.listIndexes();
    if (!indexex.indexes?.includes(indexName)) {
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
      await pc.index(indexName).namespace('ns1').upsert([
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
      console.error('Pinecone Error:', error);
    } else {
      console.error('Unknown Error:', error);
    }
    res.status(500).send('Error embedding vectors');
  }
};


const model = new ChatCohere({
  apiKey: "Wsv2XSZ3HExFXDTyuWEqO26nEOlBcrsT1g1P0muA",
  model: "command"
})

export const queryData = async(req: Request, res: Response) => {
try {

  const question:any = await embeddings.embedQuery(req.body.query)
  const index = pc.index('cricket')

  const queryResponse = await index.namespace('ns1').query({
    vector: question,
    topK: 3,
    includeValues: true
  })

  const match = queryResponse.matches;
  console.log(match)
  const rest = match.map((e) => harsh[parseInt(e.id)])


  const prompt = ChatPromptTemplate.fromMessages([req.body.query])
  const chain = prompt.pipe(model);

  const refrain = [`######REFRAIN###### if a user is asking anything which is not related to ${rest} then reply with "Sorry I dont have enough information about this topic."`]

  const special = [`######EVERYDAY###### if a user is greeting or saying some positive things , then reply as a human answering gracefully.`]
  const response = await chain.invoke({
    input: `#######MAIN###### Here is the user question ${req.body.query} and the realted context is in ${rest}. You task is to make the sentence meaningful. The major things which should be taken care of before generating a response are ${refrain} and ${special}`
  })
  res.status(200).send(response.content)
} catch (error) {
  console.log(error); 
  res.status(404).send(error)
 } 
}



