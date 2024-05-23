import { getConnection, sql, queries } from "../database"; 

export const getComments = async (req,res)=>{
    const { id } = req.params;
    try {
        const pool = await getConnection()
        const result= await pool.request().input("product_id", sql.Int, id).query(queries.getAllComments)

        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}
export const getAllComments = async (req,res)=>{
    try {
        const pool = await getConnection()
        const result= await pool.request().query(queries.getEveryComment)

        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export const createNewComment = async (req, res) => {
    const { comment, product_id, user_id } = req.body;

    if (comment == null || product_id == null || user_id == null) {
        return res.status(400).json({ msg: 'Bad Request. Fill all fields' });
    }

    try {
        const pool = await getConnection();
        const result = await pool
            .request()
            .input("comment", sql.Text, comment)
            .input("product_id", sql.Int, product_id)
            .input("user_id",sql.Int, user_id)
            .query(queries.createNewComment);

        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            res.status(201).json({ comment, product_id });
        } else {
            res.status(500).send("Failed to create a new comment"); 
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const deleteCommentById = async (req, res) => {
    const { id } = req.params;
    console.log("Deleting comment with id:", id);

    try {
        const pool = await getConnection();
        const result = await pool
            .request()
            .input("comment_id", sql.Int, id)
            .query(queries.deleteComment);

        console.log("Result:", result); 

        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            res.sendStatus(204); 
        } else {
            res.status(404).send("Comment not found");
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send(error.message);
    }
};

