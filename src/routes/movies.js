const path = require('path');
const express = require('express');
const fs = require('fs-extra');
const {unlink} = require('fs-extra');
const router = express.Router();
const Movie = require('../models/Movie');
const Report = require('../models/Report');
const View = require('../models/View');
const Download = require('../models/Download');
const { isAuth, isAuthenticated } = require('../helpers/auth');

//Mostrar peliculas modo administrador------------
router.get('/movies/all_movies', isAuth, async (req, res) => {
	const all_movies = await Movie.find({}).sort({date_add: 'desc' });
	const movies = await Movie.find({}).sort({views: 'desc' }).limit(5);
	let page = req.params.page || 1;
	res.render('movies/all_movies', {all_movies,movies,page});
});

//Buscador de peliculas administraador--------------
router.get('/movies/search', isAuth, async (req, res) => {
	const movie = req.query.movie;
	const searchmovie = await Movie.find({title: {$regex:movie, $options: 'iu'}});
	const movies = await Movie.find({}).sort({views: 'desc' }).limit(5);
	res.render('movies/all_movies', {searchmovie, movies});
});

//Paginación peliculas admin.....
router.get('/movies/all_movies/:page', isAuth, async (req, res) => {
	let perPage = 9;
	let page = req.params.page || 1;
	const movies = await Movie.find({}).sort({views: 'desc' }).limit(5);
	const moviesp = await Movie.find().skip((perPage * page) - perPage).limit(perPage).sort({date_add: 'desc' });
	await Movie.count().then(function ( count ){
	num_pages = parseInt((count/9)+1);
});
	res.render('movies/all_movies', {moviesp, num_pages, page, movies});
});

//Añadir reporte pelicula
router.post('/movies/add_report', isAuthenticated, async (req, res) => {
	const {user_id, user_name, report, admin_id, title} = req.body;
	const newReport = new Report({
		user_id: user_id,
		user_name: user_name,
		report: report,
		admin_id: admin_id,
		title: title
	});
	const reports = await newReport.save();
	req.flash('succes_msg', 'Reporte enviado');
	res.redirect('/movies/'+title);
	console.log(reports);

});

//Eliminar reporte pelicula
router.delete('/movies/delete_report/:id', isAuth, async (req, res) => {
	await Report.findByIdAndDelete(req.params.id);
	res.redirect('/movies/reports/'+req.body.admin);
	console.log(req.body.admin);
});

//Mostrar reportes
router.get('/movies/reports/:id', isAuth, async (req, res) => {
	const reports = await Report.find({admin_id:req.params.id});
	res.render('movies/reports', {reports});
	
});

//Añadir peliculas---------

router.get('/movies/add', isAuth, (req, res) => {
	res.render('movies/add_movie');
});

//Mostrar peliculas---------

router.get('/movies/:id', async (req, res) => {
	const movie = await Movie.findOne({title: req.params.id});
	const links = await View.find({movie : movie.id}).sort({date_add: 'desc' });
	const linksd = await Download.find({movie : movie.id}).sort({date_add: 'desc' });
	const movies = await Movie.find({category : {$in:movie.category},title : {$ne:movie.title}}).limit(12);
	movie.views = movie.views+1;
	await movie.save();
	if(movies){
		res.render('movies/show_movie',{movie, movies, links, linksd});
	}else{
		res.render('movies/show_movie',{movie});
	}
	
	console.log(links);
});
router.get('/movies', async (req, res) => {
	const all_movies = await Movie.find({}).sort({date_add: 'desc' });
	
	res.render('movies/movies', {all_movies});
	
});


//Añadir pelicula-----------

router.post('/movies/add_movie', isAuth, async (req, res) => {
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
				title: title,
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
			

		} else {
			await fs.unlink(imageTempPath);
			req.flash('error', 'Solo se permite subir imagenes');
			res.redirect('/movies/add')
		}
		req.flash('succes_msg', 'Pelicula añadida correctamente');
			res.redirect('/movies/all_movies/1',)
	}
});

//Editar pelicula-----------
router.get('/movies/edit_movie/:id', isAuth, async (req, res) =>{
	const movie = await Movie.findById(req.params.id);
	res.render('movies/edit_movie',{movie});
});

//Editar pelicula-----------

router.put('/movies/edit_movie/:id', isAuth, async (req, res) => {
	const {title, description, year, duration, trailer} = req.body;
	const movie = await Movie.findByIdAndUpdate(req.params.id, {title, description, year, duration, trailer});
	movie.category = [req.body.accion,req.body.infantil,req.body.comedia,req.body.terror,req.body.ficcion,req.body.aventura,req.body.suspenso,req.body.romance,req.body.fantasia,req.body.drama,req.body.animacion,req.body.crimen,req.body.misterio];
	movie.category=movie.category.filter(Boolean);
	await movie.save();
	req.flash('succes_msg', 'Pelicula actualizada satisfactoriamente');
	res.redirect('/movies/all_movies/1');
});

//Editar imagen-----------

