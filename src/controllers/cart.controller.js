import { getConnection, sql, queries } from '../database';

export const addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    if (!userId) {
        return res.status(400).send('User not authenticated');
    }

    try {
        const pool = await getConnection();
        const checkCartItemResult = await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query(queries.checkCartItemQuery);

        if (checkCartItemResult.recordset.length > 0) {
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('productId', sql.Int, productId)
                .input('quantity', sql.Int, quantity)
                .query(queries.updateCartItemQuery);
        } else {
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('productId', sql.Int, productId)
                .input('quantity', sql.Int, quantity)
                .query(queries.insertCartItemQuery);
        }

        res.status(200).send('Product added to cart successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const removeFromCart = async (req, res) => {
    const { cartItemId } = req.params;
    try {
        const pool = await getConnection();
        await pool.request()
            .input('cartItemId', sql.Int, cartItemId)
            .query(queries.deleteCartItemQuery);

        res.status(204).send('Product removed from cart successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const getCartContents = async (req, res) => {
    const { userId } = req.params;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(queries.getCartContentsQuery);

        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const clearCart = async (req, res) => {
    const { userId } = req.params;

    try {
        const pool = await getConnection();
        await pool.request()
            .input('userId', sql.Int, userId)
            .query('EXEC ClearCart @userId');

        res.status(204).send('Cart cleared successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const editCartItem = async (req, res) => {
    const { cartItemId, quantity } = req.body;

    try {
        await pool.request()
            .input('quantity', sql.Int, quantity)
            .input('cartItemId', sql.Int, cartItemId)
            .query(queries.updateCartItemQuantityQuery);
            console.log("COMPLETED UPDATE")
        res.status(200).send('Cart item updated successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
};
