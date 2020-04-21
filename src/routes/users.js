const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const { isAuthenticated } = require('../helpers/auth');
const { isAuth } = require('../helpers/auth');
var bcrypt = require('bcryptjs');
var moment = require('moment');

//Entrar - login-----------
router.get('/users/entrar', (req, res) => {
	res.render('users/entrar');
});

//Entrar - login-----------r
router.post('/users/entrar', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/users/entrar',
	failureFlash: true

}));

//Registrar usuario----------
router.get('/users/registrar', (req, res) => {
	res.render('users/registrar');
});

//Registrar administrador------------
router.get('/users/regadmin', isAuth, (req, res) => {
	res.render('users/regadmin');
});

//Mostrar usuarios - Administrador----------
router.get('/users/all_users', isAuth, async (req, res) => {
	const all_users = await User.find({}).sort({ date: 'desc' });
	const user_new = await User.find({}).sort({ date: 'desc' }).limit(3);
	const user_old = await User.find({}).sort({ date: 'asc' }).limit(3);
	res.render('users/all_users/1', { all_users, user_new, user_old });
});


//Buscados de usuarios----------
router.get('/users/search', isAuth, async (req, res) => {
	const users = req.query.user;
	const searchuser = await User.find({name: {$regex:users, $options: 'iu'}});
	res.render('users/all_users', {searchuser});
});

//Paginación usuarios admin.....
router.get('/users/all_users/:page', isAuth, async (req, res) => {
	let perPage = 9;
	let page = req.params.page || 1;
	const all_users = await User.find().skip((perPage * page) - perPage).limit(perPage).sort({date: 'desc' });
	await User.count().then(function ( count ){
	num_pages = parseInt((count/9)+1);
});
	res.render('users/all_users', {all_users, num_pages, page});

});

//Registrar usuario------------
router.post('/users/registrar', async (req, res) => {
	const { name, telephone, country, email, password, conf_password } = req.body;
	const errors = [];
	if (name.length <= 0) {
		errors.push({ text: 'Por favor inserte los datos' })
	}
	if (password != conf_password) {
		errors.push({ text: 'Las contraseñas deben coincidir' });
	}
	if (password.length < 4) {
		errors.push({ text: 'La contraseña debe tener minimo 4 caracteres' });
	}
	if (errors.length > 0) {
		res.render('users/registrar', { errors, name, email, password, conf_password });
	} else {
		const emailUser = await User.findOne({ email: email });
		if (emailUser) {
			req.flash('error', 'Este email ya esta en uso');
			res.redirect('/users/registrar');
		} else {
			const newUser = new User({name, telephone, country, email, password });
			newUser.password = await newUser.encryptPassword(password);
			newUser.typeuser = '';
			await newUser.save();
			req.flash('succes_msg', 'Tu usuario ha sido registrado');
			res.redirect('/');
		}
	}


});

//Registrar Administrador----------
router.post('/users/regadmin', async (req, res) => {
	const { name, email, password, conf_password } = req.body;
	const errors = [];
	if (name.length <= 0) {
		errors.push({ text: 'Por favor inserte los datos' })
	}
	if (password != conf_password) {
		errors.push({ text: 'Las contraseñas deben coincidir' });
	}
	if (password.length < 4) {
		errors.push({ text: 'La contraseña debe tener minimo 4 caracteres' });
	}
	if (errors.length > 0) {
		res.render('users/regadmin', { errors, name, email, password, conf_password });
	} else {
		const emailUser = await User.findOne({ email: email });
		if (emailUser) {
			req.flash('error', 'Email ya registrado');
			res.redirect('/users/regadmin');
		} else {
			const newUser = new User({ name, email, password });
			newUser.password = await newUser.encryptPassword(password);
			newUser.typeuser = 'user';
			await newUser.save();
			req.flash('succes_msg', 'Administrador registrado correctamente');
			res.redirect('/users/all_users/1');
		}

	}
});

//Mostrar usuario - Administrador-------
router.get('/users/show_user/:id', isAuth, async (req, res) => {
	const usuario = await User.findById(req.params.id);
	res.render('users/show_user', { usuario});
});


