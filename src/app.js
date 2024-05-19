// so here in this project we use nodemon it is a package which reloads the server after the file is saved so that we dont need to stop and restart it

import express from 'express'
import cookieParser from 'cookie-parser';
import cors from "cors"
const app = express();

// app.use() we use this methods for the configurations and for the middle wares
app.use(cors({
    origin:process.env.CORS_ORIGIN, //this points {kaha kaha se request aa sakti hai}
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



export { app }