router.put('/movies/edit_image/:id', isAuth, async (req, res) => {
	const movie = await Movie.findById(req.params.id);
		const ext = path.extname(req.file.originalname).toLowerCase();
		const imageTempPath = req.file.path;
		const targetPath = path.resolve('src/public/upload/' + movie.title + ext);
		if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
			await unlink(path.resolve('./src/public/upload/' + movie.filename));
			await fs.rename(imageTempPath, targetPath);

		} else {
			await fs.unlink(imageTempPath);
			req.flash('error', 'Solo se permite subir imagenes');
			res.redirect('/movies/edit_movie/'+req.params.id);
		}
		req.flash('succes_msg', 'Imagen cambiada correctamente');
			res.redirect('/movies/edit_movie/'+req.params.id);
	
});

//Mostrar links----------
router.get('/movies/links_view/:id', isAuth, async (req, res) => {
	const links = await View.find({movie : req.params.id}).sort({date_add: 'desc' });
	const movie = await Movie.findById(req.params.id);
	res.render('movies/links_view',{links, movie});
	console.log(links);
});

//Aadir link------------
router.post('/movies/add_link/:id', isAuth,  async (req, res) => {
	const {server, link, movie_id} = req.body;
	const movie = req.params.id;
	const newView = new View({
		movie : movie,
		server: server,
		link: link,	
	});
		await newView.save();
		req.flash('succes_msg', 'link añadido satisfactoriamente');
		res.redirect('/movies/links_view/'+movie);
});

//Remover link-----------
router.delete('/movies/remove_link/:link', isAuth, async (req, res) => {
	const {movie} = req.body;
	const link = await View.findByIdAndDelete(req.params.link);
	res.redirect('/movies/links_view/'+movie);
});

//Mostrar links de descarga----------
router.get('/movies/links_download/:id', isAuth, async (req, res) => {
	const links = await Download.find({movie : req.params.id}).sort({date_add: 'desc' });
	const movie = await Movie.findById(req.params.id);
	res.render('movies/links_download',{links, movie});
	console.log(links);
});

//Aadir link de descarga------------
router.post('/movies/add_download/:id', isAuth,  async (req, res) => {
	const {server, link} = req.body;
	const movie = req.params.id;
	const newDownload = new Download({
		movie : movie,
		server: server,
		link: link,	
	});
		await newDownload.save();
		req.flash('succes_msg', 'link añadido satisfactoriamente');
		res.redirect('/movies/links_download/'+movie);
});

//Remover link-----------
router.delete('/movies/remove_download/:link', isAuth, async (req, res) => {
	const {movie} = req.body;
	const link = await Download.findByIdAndDelete(req.params.link);
	res.redirect('/movies/links_download/'+movie);
});

//Añadir like--------
router.put('/movies/add_like/:id', isAuthenticated,  async (req, res) => {
	const {id_user} = req.body;
	movie = await Movie.findById(req.params.id);
	movie = await Movie.findByIdAndUpdate(req.params.id,{ $push: {likes : id_user}},
		{ strict: false },
	);
	movie.likecount = movie.likecount+1;	
	await movie.save();	
	res.redirect('/movies/'+movie.title);
});

//Remover like----
router.delete('/movies/remove_like/:id', isAuthenticated, async (req, res) => {
	var {id_user} = req.body;
	movie = await Movie.findById(req.params.id);
	var pos = movie.likes.indexOf(id_user);
	movie.likes.splice(pos,1);
	movie.likecount = movie.likecount-1;	
	await movie.save();	
	res.redirect('/movies/'+movie.title);

});

//Mi lista---------------
router.get('/movies/mylist/:id', isAuthenticated, async (req, res) => {
	const movies = await Movie.find({addtomylist : req.params.id}).sort({date_add: 'desc' });
	res.render('movies/mylist', {movies});
});

//Add a mi lista-------
router.put('/movies/add_mylist/:id', isAuthenticated, async (req, res) => {
	const {id_user} = req.body;
	movie = await Movie.findByIdAndUpdate(req.params.id,{ $push: {addtomylist : id_user}},
		{ strict: false },
	);
	res.redirect('/movies/'+movie.title);

});

//Remove de mi lista----------
router.delete('/movies/remove_mylist/:id', isAuthenticated, async (req, res) => {
	var {id_user} = req.body;
	movie = await Movie.findById(req.params.id);
	var pos = movie.addtomylist.indexOf(id_user);
	movie.addtomylist.splice(pos,1);
	await movie.save();	
	res.redirect('/movies/'+movie.title);
});

//Eliminar pelicula-----------
router.delete('/movies/delete_movie/:id', isAuth, async (req, res) => {
	const image = await Movie.findByIdAndDelete(req.params.id);
	await unlink(path.resolve('./src/public/upload/' + image.filename));
	req.flash('succes_msg', 'Pelicula eliminada satisfactoriamente');
	res.redirect('/movies/all_movies/1');
});
router.post('movies/:id/like', (req, res) => {

});
router.post('movies/:id/comment', (req, res) => {

});
module.exports = router;