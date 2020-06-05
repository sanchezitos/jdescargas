const express = require('express');
const router = express.Router();



router.get('/posts/download_movies', async (req, res) => { 
    res.render('download_movies');

});

router.get('/posts/download_torrents', async (req, res) => { 
    res.render('download_torrents');

});

module.exports = router;
