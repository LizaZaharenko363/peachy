import { getConnection, sql, queries } from "../database"; 

export const getCategories = async (req,res)=>{
    try {
        const pool = await getConnection()
        const result = await pool.request()
        .query(queries.getAllCategories)

        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export const getProductsByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { sorted } = req.query;
        
        const pool = await getConnection();
        let query = `SELECT * FROM product WHERE category_id = @id`;

        if (sorted === 'inc') {
            query += ' ORDER BY price ASC';
        } else if (sorted === 'dec') {
            query += ' ORDER BY price DESC';
        }

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(query);

        res.json(result.recordset);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export const getCategoryById = async (req,res)=>{
    try {
        const {id} = req.params
        const pool = await getConnection()
        const result = await pool.request().input("id", id).query(queries.getCategory)

        res.json(result.recordset)
    } catch (error) {
        res.send(error.message)
    }
}