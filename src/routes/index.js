const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Suggestion = require('../models/Suggestion');
const Note = require('../models/Note');
const { isAuth, isAuthenticated } = require('../helpers/auth');
const Wallpapers = require('../models/Wallpaper');
const Jdespecial = require('../models/Jdespecial');



//Mostrar las notas, solo administradores
router.get('/notes', isAuth, async (req, res) =>{
	const notes = await Note.find({user: req.user.id}).sort({date: 'desc'});
	res.render('notes/all_notes', {notes});
});
//Mostrar JDespeciales-admin
router.get('/JDespeciales-adm', isAuth, async (req, res) =>{
	const secuela = await Wallpapers.find({},{secuela:1,_id:0});
	const jdespeciales = await Jdespecial.find().sort({date_add: 'desc'});
res.render('jdespeciales/jdespecialesadm', {secuela, jdespeciales});
});

//Mostrar JDespeciales-usuario
router.get('/JDespeciales', async (req, res) =>{
	const marvel = await Movie.find({category: 'marvel'}).sort({ link_view_count: 'asc'});
	const dccomics = await Movie.find({category: 'dccomics'}).sort({year: 'desc'});
	const jdanimada = await Jdespecial.find({category: 'Animada'}).sort({ date_add: 'desc' });
	const jdfantasia = await Jdespecial.find({category: 'Fantasia'}).sort({ date_add: 'desc' });
	const jdsuper = await Jdespecial.find({category: 'Superheroes'}).sort({ date_add: 'desc' });
	const jdaccion = await Jdespecial.find({category: 'Accion'}).sort({ date_add: 'desc' });
	const jdterror = await Jdespecial.find({category: 'Terror'}).sort({ date_add: 'desc' });
	const jdentretenimiento = await Jdespecial.find({category: 'Entretenimiento'}).sort({ date_add: 'desc' });
	res.render('jdespeciales', { marvel, dccomics, jdanimada, jdfantasia, jdsuper, jdaccion, jdterror, jdentretenimiento });
});

//Mostrar wallpapers
router.get('/wallpapers', isAuth, async (req, res) =>{
	const wallpapers = await Wallpapers.find();
	const compare = await Wallpapers.find({}, { secuela: 1, _id: 0 });
	const secuela = await Movie.find({},{secuela:1,_id:0});
	res.render('wallpapers/wallpapers', {secuela, wallpapers, compare});
});

//Crear nueva nota---------------
router.post('/notes/new_note', isAuth, async(req, res) =>{
	const {title, description, url} = req.body;
	const errors = [];
		const newNote = new Note({title, description});
		newNote.user = req.user.id;
		await newNote.save();
		req.flash('succes_msg', 'Nota agregada satisfactoriamente')
		res.redirect(url);
		console.log(url);
	
	
});

//Sugerencias-----------
router.get('/suggestions', isAuth, async (req, res) => {
	const suggestions = await Suggestion.find({state: {$ne:'Accepted'}}).sort({date_add: 'desc' });
	res.render('suggestions', {suggestions});
});

//Añadir sugerencias
router.post('/suggestion', async (req, res) => {
	const {name, email} = req.body;
	var {suggestion} = req.body;
	suggestion = suggestion.replace(/\n|\r/g, " ");
	const newSuggestion = new Suggestion({
		user : name,
		email : email,
		suggestion : suggestion
	});
	await newSuggestion.save();
	res.redirect('/');
});



//Aceptar sugerencia
router.get('/accept_sug/:id', async (req, res) => {
	const suggestion = await Suggestion.findByIdAndUpdate(req.params.id, { $push: {state : 'Accepted'}});
	req.flash('succes_msg', 'Sugerencia Aceptada');
	res.redirect('/suggestions');
});

//Rechazar sugerencia....
router.get('/decline_sug/:id', async (req, res) => {
	const suggestion = await Suggestion.findByIdAndDelete(req.params.id);
	req.flash('succes_msg', 'Sugerencia eliminada correctamente');
	res.redirect('/suggestions');
});

//Sugerencias aceptadas....
router.get('/suggestions/accepted', isAuth, async (req, res) => {
	const suggestions = await Suggestion.find({state: 'Accepted'}).sort({date_add: 'desc' });
	res.render('suggestions_accepted', {suggestions});
});

//Aviso legal-------------
router.get('/legal', (req, res) => {
	res.render('legal');
});

