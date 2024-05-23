export function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

export function checkNotAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

export function checkAdminAuth(req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.isAdmin) {
        return next();
    } else {
        res.redirect('/login');
    }
}
