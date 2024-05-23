import {Router} from 'express'
import { getCategories, getProductsByCategory, getCategoryById } from '../controllers/categories.controller';   

const router = Router();

router.get('/category',getCategories)
router.get('/category/:id/products',getProductsByCategory)
router.get('/category/:id',getCategoryById)

export default router