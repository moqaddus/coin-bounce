const express=require('express');
const authController=require('../controllers/authController')
const router=express.Router();

const blogController=require('../controllers/blogController')
const auth=require('../middleware/auth')
const commentController=require('../controllers/commentController')

//testing
router.get('/test',(req,res)=>res.json({msg:'Working'}))

//user

//login
router.post('/login',authController.login)

router.post('/register',authController.register)

router.post('/logout',auth,authController.logout)

router.get('/refresh',auth,authController.refresh)



//rigiter
//logout
//refresh

//blog
//create
router.post('/blog',auth,blogController.create)

//get all
router.get('/blog/all',auth,blogController.getAll);

router.get('/blog/:id',auth,blogController.getById);


router.put('/blog',auth,blogController.update);

router.delete('/blog/:id',auth,blogController.delete)


//comments
//create
router.post('/comment',auth,commentController.create)

//get
router.get('/comment/:id',auth,commentController.getById)


//CRUD
//create
//read all blogs
//read blog by ID
//update
//delete

//comment
//create comment
//read comments by blog id

module.exports=router;