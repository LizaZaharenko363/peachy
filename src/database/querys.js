export const queries = {
    getAllProducts: 'SELECT * FROM Product',
    addNewProduct: 'INSERT INTO Product (product_name, category_id, price, description, quantity) VALUES (@name, @category, @price, @description, @quantity)',
    getProductById: 'SELECT * FROM Product Where product_id = @id',
    deleteProduct: 'DELETE FROM [Makeup].[dbo].[Product] Where product_id = @id',
    updateProduct: 
    'UPDATE Product SET product_name = @name, category_id = @category, price = @price, description = @description, quantity = @quantity WHERE product_id = @id',
    getAllCategories: 'SELECT * FROM Categories',
    getProductByCategory: 'SELECT * From Product WHERE category_id = @id',
    getCategory: 'SELECT * FROM Categories WHERE category_id=@id',
    getAllComments:'SELECT Comment.comment, Comment.date, Users.name FROM Comment JOIN Users ON Comment.user_id = Users.user_id WHERE product_id = @id',
    getEveryComment:'SELECT * From Comment',
    createNewComment: 'INSERT INTO Comment (comment,product_id, user_id) VALUES (@comment,@product_id, @user_id)',
    deleteComment:'DELETE From [Makeup].[dbo].[Comment] Where comment_id = @comment_id',
    checkCartItemQuery: `
        SELECT * FROM cart_item 
        WHERE cart_id IN (SELECT cart_id FROM shopping_cart WHERE user_id = @userId)
        AND product_id = @productId`,
    updateCartItemQuery: `
        UPDATE cart_item
        SET quantity = quantity + @quantity
        WHERE cart_id IN (SELECT cart_id FROM shopping_cart WHERE user_id = @userId)
        AND product_id = @productId`,
    insertCartItemQuery: `
        INSERT INTO cart_item (cart_id, product_id, quantity)
        VALUES ((SELECT cart_id FROM shopping_cart WHERE user_id = @userId), @productId, @quantity)`,
    deleteCartItemQuery : `
        DELETE FROM cart_item
        WHERE cart_item_id = @cartItemId`,
    getCartContentsQuery: `
        SELECT ci.cart_item_id, p.product_name, p.price, ci.quantity
        FROM cart_item ci
        JOIN product p ON ci.product_id = p.product_id
        WHERE ci.cart_id IN (SELECT cart_id FROM shopping_cart WHERE user_id = @userId)`,
        updateCartItemQuantityQuery: `
        UPDATE cart_item
        SET quantity = quantity + @quantity
        WHERE cart_item_id = @cartItemId
    `,

}