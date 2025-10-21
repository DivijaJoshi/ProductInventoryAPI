const fs=require('fs').promises
const path=require('path')
const jwt=require('jsonwebtoken')


const usersFilePath=path.join(__dirname,'../data/users.json')

async function readData(){
    try{
    const data=await fs.readFile(usersFilePath,'utf-8')
    return JSON.parse(data)
    }
    catch(error){
        throw error
    }
}


async function writeData(data){
    try{
        await fs.writeFile(usersFilePath,JSON.stringify(data,null,2))
        return true
        }
        catch(error){
            throw error
        }
}


//signup 
const signup=(req,res,next)=>{
    const data=req.body
    readData()
    .then((users)=>{
        const user=users.find(user=>user.username===data.username)
        if(user){
            const error=new Error()
            error.code="USER_ALREADY_EXISTS"
            return next(error)
        }
        const newUser={
            id:users.length+1,
            username:data.username,
            password:data.password
        }
        users.push(newUser)
        return writeData(users)
        .then(()=>{
            res.json({
                success:true,
                message:"User successfully created",
                user:newUser
            })
        })
    })
    .catch(error=>next(error))
}



//login and generate token
const login=(req,res,next)=>{
    const credentials=req.body
    readData()
    .then((users)=>{
        const user=users.find(user=>user.username===credentials.username)
        if(!user||credentials.password!==user.password){
            const error=new Error()
            error.code="INVALID_CREDENTIALS"
            return next(error)
        }
    const token=jwt.sign(
        {
        id:user.id,
        username:user.username
        }
        ,process.env.JWT_SECRET,
    {
        expiresIn:'24h'
    })
    res.json({
        success:true,
        token,
        message:"Successfully logged in"
    })
    
    
    })
    .catch(error=>next(error))

}

module.exports={
    signup,login
}