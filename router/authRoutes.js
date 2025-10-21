const express=require('express')
const router=express.Router()
const auth=require('../Middlewares/auth')
const{signup,login}=require('../controller/authController')


router.post('/signup',signup)
router.post('/login',login)

module.exports=router