const request = require('supertest')
const app = require('../server')
const fs = require('fs').promises
const path = require('path')
const jwt = require('jsonwebtoken')

const usersFilePath=path.join(__dirname,'../data/users.json')

let mockProducts=[]
const mockUsers=[
    {
        "id": 1,
        "username": "admin",
        "password": "admin123"
    },
    {
        "id": 2,
        "username": "testuser",
        "password": "testpassword"
    }
]

let authToken
const setupMock=()=>{
    mockProducts =JSON.parse(JSON.stringify([
        {id:1,name:"Laptop",description:"Powerful laptop",category:"Electronics",price:1200,quantity:15,status:"in-stock"},
        {id:2,name:"Mouse",description:"Ergonomic wireless mouse",category:"Electronics",price:25,quantity:5,status:"low-stock"},
        {id:3,name:"Keyboard",description:"Mechanical keyboard",category:"Electronics",price:100,quantity:0,status:"out-of-stock"}
    ]))

    //mock fs.readFile
    jest.spyOn(fs,'readFile').mockImplementation(async(filepath)=>{
        if(filepath===usersFilePath) return JSON.stringify(mockUsers)
        })

    //mock fs.writeFile
    jest.spyOn(fs,'writeFile').mockImplementation(async(filepath,data)=>{
    if(filepath===usersFilePath){
        const userData=JSON.parse(data)
    }
        })

}
    beforeAll(async()=>{
        process.env.JWT_SECRET='test-secret-key'

    })

    beforeEach(async()=>{
        await setupMock()
    })

    afterEach(async()=>{
        jest.restoreAllMocks()
    })



describe('Authentication endpoints for user',()=>{
    describe('POST /api/auth/signup',()=>{
            test('create new user',async()=>{
                const newUser={
                    username:"newuser",
                    password: "password"
                }
                const res=await request(app)
                .post('/api/auth/signup')
                .send(newUser)
                expect(res.statusCode).toBe(200)
                expect(res.body.message).toBe('User successfully created')
                expect(res.body.success).toBe(true)

            }
            )

            test('when user already exists',async()=>{
                const newUser={
                    "username": "testuser",
                    "password": "testpassword"
                }
                const res=await request(app)
                .post('/api/auth/signup')
                .send(newUser)
                expect(res.statusCode).toBe(409)
                expect(res.body.message).toBe('user already exists')

            }
            )
        })


        describe('POST /api/auth/login',()=>{
            test('when credentials are valid',async()=>{
                const credentials={
                    "username": "testuser",
                    "password": "testpassword"
                }
                const res=await request(app)
                .post('/api/auth/login')
                .send(credentials)
                expect(res.statusCode).toBe(200)
                expect(res.body.message).toBe('Successfully logged in')
                expect(res.body.success).toBe(true)

            }
            )

            test('when credentials are invalid',async()=>{
                const newUser={
                    "username": "testuser1234",
                    "password": "testpassword1234"
                }
                const res=await request(app)
                .post('/api/auth/login')
                .send(newUser)
                expect(res.statusCode).toBe(401)
                expect(res.body.message).toBe('invalid username or password')

            }
            )
        })

})




    
