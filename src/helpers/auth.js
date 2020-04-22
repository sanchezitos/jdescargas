const helpers = {};
helpers.isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'No autorizado');
    res.redirect('/users/entrar');
};
helpers.isAuth = (req, res, next) => {
    if(req.user.typeuser == 'user') {
        return next();
    }else{
        req.flash('error_msg', 'No autorizado');
        res.redirect('/');
    }
        
    
   
};
module.exports = helpers;