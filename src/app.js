import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';



const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());


// IMPORTING THE ROUTER
import userRoutes from './routes/user.routes.js'
import videoRoutes from "./routes/video.routes.js"
import tweetRoutes from "./routes/tweet.routes.js"
import likeRoutes from "./routes/like.routes.js"
import commentRoutes from "./routes/comment.routes.js"
import playlistRoutes from "./routes/playlist.routes.js"
import subscriptionRoutes from "./routes/subscription.routes.js"



// router declaration
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/videos", videoRoutes)
app.use("/api/v1/tweet", tweetRoutes)
app.use("/api/v1/comment", commentRoutes)
app.use("/api/v1/like", likeRoutes)
app.use("/api/v1/playlist", playlistRoutes)
app.use("/api/v1/subscription", subscriptionRoutes)




export { app };