//Categorias ordenada por cronologia para cada pelicula-------------
router.get('/category/:cat/:chronology', async (req, res) => {
	const movies = await Movie.find({ category: req.params.cat }).sort({ link_view_count: 'desc' });
	const dest = await Movie.find({ views: { $gte: 20 } }).sort({ views: 'desc' }).limit(12);
	res.render('movies', { cat: req.params.cat, dest, movies });

});

//Buscador de peliculas---------

router.get('/:s', async (req, res) =>{
	const add1 = await Movie.find().sort({date_add: 'desc'}).limit(5);
	const add2 = await Movie.find().sort({date_add: 'desc'}).skip(5).limit(5);
	const add3 = await Movie.find().sort({date_add: 'desc'}).skip(10).limit(5);

	var result = req.query.s;
	result = result.replace(new RegExp(/[aáAÁ]/g), "[aáAÁ]");
	result = result.replace(new RegExp(/[eéEÉ]/g), "[eéEÉ]");
	result = result.replace(new RegExp(/[iíIÍ]/g), "[iíIÍ]");
	result = result.replace(new RegExp(/[oóOÓ]/g), "[oóOÓ]");
	result = result.replace(new RegExp(/[uúUÚ]/g), "[uúUÚ]");
	
	const movies = await Movie.find({title: {$regex:result, $options: 'iu'}});
	
	const dest = await Movie.find({views: {$gte:20}}).sort({views: 'desc'}).limit(12);
	res.render('movies', {s:req.query.s, movies, dest, add1, add2, add3});
	

});

//index----------
router.get('/', async (req, res) => {
	const add1 = await Movie.find().sort({date_add: 'desc'}).limit(5);
	const add2 = await Movie.find().sort({date_add: 'desc'}).skip(5).limit(5);
	const add3 = await Movie.find().sort({date_add: 'desc'}).skip(10).limit(5);
	const dest = await Movie.find({views: {$gte:20}}).sort({views: 'desc'}).limit(12);
	let perPage = 9;
	let page = req.params.page || 1;
	const all_movies =  await Movie.find().skip((perPage * page) - perPage).limit(perPage).sort({year: 'desc', date_add: 'desc' });
	const moviesp = await Movie.find().skip((perPage * page) - perPage).limit(perPage).sort({year: 'desc', date_add: 'desc' });
	await Movie.count().then(function ( count ){
	num_pages = parseInt((count/9)+1);
});

		res.render('movies',{all_movies, dest, num_pages, page, moviesp,add1,add2,add3});
});


//Categorias para cada pelicula-------------

router.get('/category/:cat', async (req, res) => {
	const add1 = await Movie.find().sort({date_add: 'desc'}).limit(5);
	const add2 = await Movie.find().sort({date_add: 'desc'}).skip(5).limit(5);
	const add3 = await Movie.find().sort({date_add: 'desc'}).skip(10).limit(5);
	const movies = await Movie.find({category:req.params.cat}).sort({date_add: 'desc' });
	const dest = await Movie.find({views: {$gte:20}}).sort({views: 'desc'}).limit(12);
	if(req.params.cat== 'marvel'){
		const movies = await Movie.find({ category: req.params.cat }).sort({ year: 'desc' });
		const dest = await Movie.find({ views: { $gte: 20 } }).sort({ views: 'desc' }).limit(12);
		res.render('movies', {cat:req.params.cat, dest, movies, add1, add2, add3});
	}else{
		const movies = await Movie.find({ category: req.params.cat }).sort({ date_add: 'desc' });
		const dest = await Movie.find({ views: { $gte: 20 } }).sort({ views: 'desc' }).limit(12);
		res.render('movies', {cat:req.params.cat, dest, movies, add1, add2, add3});
	}


});

//Paginación.....
router.get('/page/:page', async (req, res) => {
		const add1 = await Movie.find().sort({date_add: 'desc'}).limit(5);
	const add2 = await Movie.find().sort({date_add: 'desc'}).skip(5).limit(5);
	const add3 = await Movie.find().sort({date_add: 'desc'}).skip(10).limit(5);

	let perPage = 9;
	let page = req.params.page || 1;
	const dest = await Movie.find({views: {$gte:20}}).sort({views: 'desc'}).limit(12);
	const moviesp = await Movie.find().skip((perPage * page) - perPage).limit(perPage).sort({year: 'desc', date_add: 'desc' });
	await Movie.count().then(function ( count ){
	num_pages = parseInt((count/9)+1);
});
	res.render('movies', {moviesp, num_pages, page, dest, add1, add2, add3});
});



 
module.exports = router;
