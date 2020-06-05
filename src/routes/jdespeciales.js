const path = require('path');
const express = require('express');
const router = express.Router();
const Wallpaper = require('../models/Wallpaper');
const Jdespecial = require('../models/Jdespecial');
const Movie = require('../models/Movie');
const fs = require('fs-extra');
const { unlink } = require('fs-extra');
const { isAuthenticated } = require('../helpers/auth');


router.get('/JDespeciales/:title', async (req, res) => {
    const view = await Movie.find({secuela: req.params.title}).sort({year: 'desc'});
    const jd = await Jdespecial.findOne({title: req.params.title})
    res.render('jdespeciales/showjd', {view, jd});

});

router.post('/jdespeciales/add', async (req, res) => {
    const { title, description, category } = req.body;
    const wallpaper = await Wallpaper.findOne({ secuela: title });
    const jd = await Jdespecial.find({title:title})

    if (jd.length > 0) {
        req.flash('error', 'Ya existe una JDespecial para la saga ' + title);
        res.redirect('/JDespeciales-adm');
    } else {
        const newJdespecial = new Jdespecial({
            title,
            description,
	    category,
            imageURL: wallpaper.imageURL,
        });

        const jdespecialSaved = await newJdespecial.save();
        console.log(jdespecialSaved);
        res.redirect('/JDespeciales-adm');
    }
});

router.delete('/jdespeciales/remove', async (req, res) =>{
    const sec = req.body.sec;
    const remove = await Jdespecial.findByIdAndDelete(sec);
	req.flash('succes_msg', 'JDespecial eliminado');
	res.redirect('/JDespeciales-adm');
});

module.exports = router;
