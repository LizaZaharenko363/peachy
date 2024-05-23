import { Strategy as LocalStrategy } from 'passport-local';
import { getConnection, sql } from './database';

function initialize(passport) {
    const authenticateUser = async (username, password, done) => {
        try {
            console.log('Authenticating user:', username); 
            const pool = await getConnection();
            const result = await pool.request()
                .input('username', sql.NChar, username)
                .query('SELECT * FROM users WHERE name = @username');
            const user = result.recordset[0];

            if (!user) {
                console.log('No user found with username:', username); 
                return done(null, false, { message: 'Користувача не існує' });
            }

            console.log('User found:', user); 
            console.log('Comparing passwords:', password, user.password); 

            if (password === user.password) {
                console.log('Password match for user:', username);
                console.log("user",user.name)
                return done(null, user);
            } else {
                console.log('Password incorrect for user:', username);
                return done(null, false, { message: 'Пароль невірний' });
            }
        } catch (error) {
            console.error('Error authenticating user:', error); 
            return done(error);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.user_id));
    passport.deserializeUser(async (id, done) => {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM users WHERE user_id = @id');
            const user = result.recordset[0];

            if (user.name.trim() === 'admin') {
                user.isAdmin = true;
            } else {
                user.isAdmin = false;
            }

            done(null, user);
        } catch (error) {
            done(error);
        }
    });
}


export default initialize;
