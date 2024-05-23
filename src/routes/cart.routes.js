import { Router } from 'express';
import { addToCart, removeFromCart, getCartContents, editCartItem } from '../controllers/cart.controller';


const router = Router();

router.post('/add-to-cart', addToCart);
router.delete('/remove-from-cart/:cartItemId', removeFromCart);
router.get('/cart-contents/:userId', getCartContents);
router.put('/upd-cart/:cartItemId', editCartItem);


export default router;