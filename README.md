# Product Inventory API

1. Problem Statement: Product Inventory API  
Description: Develop an API for managing product inventory where users can add, update, delete, and fetch product details.

Requirements:

HTTP Methods: GET (fetch products), POST (add product), PUT (update product), PATCH  (partially update product), DELETE (delete product)  
Authentication: Use JWT for user authentication  
File System: Store product data in JSON files  
Async/Await & Promises: Handle asynchronous operations for file reading/writing  
Callbacks: Use callbacks for error handling  
Middleware: Implement middleware for logging requests, validating JWT tokens, and error handling

2. CRUD OPERATIONS :

GET /api/products           : Fetch all products  
GET /api/products/:id       : Fetch product by  
POST /api/products          : Add new product  
PUT /api/products/:id       : Fully update products ID  
PATCH /api/products/:id     : Partially update products  
DELETE /api/products/:id    : Delete product by id

3. INSTALLATION  
1- clone repository  
2- install dependencies ->  npm install

4. DEPENDENCIES USED:

"dependencies": {  
  "dotenv": "^16.5.0",  
  "express": "^5.1.0",  
  "jsonwebtoken": "^9.0.2",  
  "winston": "^3.17.0"  
}

"devDependencies": {  
  "jest": "^30.0.0",  
  "nodemon": "^3.1.10",  
  "supertest": "^7.1.1"  
}

5. Start the server  
npm start  
or nodemon server.js

6. TESTING -(RUN TESTS)  
npm test  
or  
npm run coverage

PROJECT STRUCTURE

## Server running on PORT: 3000

1. server.js:  
MAIN ENTRY POINT

2. Controller:  
Handles all the buisness logic for user authentication and product operations  
->  authController.js - User signup and login logic  
->  productsController.js - CRUD operations and Validations

3. Validation->  
1. isValidDate()  :Date validation for YYYY-MM-DD format  
2. validateStatus() :Validates status for products in-stock, out-of-stock, low-stock based on quantity

    if quantity=0   -> out-of-stock  
    if quantity<10  -> low-stock  
    if quantity>10  -> in-stock

    validates if user tries to update quantity and status doesnt match it. returns custom error.

4. data  :

->products.json :  stores product record with 10 fields  
->users.json    :  stores registered users

5. middlewares :

->auth.js             - verifies JWT for protected routes  
->errorHandler.js     - global error handler, handles custom error codes, logs error using winston

6. logger.js :

used winston for logging timestamp, request method and url.  
logs into files error.log and combined.log

7. routes: defines API routes

authRoutes.js -> routes for signup and login  
productRoutes.js ->routes for product operations

8. test:

Jest and Supertest for testing  
authController.test.js  -> tests auth endpoints  
products.test.js        -> tests product API

9. Features Implemented  
CRUD operations for product  
JWT authentication  
file handling using async await and promises  
error handling using callbacks  
Custom validations  
Middlewares for logging,authentication and error handling.  
testing using Jest and Supertest

