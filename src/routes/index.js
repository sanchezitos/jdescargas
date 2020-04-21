const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Suggestion = require('../models/Suggestion');
const Note = require('../models/Note');
const { isAuth, isAuthenticated } = require('../helpers/auth');

//index----------
router.get('/', async (req, res) => {
	const dest = await Movie.find({views: {$gte:20}}).sort({views: 'desc'}).limit(12);
	let perPage = 9;
	let page = req.params.page || 1;
	const all_movies =  await Movie.find().skip((perPage * page) - perPage).limit(perPage).sort({date_add: 'desc' });
	const moviesp = await Movie.find().skip((perPage * page) - perPage).limit(perPage).sort({date_add: 'desc' });
	await Movie.count().then(function ( count ){
	num_pages = parseInt((count/9)+1);
});

		res.render('movies',{all_movies, dest, num_pages, page, moviesp});
});
//Mostrar las notas, solo administradores
router.get('/notes', isAuth, async (req, res) =>{
	const notes = await Note.find({user: req.user.id}).sort({date: 'desc'});
	res.render('notes/all_notes', {notes});
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
router.get('/suggestions', async (req, res) => {
	const suggestions = await Suggestion.find().sort({date_add: 'desc' });
	res.render('suggestions', {suggestions});
});

//Aviso legal-------------
router.get('/legal', (req, res) => {
	res.render('legal');
});

//Buscador de peliculas---------

router.get('/:s', async (req, res) =>{
	const movies = await Movie.find({title: {$regex:req.query.s, $options: 'iu'}});
	const dest = await Movie.find({views: {$gte:20}}).sort({views: 'desc'}).limit(12);
	res.render('movies', {s:req.query.s, movies, dest});

});

//Categorias para cada pelicula-------------

router.get('/category/:cat', async (req, res) => {
	const movies = await Movie.find({category:req.params.cat}).sort({date_add: 'desc' });
	const dest = await Movie.find({views: {$gte:20}}).sort({views: 'desc'}).limit(12);
	res.render('movies', {cat:req.params.cat, dest, movies});

});

//Paginación.....
router.get('/page/:page', async (req, res) => {
	let perPage = 9;
	let page = req.params.page || 1;
	const dest = await Movie.find({views: {$gte:20}}).sort({views: 'desc'}).limit(12);
	const moviesp = await Movie.find().skip((perPage * page) - perPage).limit(perPage).sort({date_add: 'desc' });
	await Movie.count().then(function ( count ){
	num_pages = parseInt((count/9)+1);
});
	res.render('movies', {moviesp, num_pages, page, dest});
});

//Añadir sugerencias
router.post('/suggestion', async (req, res) => {
	const {name, email, suggestion} = req.body;
	const newSuggestion = new Suggestion({
		user : name,
		email : email,
		suggestion : suggestion
	});
	await newSuggestion.save();
	res.redirect('/');
});


 
module.exports = router;