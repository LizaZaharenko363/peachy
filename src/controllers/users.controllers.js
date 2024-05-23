import { getConnection, sql } from '../database';

export const deleteUser = async (req, res) => {
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
};
