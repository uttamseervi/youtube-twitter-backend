import { Router } from "express"
import { addComment, getVideoComments, updateComment, deleteComment } from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT)
router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").patch(updateComment)
router.route("/c/:commentId").delete(deleteComment)


export default router