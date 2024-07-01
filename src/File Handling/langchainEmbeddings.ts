import {CohereEmbeddings,Cohere} from '@langchain/cohere'

export const embeddings = new CohereEmbeddings({
  apiKey: "ZbaN2Epb7G6rP3XGki3SSDxqLFAi6df1LsgelhSZ",
  batchSize: 48
})

// const cohere = new Cohere({
//   apiKey: "ZbaN2Epb7G6rP3XGki3SSDxqLFAi6df1LsgelhSZ",
// })

// export const resultcohere =async()=>await cohere.invoke(
//    "tell me a joke"
// )