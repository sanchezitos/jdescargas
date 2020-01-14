const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
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
router.get('/about', (req, res) => {
	res.render('about');
});
router.get('/:s', async (req, res) =>{
	const movies = await Movie.find({title: {$regex:req.query.s}});
	const dest = await Movie.find({views: {$gte:20}}).sort({views: 'desc'}).limit(12);
	res.render('movies', {s:req.query.s, movies, dest});

});
router.get('/category/:cat', async (req, res) => {
	const movies = await Movie.find({category:req.params.cat}).sort({date_add: 'desc' });
	const dest = await Movie.find({views: {$gte:20}}).sort({views: 'desc'}).limit(12);
	res.render('movies', {cat:req.params.cat, dest, movies});

});

router.get('/page/:page', async (req, res) => {
	let perPage = 9;
	let page = req.params.page || 1;
	const dest = await Movie.find({views: {$gte:20}}).sort({views: 'desc'}).limit(12);
	const moviesp = await Movie.find().skip((perPage * page) - perPage).limit(perPage).sort({date_add: 'desc' });
	await Movie.count().then(function ( count ){
	num_pages = parseInt((count/9)+1);
});
	res.render('movies', {moviesp, num_pages, page, dest});
	console.log(moviesp, num_pages);
});
module.exports = router;