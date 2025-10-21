const express=require('express')
const {deleteProduct,createProduct,updateProduct,partialUpdate,getAllProducts,getProductById}=require('../controller/productsController.js')

const auth=require('../Middlewares/auth.js')

const router=express.Router()


router.get('/',auth,getAllProducts)
router.get('/:id',auth,getProductById)
router.post('/',auth,createProduct)
router.put('/:id',auth,updateProduct)
router.patch('/:id',auth,partialUpdate)
router.delete('/:id',auth,deleteProduct)



module.exports=router