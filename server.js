const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Swagger API Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
const apiRoutes = require('./src/routes/api');
app.use('/api', apiRoutes);

// Database Connection Check
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to database', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});


app.get('/',(req,res,next)=>{
  res.status(200).json({message:"Server running successfully"})
})

app.use((req,res,next)=>{
  res.status(404).json({message:"Not Found"})
})

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT} and Swagger Api running on url http://localhost:${PORT}/api-docs`));
