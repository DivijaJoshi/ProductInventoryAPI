const fs=require('fs').promises
const path=require('path')


const productsFilePath=path.join(__dirname,'../data/products.json')



async function readProducts(){
    try{
        const data=await fs.readFile(productsFilePath,'utf-8')
        return JSON.parse(data)
    }
    catch(error){
        throw error
    }
}

async function writeProducts(data){
        try{
        await fs.writeFile(productsFilePath,JSON.stringify(data,null,2))
        return true
        }
        catch(error){
            throw error
        }
}

// validate date
function isValidDate(str){
    let regex=/^(202[1-5])-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/
    if(!regex.test(str)) return false


    let arr=[]
    arr=str.split('-')
    const year=parseInt(arr[0])
    const month=parseInt(arr[1])
    const day=parseInt(arr[2])

    const date=new Date(year,month-1,day)

    const y=date.getFullYear()
    const m=date.getMonth()
    const d=date.getDate()
    if(y===year && m===(month-1) &&d===day){
        return true
    }
    return false

}


function validateStatus(status,quantity){
    const validStatus=['in-stock','low-stock','out-of-stock']
    if(!validStatus.includes(status)){
        const error=new Error()
        error.code="INVALID_STATUS"
        throw error
    }
    else if(quantity==0 && (status==='in-stock'||status==='low-stock')){
        const error=new Error()
        error.code="INVALID_STATUS_OUT_OF_STOCK"
        throw error

    }
    else if(quantity<10 && quantity>0 && (status==='in-stock'||status==='out-of-stock')){
        const error=new Error()
        error.code="INVALID_STATUS_LOW_QUANTITY"
        throw error

    }
    else if(quantity>=10 && (status==='low-stock'||status==='out-of-stock')){
        const error=new Error()
        error.code="INVALID_STATUS_IN_STOCK"
        throw error

    }




}
// get all products -GET method
const getAllProducts=(req,res,next)=>{
    readProducts()
    .then(data=>{
        res.json({
            success:true,
            products: data
        })
        
    })
    .catch(error=>next(error))

}



//get product by Id
const getProductById=(req,res,next)=>{
    const id=parseInt(req.params.id)
    readProducts()
    .then(products=>{
        const product=products.find(product=>product.id===id)

        if(!product){
            const error=new Error()
            error.code='PRODUCT_NOT_FOUND'
            return next(error)
        }
    
        
        res.json({
            success:true,
            data:product
        })
    
    })
    .catch(error=>next(error))
    
}


//Create product -POST Method
const createProduct=(req,res,next)=>{
    const product=req.body

    if(!product.category|| !product.name || !product.price){
        const error=new Error()
        error.code="MISSING_FIELDS"
        return next(error)
    }

    
    let newProduct
    readProducts()
    .then(products=>{

        let status=product.status

        if(!status){
            if(product.quantity>10){
                status="in-stock"
            }
            else if(product.quantity<10 && product.quantity>0){
                status="low-stock"
            }
            else{
                status="out-of-stock"
            }
        }
        else{
            try{
                validateStatus(status,product.quantity)
            }
            catch(error){
                return next(error)
            }
        }
        if(product.manufacturing_date){
            if(!isValidDate(product.manufacturing_date)){
                const error=new Error()
                error.code="INVALID_DATE_FORMAT"
                return next(error)
            }
        }



        newProduct={
            id:products.length+1,
            name:product.name,
            description:product.description||'',
            category:product.category,
            brand:product.brand||'',
            price:product.price,
            currency:product.currency||'INR',
            quantity:product.quantity||0,
            status: status,
            manufacturing_date:product.manufacturing_date||''

        }
            
            products.push (newProduct)
            return writeProducts(products)
            .then(()=>{
                res.status(201).json({
                    success:true,
                    message:"Product added successfully",
                    product:newProduct
            });
            })
            
        }
    )
    
    .catch(error=>next(error))
};




//Update Products -PUT method
const updateProduct=(req,res,next)=>{
    const id=parseInt(req.params.id)
    const product=req.body
    if(!product.category|| !product.name || !product.price){
        const error=new Error()
        error.code="REQUIRED_FIELDS"
        return next(error)
    }

    let status=product.status
    if(status){
            try{
                validateStatus(status,product.quantity)
            }
            catch(error){
                return next(error)
            }
        }

    if(product.manufacturing_date){
            if(!isValidDate(product.manufacturing_date)){
                const error=new Error()
                error.code="INVALID_DATE_FORMAT"
                return next(error)
            }
        }
    readProducts()
    .then(products=>{
        const index=products.findIndex(product=>product.id===id)
        if(index==-1){
            const error=new Error()
            error.code="PRODUCT_NOT_FOUND"
            return next(error)
        }
        

        const updatedProduct={
        ...product,
        id:products[index].id,


    }
    
    products[index]=updatedProduct
    return writeProducts(products)
    .then(()=>{
        res.json({
            success:true,
            message:"Data has been updated",
            Data:updatedProduct

        })
    })
    })
    .catch((error)=>next(error))

}





//Update Products partially-PATCH method
const partialUpdate=(req,res,next)=>{
    const id=parseInt(req.params.id)
    const NewData=req.body


    let status=NewData.status
    if(status){
            try{
                validateStatus(status,NewData.quantity)
            }
            catch(error){
                return next(error)
            }
        }

    if(NewData.manufacturing_date){
            if(!isValidDate(NewData.manufacturing_date)){
                const error=new Error()
                error.code="INVALID_DATE_FORMAT"
                return next(error)
            }
        }
    readProducts()
    .then(products=>{
        const index=products.findIndex(product=>product.id===id)
        if(index==-1){
            const error=new Error()
            error.code="PRODUCT_NOT_FOUND"
            return next(error)
        }

        const partialUpdatedProduct={
        ...products[index],
        ...NewData,
        id:products[index].id

    }
    
    products[index]=partialUpdatedProduct
    return writeProducts(products)
    .then(()=>{
        res.json({
            success:true,
            message:"Data has been partially updated",
            Data:partialUpdatedProduct

        })
    })
    })
    .catch((error)=>next(error))

}


const deleteProduct=(req,res,next)=>{
    const id=parseInt(req.params.id)
    readProducts()
    .then(products=>{
        const index=products.findIndex(product=>product.id===id)
    if(index==-1){
        const error=new Error()
        error.code="PRODUCT_NOT_FOUND"
        return next(error)
    }
    const deleted=products.splice(index,1)[0]

    return writeProducts(products)
    .then(()=>{
        res.json({
        success:true,
        message: "Product deleted successfully",
        Product:deleted
    })
})

    })    
    .catch(error=>next(error))
}


module.exports={
    deleteProduct,
    createProduct,
    updateProduct,
    partialUpdate,
    getAllProducts,
    getProductById,
}