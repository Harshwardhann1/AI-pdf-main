import { error } from 'console'
import { response } from 'express'
import {Pool} from 'pg'


export const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "harsh",
    user: "postgres",
    password: "123456",
})

export const connect = pool.query("SELECT NOW()", (error, response) => {
    if(!error) {
        console.log('Connection successfull')
    }
    else {
        console.log('Connection error')
    }
})