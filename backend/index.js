require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mysql = require('mysql2/promise')


const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/admin')
const userRoutes = require('./routes/user')
const storeOwnerRoutes = require('./routes/storeOwner')


const { authenticateToken } = require('./middleware/auth')
const { errorHandler } = require('./middleware/errorHandler')
const { inputSanitizer } = require('./middleware/audit')

const app = express()
const PORT = process.env.PORT || 5000


app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))


app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf)
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON format'
      })
    }
  }
}))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))


app.use(inputSanitizer)


app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const path = req.path
  const ip = req.ip
  const userAgent = req.get('User-Agent')
  
  console.log(`${timestamp} - ${method} ${path} - IP: ${ip} - UA: ${userAgent}`)
  next()
})


const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_rating_platform',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  charset: 'utf8mb4'
}


const pool = mysql.createPool(dbConfig)

app.locals.db = pool

const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('Database connected successfully')
    

    await connection.execute('SELECT 1')
    console.log('Database test query successful')
    
    connection.release()
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
}


app.use('/api/auth', authRoutes)
app.use('/api/admin', authenticateToken, adminRoutes)
app.use('/api/user', authenticateToken, userRoutes)
app.use('/api/store-owner', authenticateToken, storeOwnerRoutes)





app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  })
})


app.use(errorHandler)


const startServer = async () => {
  try {
    await testConnection()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`API Base URL: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()

module.exports = app