//Mi perfil - usuario ------------
router.get('/users/myperf', isAuthenticated, async (req, res) => {
	res.render('users/myperf');
});


//Editr usuario-----------------
router.get('/users/edit_user/:id', isAuthenticated, async (req, res) => {
	const usuario = await User.findById(req.params.id);
	res.render('users/edit_user', { usuario });
});

//Editr usuario - Administrador -----------------
router.put('/users/edit_user/:id', isAuth, async (req, res) => {
	const { name, telephone, country } = req.body;
	await User.findByIdAndUpdate(req.params.id, { name, telephone, country });
		req.flash('succes_msg', 'Usuario actualizado satisfactoriamente');
		res.redirect('/users/all_users/1');
	
});

//Editr mi perfil-------------
router.put('/users/edit_myuser/:id', isAuthenticated, async (req, res) => {
	const { name, telephone, country } = req.body;
	await User.findByIdAndUpdate(req.params.id, { name, telephone, country });
		req.flash('succes_msg', 'Datos actualizados satisfactoriamente');
		res.redirect('/users/myperf');
	
});

//Convertir en Administrador - Administrador -----------
router.put('/users/conv_adm/:id', isAuth, async (req, res) => {
	const  typeuser = 'user';
	const usuario = await User.findById(req.params.id);
	await User.findByIdAndUpdate(req.params.id, { typeuser });
		req.flash('succes_msg', 'Usuario ' + usuario.name + ' convertido en administrador');
		res.redirect('/users/all_users/1');
	
});

//Eliminar usuario ------------
router.get('/users/delete_user/:id', isAuthenticated, async (req, res) => {
	const usuario = await User.findById(req.params.id);
	res.render('users/delete_user', { usuario });
});

//Eliminar usuario ------------
router.delete('/users/delete_user/:id', isAuthenticated, async (req, res) => {
	await User.findByIdAndDelete(req.params.id)
	req.flash('succes_msg', 'Usuario eliminado satisfactoriamente');
	res.redirect('/');

});

//Rutas para myerf actualizar, eliminar y salir
router.put('/users/edit_pas/:id', isAuth, async (req, res) => {
	const usuario = await User.findById(req.params.id);
	const { pas_act, pass_new, pas_newr } = req.body;
	const Usuario = new User({ password });

	if (bcrypt.compareSync(pas_act, usuario.password)) {
		if (pass_new == pas_newr) {
			Usuario.password = await Usuario.encryptPassword(pass_new);
			var password = Usuario.password;
			await User.findByIdAndUpdate(req.params.id, {password});
			req.flash('succes_msg', password);
			res.redirect('/users/myperf');
		} else {
			req.flash('error', 'Las contraseñas no coinciden');
			res.redirect('/users/myperf');
		}
		req.flash('succes_msg', 'Contraseña actual correcta');
		res.redirect('/users/myperf');
	} else {
		req.flash('error', 'La contraseña actual no es correcta');
		res.redirect('/users/myperf');
	}

});

//Editar contraseña de usuario (Administrador)
router.put('/users/edit_pas_adm/:id', isAuth, async (req, res) => {
	const usuario = await User.findById(req.params.id);
	const { pass_new, pas_newr } = req.body;
	const Usuario = new User({ password });

		if (pass_new == pas_newr) {
			Usuario.password = await Usuario.encryptPassword(pass_new);
			var password = Usuario.password;
			await User.findByIdAndUpdate(req.params.id, {password});
			req.flash('succes_msg', 'Usuario actualizado correctamente');
			res.redirect('/users/all_users/1');
		} else {
			req.flash('error', 'Las contraseñas no coinciden');
			res.redirect('/users/show_user/'+req.params.id);
		}
});
//Eliminar usuario - Administrador -------------
router.delete('/users/delete/:id', isAuth, async (req, res) => {
	await User.findByIdAndDelete(req.params.id)
	req.flash('succes_msg', 'Usuario eliminado correctamente');
		res.redirect('/users/all_users/1');

});

//Salir de la cuenta - Log Out------
router.get('/users/salir', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;