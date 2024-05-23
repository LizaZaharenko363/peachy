import {Router} from 'express'
import { createNewComment, deleteCommentById, getComments, getAllComments } from '../controllers/comments.controller';   

const router = Router();

router.get('/comments',getAllComments)
router.get('/comments/:id',getComments)
router.post('/comments',createNewComment)
router.delete('/comments/:id',deleteCommentById)

export default router