import { pool } from "./connection";


export const insertData =  (text: any) => {
    const query = `INSERT INTO "pdf" ("text", "createBy") VALUES(${text}, 1) RETURNING *`;
    pool.query(query)
    .then((data:any)=> {
        console.log('Data inserted successfully')
    }).catch(error => {
        console.log("-=-=-=-=-=-=-=-=-=--=-"+error)
    })  
}