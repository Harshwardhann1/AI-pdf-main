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

export const queryData = async (req: Request, res: Response) => {
  try {
    const question: any = await embeddings.embedQuery(req.body.query);
    const index = pc.index('cricket');

    const queryResponse = await index.namespace('ns1').query({
      vector: question,
      topK: 2,
    });

    const match = queryResponse.matches;
    console.log(match);

    const rest = match.map((e) => harsh[parseInt(e.id)]);

    const userParagraph = `I am harsh and I am expected to answer the question based on the paragraph. This is the paragraph: ${rest.join(' ')}`;
    const rules = `If there is no context in the paragraph related to the topic or question then reply with "I don't have enough information on that." Make the response based on the paragraph. In case there are other queries from the user, for example:
    "Question": "What is God"
    "Answer": "I don't have information about this topic."`;

    const promptText = `
    User Information:
    ${userParagraph}

    Questions or topic related to which I want the response:
    ${req.body.query}

    Rules for answering the question:
    ${rules}
    `;

    console.log("Constructed Prompt:", promptText);

    const prompt = ChatPromptTemplate.fromMessages([ promptText ]);

    const chain = prompt.pipe(model); 

    const response = await chain.invoke({ prompt: promptText });

    res.status(200).send(response.content);
  } catch (error) {
    console.log(error); 
    res.status(404).send(error);
  }
};
