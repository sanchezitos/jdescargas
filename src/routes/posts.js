const express = require('express');
const router = express.Router();



router.get('/posts/download_movies', async (req, res) => { 
    res.render('download_movies');

});

module.exports = router;
