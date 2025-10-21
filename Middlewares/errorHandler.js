const{logger}=require('../Middlewares/logger')

const errorHandler=(err,req,res,next)=>{
    logger.error(`Error: 
        ${req.method},
        ${req.url},
        ${req.message},
        ${err.code},
        ${err.name}`)


const errorMessages={
    USER_ALREADY_EXISTS: 'user already exists',
    INVALID_CREDENTIALS: 'invalid username or password',
    PRODUCT_NOT_FOUND: 'product not found in inventory',
    MISSING_FIELDS: 'name, category and price are required',
    INVALID_DATE_FORMAT: 'date should be in YYYY-MM-DD format and valid, year should not be before 2021',
    REQUIRED_FIELDS:'name, category and price are required',
    INVALID_STATUS: 'status should be in-stock,low-stock or out-of-stock',
    INVALID_STATUS_LOW_QUANTITY:'quantity<10, status must be low-stock',
    INVALID_STATUS_OUT_OF_STOCK:'quantity=0, status must be out-of-stock',
    INVALID_STATUS_IN_STOCK:'quantity>=10, status must be in-stock'
} 

switch(err.code){
    case 'USER_ALREADY_EXISTS':
        err.status=409
        err.message=errorMessages.USER_ALREADY_EXISTS
        break;
    case 'INVALID_CREDENTIALS':
        err.status=401
        err.message=errorMessages.INVALID_CREDENTIALS
        break;
    case 'PRODUCT_NOT_FOUND':
        err.status=404
        err.message=errorMessages.PRODUCT_NOT_FOUND
        break;
    case 'MISSING_FIELDS':
        err.status=409
        err.message=errorMessages.MISSING_FIELDS
        break;
    case 'INVALID_DATE_FORMAT':
        err.status=409
        err.message=errorMessages.INVALID_DATE_FORMAT
        break;
    case 'REQUIRED_FIELDS':
        err.status=400
        err.message=errorMessages.REQUIRED_FIELDS
        break;
    case 'INVALID_STATUS':
        err.status=409
        err.message=errorMessages.INVALID_STATUS
        break;
    case 'INVALID_STATUS_OUT_OF_STOCK':
        err.status=409
        err.message=errorMessages.INVALID_STATUS_OUT_OF_STOCK
        break;
    case 'INVALID_STATUS_LOW_QUANTITY':
        err.status=409
        err.message=errorMessages.INVALID_STATUS_LOW_QUANTITY
        break;
    case 'INVALID_STATUS_IN_STOCK':
        err.status=409
        err.message=errorMessages.INVALID_STATUS_IN_STOCK
        break;
    default:
        err.status=500
        err.message="Internal server error"
    
}

res.status(err.status).json({
    success:false,
    message:err.message

})


}


module.exports=errorHandler