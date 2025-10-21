const express=require('express')
const productRoutes=require('./router/productRoutes')
const authRoutes=require('./router/authRoutes')
const {expressLogger,logger}=require('./Middlewares/logger')
const errorHandler=require('./Middlewares/errorHandler')
const app=express()
require('dotenv').config()

app.use(express.json())
app.use(expressLogger)
app.use('/api/products',productRoutes)
app.use('/api/auth',authRoutes)
app.use(errorHandler)

const server=app.listen(3000,()=>{
    console.log("Server is running on port 3000")
})

module.exports=server