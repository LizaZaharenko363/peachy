import express from 'express';
import path from 'path';
import axios from 'axios';
import productRoutes from './routes/products.routes';
import categoryRoutes from './routes/categories.routes';
import commentRoutes from './routes/comments.routes';
import userRoutes from './routes/users.routes';
import cartRoutes from './routes/cart.routes';
import { getConnection, sql , queries} from './database';
import initializePassport from './passport-config';
import { checkAuth, checkNotAuth, checkAdminAuth } from './middlewares/auth';

const app = express();
const passport = require('passport');

const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

initializePassport(passport);

app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.post('/login', checkNotAuth, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}), (req, res) => {
    console.log('Login attempt:', req.body.username);
});

app.post('/register', checkNotAuth, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('username', sql.NChar, req.body.username)
            .input('password', sql.NVarChar, req.body.password)
            .query('INSERT INTO users (name, password) VALUES (@username, @password); SELECT SCOPE_IDENTITY() AS userId;');
        const userId = result.recordset[0].userId;
        res.redirect(`/register-details/${userId}`);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/register-details/:userId', (req, res) => {
    const userId = req.params.userId;
    const user = req.user || null;
    res.render('register-details', { userId: userId, user: user });
});

app.post('/register-details/:userId', async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const { full_name, address_city, full_address, phone_num } = req.body;

        const pool = await getConnection();
        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .input('full_name', sql.Text, full_name)
            .input('address_city', sql.Text, address_city)
            .input('full_address', sql.Text, full_address)
            .input('phone_num', sql.Text, phone_num)
            .query('UPDATE customers SET full_name = @full_name, address_city = @address_city, full_address = @full_address, phone_num = @phone_num WHERE user_id = @user_id');

        if (result.rowsAffected[0] > 0) {
            const userResult = await pool.request()
                .input('user_id', sql.Int, userId)
                .query('SELECT * FROM users WHERE user_id = @user_id');

            const user = userResult.recordset[0];
            if (user) {
                req.login(user, (err) => {
                    if (err) {
                        return next(err);
                    }
                    return res.redirect('/');
                });
            } else {
                res.status(404).send('User not found in users table');
            }
        } else {
            res.status(404).send('User not found in customers table');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/', async (req, res) => {
    try {
        const user = req.user;

        const categoriesResponse = await axios.get('http://localhost:3000/category');
        const categories = categoriesResponse.data;
        res.render('home', { user: user, isAdmin: user && user.isAdmin === 'true', categories: categories });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/about', async (req, res) => {
    try {
        const user = req.user;
        res.render('about_us', { user: user});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/register', checkNotAuth, (req, res) => {
    res.render('register' , { user: req.user || null });
});

app.get('/login', checkNotAuth, (req, res) => {
    res.render('login' , { user: req.user || null });
});

app.delete('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

app.get('/admin-users', checkAdminAuth, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT user_id, name FROM users');
        const users = result.recordset;

        res.render('admin-users', { users: users, user: req.user || null });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/admin-comms', checkAdminAuth, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT comment_id, comment FROM Comment');
        const comments = result.recordset;

        res.render('admin-comments', { comments: comments, user: req.user || null });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/search', async (req, res) => {
    const query = req.query.query;
    if (!query || query.trim() === '') {
        return res.render('search-results', {
            products: [],
            user: req.user || null,
            message: 'Введіть товар для пошуку'
        });
    }

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('query', sql.NVarChar, `%${query}%`)
            .query('SELECT * FROM product WHERE product_name LIKE @query');

        res.render('search-results', { products: result.recordset, user: req.user || null, message: null });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/users/:id', checkAdminAuth, async (req, res) => {
    const userId = req.params.id;

    try {
        const pool = await getConnection();
        await pool.request()
            .input('user_id', sql.Int, userId)
            .execute('deleteUserData');

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/comments/:id', checkAdminAuth, async (req, res) => {
    const commId = req.params.id;

    try {
        const pool = await getConnection();
        await pool.request()
            .input('comment_id', sql.Int, commId)
            .query('DELETE From [Makeup].[dbo].[Comment] Where comment_id = @comment_id');

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put('/upd-cart-item/:cartItemId', async (req, res) => {
    const { cartItemId, quantity } = req.body;
    const userId = req.user.user_id;
    
    try {
        const pool = await getConnection();
        await pool.request()
            .input('quantity', sql.Int, quantity)
            .input('cartItemId', sql.Int, cartItemId)
            .query(`UPDATE cart_item
            SET quantity = quantity + @quantity
            WHERE cart_item_id = @cartItemId`);

        const updatedCart = await getUpdatedCart(userId);
        res.status(200).json(updatedCart);
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});
app.delete('/cart-item/:cartItemId', async (req, res) => {
    const cartItemId = req.params.cartItemId;

    try {
        const pool = await getConnection();
        await pool.request()
            .input('cartItemId', sql.Int, cartItemId)
            .query('DELETE FROM cart_item WHERE cart_item_id = @cartItemId');

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/cart/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const pool = await getConnection();
        await pool.request()
            .input('user_id', sql.Int, userId)
            .execute('PlaceOrder');

        res.status(200).json({ message: 'Order made' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

async function getUpdatedCart(userId) {
    const cartResponse = await axios.get(`http://localhost:3000/cart-contents/${userId}`);
    return cartResponse.data;
}


app.get('/:id/products', async (req, res) => {
    try {
        const { id } = req.params;
        const categoriesResponse = await axios.get(`http://localhost:3000/category/${id}`);
        const category = categoriesResponse.data;
        const categoryName = category[0].category_name;
        const categoryId = category[0].category_id;
        const sorted = req.query.sorted || 'def';
        
        const productsUrl = `http://localhost:3000/category/${id}/products?sorted=${sorted}`;
        
        const productsResponse = await axios.get(productsUrl);
        const products = productsResponse.data;

        const user = req.user;

        res.render('category-products', { user: user, products: products, categoryName: categoryName, categoryId: categoryId});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/product/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const productResponse = await axios.get(`http://localhost:3000/products/${id}`);
        const product = productResponse.data;
        const user = req.user;

        const pool = await getConnection();
        const commentsResult = await pool.request()
            .input("product_id", sql.Int, id)
            .query('SELECT Comment.comment, Comment.date, Users.name FROM Comment JOIN Users ON Comment.user_id = Users.user_id WHERE product_id = @product_id');
        
        const comments = commentsResult.recordset;

        res.render('product-details', { user: user, product: product, comments: comments });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/comments-post', checkAuth, async (req, res) => {
    try {
        const { comment, product_id, user_id } = req.body;

        const response = await axios.post('http://localhost:3000/comments', {
            comment,
            product_id,
            user_id
        });

        if (response.status === 201) {
            res.redirect(`/product/${product_id}`);
        } else {
            res.status(response.status).send(response.data);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/product/:id', checkAuth, async (req, res) => {
    const userId = req.body.userId;
    const productId = req.params.id;
    const quantity = req.body.quantity;

    try {
        const response = await axios.post('http://localhost:3000/add-to-cart', {
            userId,
            productId,
            quantity
        });

        res.redirect('/cart')
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/cart', checkAuth, async (req, res) => {
    const userId = req.user.user_id;
    try {
        const cartResponse = await axios.get(`http://localhost:3000/cart-contents/${userId}`);
        const userCart = cartResponse.data;

        const pool = await getConnection();
        const totalResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT dbo.CalculateTotalPrice(@userId) AS totalPrice');
        
        const totalPrice = totalResult.recordset[0].totalPrice;
        res.render('user-cart', { user: req.user, userCart: userCart, totalPrice: totalPrice, pool: pool });
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.use(productRoutes);
app.use(categoryRoutes);
app.use(commentRoutes);
app.use(cartRoutes);
app.use(userRoutes);
app.use(express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(err);
});

export default app;