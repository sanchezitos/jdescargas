const path = require('path');
const express = require('express');
const router = express.Router();
const Waallpaper = require('../models/Wallpaper');
const fs = require('fs-extra');
const {unlink} = require('fs-extra');
const { isAuth, isAuthenticated } = require('../helpers/auth');

const cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'jdescargas',
	api_key: '895426351271239',
	api_secret: '65fUKS3JVqTpxIq7RGryM7zOE7A'
});


router.get('/wallpapers/add', isAuth, async (req, res) =>{
	res.render('wallpapers/add_wallpaper');
});

router.post('/wallpapers/add', isAuth,  async (req, res) =>{
	const {secuela} = req.body;
	const wallpapers = await Waallpaper.find({ secuela: secuela });
	if (wallpapers.length > 0) {
		req.flash('error', 'Ya existe una imagen para la secuela'+secuela);
		res.redirect('/wallpapers')
	} else {
		const ext = path.extname(req.file.originalname).toLowerCase();
		const imageTempPath = req.file.path;
		//const img = title.replace(/ /g,"%");
		const targetPath = path.resolve('public/upload/' + secuela + ext);
		const result = await cloudinary.v2.uploader.upload(req.file.path);
		if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
			await fs.rename(imageTempPath, targetPath);
			
			const newWallpaper = new Waallpaper({
				secuela,
				imageURL: result.secure_url,
				image_id: result.public_id
			
			});
			
			const wallpaperSaved = await newWallpaper.save();
			await fs.unlink('public/upload/' + secuela + ext);
			console.log(wallpaperSaved);

		} else {
			await fs.unlink(imageTempPath);
			req.flash('error', 'Solo se permite subir imagenes');
			res.redirect('/wallpapers')
		}
		req.flash('succes_msg', 'Wallpaper añadida correctamente');
			res.redirect('/wallpapers');
			
	}

});

router.delete('/wallpapers/remove', isAuth,  async (req, res) =>{
	const sec = req.body.sec;
	const image_id = req.body.id_image;
	await Waallpaper.findByIdAndDelete(sec);
	await cloudinary.v2.uploader.destroy(image_id);
	req.flash('succes_msg', 'Wallpaper eliminado');
	res.redirect('/wallpapers');
});
module.exports = router;
