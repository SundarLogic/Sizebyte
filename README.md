# SizeByte

SizeByte is a full-stack electronics e-commerce application built with React, Node.js, Express.js, Sequelize, and MySQL.

## Features

### Authentication & Authorization
- Customer signup and login
- Seller signup and login
- JWT authentication
- Role-based authorization
- Password hashing using bcrypt

### Product Management
- Product CRUD operations
- Product image upload using Multer
- Cloudinary image storage
- Image replacement and deletion
- Product search
- Category filtering
- Price filtering
- Sorting by name, price, and creation date
- Pagination
- Soft delete for products

### Shopping & Orders
- Shopping cart
- Add, update, and remove cart items
- Checkout
- Stock management
- Order creation
- Customer order history
- Seller order management
- Order status updates

### Database & Backend
- Sequelize ORM
- Database migrations using Sequelize CLI
- Database transactions with rollback
- Database indexing for query performance
- Foreign key relationships
- Input validation using express-validator
- Centralized error handling
- Environment variable configuration

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Helmet
- CORS
- Protected routes
- Role-based access control

### Deployment
- Backend deployed on Vercel
- MySQL database hosted on TiDB Cloud
- Cloudinary for image storage
- Frontend deployed on Vercel

## Tech Stack

### Frontend
- React
- React Router
- CSS

### Backend
- Node.js
- Express.js
- Sequelize
- MySQL
- JWT
- bcryptjs
- Multer
- express-validator
- Helmet
- CORS
- dotenv

### External Services
- TiDB Cloud
- Cloudinary
- Vercel

## Project Structure

```text
SizeByte/
├── Controllers/
├── Middleware/
├── Models/
├── Routes/
├── migrations/
├── config/
├── public/
├── app.js
├── package.json
└── .env
