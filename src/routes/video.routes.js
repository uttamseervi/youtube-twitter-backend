import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { publishVideo, deleteVideo, getAllVideos, getVideoById, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";


const router = Router()
router.use(verifyJWT);
router.route("/").get(getAllVideos)
router.route("/upload").post(
    upload.fields(
        [
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 }
        ]
    ),
    publishVideo
)
router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus)


export default router