const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes pour servir les pages HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.get('/boutique', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'boutique.html'));
});

app.get('/produit', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'produit.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'cart.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'contact.html'));
});

// API Routes
app.get('/api/products', (req, res) => {
  const products = require('./config/products.json');
  res.json(products);
});

app.get('/api/product/:slug', (req, res) => {
  const products = require('./config/products.json');
  const product = products.find(p => p.slug === req.params.slug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Route de santé pour Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});