const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { isAuthenticated } = require('../helpers/auth');
router.get('/notes', isAuthenticated, async (req, res) =>{
	const notes = await Note.find({user: req.user.id}).sort({date: 'desc'});
	res.render('notes/all_notes', {notes});
});

router.get('/notes/add', isAuthenticated, (req, res) =>{
	res.render('notes/new_note');
});

router.post('/notes/new_note', isAuthenticated, async(req, res) =>{
	const {title, description} = req.body;
	const errors = [];
	if(!title){
		errors.push({text: 'Por favor escriba un titulo'});
			}
	if(!description){
		errors.push({text: 'Por favor escriba una descripción'});
	}
	if(errors.length>0){
		res.render('notes/new_note', {
			errors,
			title,
			description
		});
	}else{
		const newNote = new Note({title, description});
		newNote.user = req.user.id;
		await newNote.save();
		req.flash('succes_msg', 'Nota agregada satisfactoriamente')
		res.redirect('/notes')
	
	}
	
});

router.get('/notes/edit/:id', isAuthenticated, async (req, res) =>{
	const note = await Note.findById(req.params.id);
	res.render('notes/edit_note',{note});
});

router.put('/notes/edit_note/:id', isAuthenticated, async (req, res) => {
	const {title, description} = req.body;
	await Note.findByIdAndUpdate(req.params.id, {title, description});
	req.flash('succes_msg', 'Nota actualizada satisfactoriamente');
	res.redirect('/notes');
});

router.delete('/notes/delete_note/:id', isAuthenticated, async (req, res) => {
	await Note.findByIdAndDelete(req.params.id)
	req.flash('succes_msg', 'Nota eliminada satisfactoriamente');
	res.redirect('/notes');
});
module.exports = router;