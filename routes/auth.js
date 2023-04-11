const express=require('express');
const userController=require('../controllers/users');
const router=express.Router();
const upload = require('../middleware/upload')

router.post('/signup',userController.signup);
router.post('/one',userController.one);
router.get('/logout',userController.logout);
router.post('/forgot',userController.forgot);
router.post('/edit',upload.single('profileimage'),userController.edit);
router.post('/profile',userController.profile);

module.exports= router;