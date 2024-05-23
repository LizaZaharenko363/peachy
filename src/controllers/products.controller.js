import { getConnection, sql, queries } from "../database"; 

export const getProducts = async (req,res)=>{
    try {
        const pool = await getConnection()
        const result= await pool.request().query(queries.getAllProducts)

        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export const createNewProduct = async (req,res)=>{
    const { name, description, price, category}=req.body
    let {quantity}=req.body
    

    if(name==null || description== null || price== null || category == null){
        return res.status(400).json({msg:'Bad Request. Fill all fields'})
    }
    if (quantity == null) quantity =0;
    try {
        const pool = await getConnection()
    await pool.request()
    .input("name", sql.VarChar, name)
    .input("category",sql.Int, category)
    .input("price",sql.Float, price)
    .input("description", sql.Text, description)
    .input("quantity",sql.Int, quantity)
    .query(queries.addNewProduct)

    res.json({name, price, description,quantity})
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export const getProductById = async (req,res)=>{
    const {id} = req.params
    const pool = await getConnection()
    const result = await pool.request()
    .input("id", id)
    .query(queries.getProductById)

    res.send(result.recordset[0])
}

export const deleteProductById = async (req,res)=>{
    const {id} = req.params
    const pool = await getConnection()
    const result = await pool.request()
    .input("id", id)
    .query(queries.deleteProduct)

    res.sendStatus(204)
}

export const updateProductById = async (req,res)=>{
    const { name, description, price, category, quantity}=req.body
    const {id} = req.params

    if(name==null || description== null || price== null || category == null || quantity ===null){
        return res.status(400).json({msg:'Bad Request. Fill all fields'})
    }
    
    try {
        const pool = await getConnection()
    await pool.request()
    .input("name", sql.VarChar, name)
    .input("category",sql.Int, category)
    .input("price",sql.Float, price)
    .input("description", sql.Text, description)
    .input("quantity",sql.Int, quantity)
    .input("id", id)
    .query(queries.updateProduct)

    res.json({name, price, description,quantity})
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}