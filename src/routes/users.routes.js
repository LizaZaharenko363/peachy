import { Router } from 'express';
import { deleteUser } from '../controllers/users.controllers';
import { checkAdminAuth } from '../middlewares/auth';

const router = Router();

router.delete('/users/:id', checkAdminAuth, deleteUser);

export default router;