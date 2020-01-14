const path = require('path');
const express = require('express');
const fs = require('fs-extra');
const {unlink} = require('fs-extra');
const router = express.Router();
const Movie = require('../models/Movie');
const { isAuth, isAuthenticated } = require('../helpers/auth');
const { time} = require('../helpers/time');


router.get('/movies/all_movies',  async (req, res) => {
	const all_movies = await Movie.find({
		}).sort({date_add: 'desc' });
	res.render('movies/all_movies', {all_movies});
});
router.get('/movies/add', isAuth, (req, res) => {
	res.render('movies/add_movie');
});
router.get('/movies/:id', async (req, res) => {
	const movie = await Movie.findOne({title: req.params.id});
	movie.views = movie.views+1;
	await movie.save();
	res.render('movies/show_movie',{movie});
	console.log(movie);
});
router.get('/movies', async (req, res) => {
	const all_movies = await Movie.find({}).sort({date_add: 'desc' });
	res.render('movies/movies', {all_movies});
	
});
router.post('/movies/add_movie', async (req, res) => {
	const { title } = req.body;
	const name = await Movie.find({ title: title });
	if (name.length > 0) {
		req.flash('error', 'Ya existe una pelicula con este nombre');
		res.redirect('/movies/add')
	} else {
		const ext = path.extname(req.file.originalname).toLowerCase();
		const imageTempPath = req.file.path;
		//const img = title.replace(/ /g,"%");
		const targetPath = path.resolve('src/public/upload/' + title + ext);
		if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
			await fs.rename(imageTempPath, targetPath);
			const newMovie = new Movie({
				title: req.body.title,
				filename: title + ext,
				year: req.body.year,
				description: req.body.description,
				duration: req.body.duration,
				user: req.user.id,
				trailer : req.body.trailer,
				category: [req.body.accion,req.body.infantil,req.body.comedia,req.body.terror,req.body.ficcion,req.body.aventura,req.body.suspenso,req.body.romance,req.body.fantasia,req.body.drama,req.body.animacion,req.body.crimen,req.body.misterio]
			
			});
			newMovie.category=newMovie.category.filter(Boolean);
			
			const movieSaved = await newMovie.save();
			console.log(movieSaved);
			

		} else {
			await fs.unlink(imageTempPath);
			req.flash('error', 'Solo se permite subir imagenes');
			res.redirect('/movies/add')
		}
		req.flash('succes_msg', 'Pelicula añadida correctamente');
			res.redirect('/movies')
	}
});

router.get('/movies/edit_movie/:id', isAuthenticated, async (req, res) =>{
	const movie = await Movie.findById(req.params.id);
	res.render('movies/edit_movie',{movie});
});

router.put('/movies/edit_movie/:id', isAuthenticated, async (req, res) => {
	const {title, description, year, duration} = req.body;
	const movie = await Movie.findByIdAndUpdate(req.params.id, {title, description, year, duration});
	await movie.save();
	req.flash('succes_msg', 'Pelicula actualizada satisfactoriamente');
	res.redirect('/movies/all_movies');
});

router.get('/movies/add_link/:id',  async (req, res) => {
	const movie = await Movie.findById(req.params.id);
	const link = (movie.link_view);
	const id = movie.id;
	res.render('movies/add_link',{movie, link, id});
	console.log(link);
});

router.put('/movies/add_link/:id',  async (req, res) => {
		const {link} = req.body;
		movie = await Movie.findByIdAndUpdate(req.params.id,{ $push: { link_view : link} },
			{ strict: false },
		);
		req.flash('succes_msg', 'link añadido satisfactoriamente');
		res.redirect('/movies/add_link/'+movie._id);
});

router.delete('/movies/remove_link/:link',  async (req, res) => {
	var {movie, link} = req.body;
	movie = await Movie.findById(movie);
	var patron = '<a href="[object Object]">';
	var patron1 = '</a>';
	var ne = '';
	link = link.replace(patron, ne);
	link = link.replace(patron1, ne);
	var pos = movie.link_view.indexOf(link);
	movie.link_view.splice(pos,1);
	await movie.save();
	res.redirect('/movies/add_link/'+movie._id);
	console.log(pos);
});


router.delete('/movies/delete_movie/:id', isAuthenticated, async (req, res) => {
	const image = await Movie.findByIdAndDelete(req.params.id);
	await unlink(path.resolve('./src/public/upload/' + image.filename));
	req.flash('succes_msg', 'Pelicula eliminada satisfactoriamente');
	res.redirect('/movies/all_movies');
});
router.post('movies/:id/like', (req, res) => {

});
router.post('movies/:id/comment', (req, res) => {

});
module.exports = router;