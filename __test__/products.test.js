const request = require('supertest')
const app = require('../server')
const fs = require('fs').promises
const path = require('path')
const jwt = require('jsonwebtoken')

const productsFilePath=path.join(__dirname,'../data/products.json')
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
        if(filepath===productsFilePath) return JSON.stringify(mockProducts)
        if(filepath===usersFilePath) return JSON.stringify(mockUsers)
        })

    //mock fs.writeFile
    jest.spyOn(fs,'writeFile').mockImplementation(async(filepath,data)=>{
    if(filepath===productsFilePath){
        mockProducts=JSON.parse(data)
    }
        })

}
    beforeAll(async()=>{
        process.env.JWT_secret='test-secret-key'

        setupMock()
        const res=await request(app)
        .post('/api/auth/login')
        .send({username:"testuser",
            password:"testpassword"
        })
        authToken=res.body.token
    })

    beforeEach(async()=>{
        await setupMock()
    })

    afterEach(async()=>{
        jest.restoreAllMocks()
    })


    describe('Products endpoints',()=>{
        describe('GET',()=>{
            test('when token is valid',async()=>{
                const res=await request(app)
                .get('/api/products')
                .set('Authorization',`Bearer ${authToken}`)

                expect(res.statusCode).toBe(200)
                expect(res.body.success).toBe(true)
                expect(res.body.products.length).toBe(3)
            })

            test('when token is absent',async()=>{
                const res=await request(app)
                .get('/api/products')

                expect(res.statusCode).toBe(401)
                expect(res.body.message).toBe('No authentication token, access denied')
            })
        })



        describe('GET by id',()=>{
            test('returns product by id',async()=>{
                const res=await request(app)
                .get('/api/products/1')
                .set('Authorization',`Bearer ${authToken}`)

                expect(res.statusCode).toBe(200)
                expect(res.body.success).toBe(true)
                expect(res.body.data.id).toBe(1)
            })

            test('when product doesnt exist in inventory ',async()=>{
                const res=await request(app)
                .get('/api/products/1222')
                .set('Authorization',`Bearer ${authToken}`)
                

                expect(res.statusCode).toBe(404)
                expect(res.body.message).toBe('product not found in inventory')
            })
        })




        describe('POST',()=>{

            const newProduct={
                "name": "New Item",
                "category": "test",
                "price": 599,
                "quantity": 20,
                            
            }
            test('create a new product',async()=>{
                const res=await request(app)
                .post('/api/products')
                .set('Authorization',`Bearer ${authToken}`)
                .send(newProduct)
                expect(res.statusCode).toBe(201)
                expect(res.body.product.name).toBe(newProduct.name)
                expect(mockProducts.length).toBe(4)
            }
            )

            test('when required fields are missing ',async()=>{
                const res=await request(app)
                .post('/api/products')
                .set('Authorization',`Bearer ${authToken}`)
                .send({
                    name:'testItem'
                })
                expect(res.statusCode).toBe(409)
                expect(res.body.message).toBe('name, category and price are required')
            })
        })





        describe('PUT',()=>{

            const updateProduct={
                "name": "New Item",
                "category": "test",
                "price": 599,
                "quantity": 20,
                            
            }
            test('fully update an existing product',async()=>{
                const res=await request(app)
                .put('/api/products/1')
                .set('Authorization',`Bearer ${authToken}`)
                .send(updateProduct)
                expect(res.statusCode).toBe(200)
                expect(res.body.Data.name).toBe('New Item')
                expect(res.body.message).toBe('Data has been updated')

            }
            )

            test('when updating product that doesnt exist ',async()=>{
                const res=await request(app)
                .put('/api/products/555')
                .set('Authorization',`Bearer ${authToken}`)
                .send(updateProduct)
                expect(res.statusCode).toBe(404)
                expect(res.body.message).toBe('product not found in inventory')
            })
        })




        describe('PATCH',()=>{
            test('partially update an existing product',async()=>{
                const res=await request(app)
                .patch('/api/products/1')
                .set('Authorization',`Bearer ${authToken}`)
                .send({
                    price:5444
                })
                expect(res.statusCode).toBe(200)
                expect(res.body.Data.price).toBe(5444)
                expect(res.body.message).toBe('Data has been partially updated')

            }
            )    
        })


        describe('DELETE',()=>{
            test('delete a product by id',async()=>{
                const res=await request(app)
                .delete('/api/products/1')
                .set('Authorization',`Bearer ${authToken}`)

                expect(res.statusCode).toBe(200)
                expect(mockProducts.length).toBe(2)
                expect(res.body.message).toBe('Product deleted successfully')

            }
            )

            test('when deleting a product that doesnt exist ',async()=>{
                const res=await request(app)
                .delete('/api/products/555')
                .set('Authorization',`Bearer ${authToken}`)

                expect(res.statusCode).toBe(404)
                expect(res.body.message).toBe('product not found in inventory')
            })
        })



        describe('Validation errors',()=>{
            test('invalid date format on create',async()=>{
                const res=await request(app)
                .post('/api/products')
                .set('Authorization',`Bearer ${authToken}`)
                .send({
                "name": "New Item",
                "category": "test",
                "price": 599,
                "manufacturing_date": "2024/10/31"

                })
                expect(res.statusCode).toBe(409)
                expect(res.body.message).toBe('date should be in YYYY-MM-DD format')

            }
            )

            test('valid date format on create',async()=>{
                const res=await request(app)
                .post('/api/products')
                .set('Authorization',`Bearer ${authToken}`)
                .send({
                "name": "New Item",
                "category": "test",
                "price": 599,
                "manufacturing_date": "2024-10-05"

                })
                expect(res.statusCode).toBe(201)
                expect(res.body.message).toBe('Product added successfully')

            })

            test('invalid date format on PATCH',async()=>{
                const res=await request(app)
                .patch('/api/products/1')
                .set('Authorization',`Bearer ${authToken}`)
                .send({
                "name": "New Item",
                "category": "test",
                "price": 599,
                "manufacturing_date": "15-05-2024"

                })
                expect(res.statusCode).toBe(409)
                expect(res.body.message).toBe('date should be in YYYY-MM-DD format')

            }
            )

            test('invalid date format on PUT',async()=>{
                const res=await request(app)
                .put('/api/products/1')
                .set('Authorization',`Bearer ${authToken}`)
                .send({
                "name": "New Item",
                "category": "test",
                "price": 599,
                "manufacturing_date": "15-05-2024"

                })
                expect(res.statusCode).toBe(409)
                expect(res.body.message).toBe('date should be in YYYY-MM-DD format')

            }
            )
            


            test('Invalid status or quantity',async()=>{
                const res=await request(app)
                .post('/api/products')
                .set('Authorization',`Bearer ${authToken}`)
                .send({
                "name": "New Item",
                "category": "test",
                "price": 599,
                "quantity": 0,
                "status": 'in-stock'

                })
                expect(res.statusCode).toBe(409)
                expect(res.body.message).toBe('quantity=0, status must be out-of-stock')
            })


            test('Invalid status value',async()=>{
                const product={
                "name": "New Item",
                "category": "test",
                "price": 599,
                "quantity": 20,
                "status": 'abcdInvalid'
                            
            }
                
                const res=await request(app)
                .post('/api/products')
                .set('Authorization',`Bearer ${authToken}`)
                .send(product)
                expect(res.statusCode).toBe(409)
                expect(res.body.message).toBe('status should be in-stock,low-stock or out-of-stock')
            })


            test('assign in-stock status for quantity>10',async()=>{
                const product={
                "name": "New Item",
                "category": "test",
                "price": 599,
                "quantity": 20,
                //when status field not provided                            
            }
                
                const res=await request(app)
                .post('/api/products')
                .set('Authorization',`Bearer ${authToken}`)
                .send(product)
                expect(res.statusCode).toBe(201)
                expect(res.body.product.status).toBe('in-stock')

        })


        test('assign low-stock status for quantity between 1-9',async()=>{
                const product={
                "name": "New Item",
                "category": "test",
                "price": 599,
                "quantity": 7,
                //when status field not provided                            
            }
                
                const res=await request(app)
                .post('/api/products')
                .set('Authorization',`Bearer ${authToken}`)
                .send(product)
                expect(res.statusCode).toBe(201)
                expect(res.body.product.status).toBe('low-stock')

        })

        test('assign out-of-stock status for quantity=0',async()=>{
                const product={
                "name": "New Item",
                "category": "test",
                "price": 599,
                "quantity": 0,
                //when status field not provided                            
            }
                
                const res=await request(app)
                .post('/api/products')
                .set('Authorization',`Bearer ${authToken}`)
                .send(product)
                expect(res.statusCode).toBe(201)
                expect(res.body.product.status).toBe('out-of-stock')

        })

    })


})

    
