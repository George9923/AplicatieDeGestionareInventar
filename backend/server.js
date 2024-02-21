// Importarea modulelor necesare pentru funcționarea aplicației
const express = require('express');
const { body, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require('express-jwt');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Încarcă variabilele de mediu din fișierul .env

// Inițializează Firebase Admin SDK cu credențialele de autentificare
const serviceAccount = require('../private/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express(); // Creează o instanță Express
app.use(express.json()); // Middleware pentru parsarea body-urilor de tip JSON
app.use(cors()); // Activează CORS pentru toate rutele, permitând cererile cross-origin

// Middleware pentru validarea tokenurilor JWT
const jwtMiddleware = expressJwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] });

// Middleware pentru logarea tuturor cererilor primite de server
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); 
});

// Servește fișiere static dintr-un director specific pentru rutele care încep cu '/uploads'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta POST pentru înregistrarea utilizatorilor noi, cu validarea inputurilor
app.post('/register', [
  body('email').isEmail().withMessage('Introduceți o adresă de email validă.'),
  body('password').isStrongPassword().withMessage('Parola nu este suficient de puternică.'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: req.body.email,
      password: req.body.password,
    });
    res.status(201).send({ userId: userRecord.uid });
  } catch (error) {
    console.error(error); 
    res.status(500).send({ error: 'A apărut o eroare la server.' });
  }
});

// Ruta POST pentru autentificarea utilizatorilor și generarea unui JWT
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    // console.log("User UID:", userRecord.uid); // Log pentru a verifica UID-ul

    const token = jwt.sign({ uid: userRecord.uid }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("Token generated:", token); 
    res.status(200).send({ token }); // Trimiterea token-ului la client
  } catch (error) {
    console.error("Eroare la login:", error);
    res.status(401).send({ error: 'Autentificare eșuată.' });
  }
});

// Ruta POST pentru logout
app.post('/logout', jwtMiddleware, (req, res) => {
  res.status(200).send({ message: 'User logged out successfully' });
});

// Ruta GET pentru listarea produselor, accesibilă fără autentificare
app.get('/api/products', async (req, res) => {
  try {
    const products = [];
    const snapshot = await admin.firestore().collection('products').get();
    snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const doc = await admin.firestore().collection('products').doc(productId).get();

    if (!doc.exists) {
      return res.status(404).send({ error: 'Product not found' });
    }

    res.status(200).json(doc.data());
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).send({ error: 'Failed to fetch product details' });
  }
});

// RUTA POST pentru crearea de produse 
app.post('/api/products', jwtMiddleware, [
  body('name').notEmpty().withMessage('Numele produsului este necesar.'),
  body('category').notEmpty().withMessage('Categoria produsului este necesară.'),
  body('description').notEmpty().withMessage('Descrierea produsului este necesară.'),
  body('price').isFloat({ gt: 0 }).withMessage('Prețul trebuie să fie un număr mai mare decât 0.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newProduct = req.body;
    const docRef = await admin.firestore().collection('products').add(newProduct);
    res.status(201).send({ id: docRef.id, ...newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).send({ error: 'Failed to create product' });
  }
});

// Ruta PUT pentru update la produs
app.put('/api/products/:id', jwtMiddleware, [
  body('name').notEmpty().withMessage('Numele produsului este necesar.'),
  body('category').notEmpty().withMessage('Categoria produsului este necesară.'),
  body('description').notEmpty().withMessage('Descrierea produsului este necesară.'),
  body('price').isFloat({ gt: 0 }).withMessage('Prețul trebuie să fie un număr mai mare decât 0.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const productId = req.params.id;
  const productData = req.body;

  try {
    const productRef = admin.firestore().collection('products').doc(productId);
    await productRef.update(productData);
    res.status(200).send({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send({ error: 'Failed to update product' });
  }
});


// Ruta DELETE pentru ștergerea unui produs
app.delete('/api/products/:id', jwtMiddleware, async (req, res) => {
  const productId = req.params.id;

  try {
    const productRef = admin.firestore().collection('products').doc(productId);
    const doc = await productRef.get();
    if (!doc.exists) {
      return res.status(404).send({ error: 'Product not found' });
    }

    await productRef.delete();
    res.status(200).send({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send({ error: 'Failed to delete product' });
  }
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Access denied. You must be logged in to create a product.');
  } else {
    next(err);
  }
});

// Ruta GET pentru a accesa categoriile
app.get('/api/categories', async (req, res) => {
  try {
    const categories = [];
    const snapshot = await admin.firestore().collection('categories').get();
    snapshot.forEach(doc => categories.push({ id: doc.id, ...doc.data() }));
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send({ error: 'Failed to fetch categories' });
  }
});


// - Încărcarea și descărcarea fișierelor, cu validări pentru tip și dimensiune.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Aici, 'uploads/' este directorul în care vor fi salvate fișierele
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error('Wrong file type');
    error.code = 'LIMIT_FILE_TYPES';
    return cb(error, false);
  }
  cb(null, true);
};

const MAX_SIZE = 2000000; // 2MB

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_SIZE
  }
});

// Ruta POST pentru incarcarea de fisier 
app.post('/upload', jwtMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: 'Please upload a file.' });
  }
  res.status(200).send({ message: 'File uploaded successfully', file: req.file });
});

app.get('/download/:filename', jwtMiddleware, (req, res) => {
  const filename = req.params.filename;
  const file = `${__dirname}/uploads/${filename}`; 

  res.download(file, filename, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).send({ error: 'Failed to download file' });
    }
  });
});

app.use(function (err, req, res, next) {
  if (err.code === 'LIMIT_FILE_TYPES') {
    res.status(422).json({ error: 'Only images are allowed' });
    return;
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(422).json({ error: `Too large. Max size is ${MAX_SIZE/1000}Kb` });
    return;
  }
  next(err);
});

// Ruta GET pentru uploadHistory
app.get('/api/uploadHistory', jwtMiddleware, (req, res) => {
  const uploadsDirectory = path.join(__dirname, 'uploads');

  fs.readdir(uploadsDirectory, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      return res.status(500).send({ error: 'Failed to read uploads directory' });
    }

    // Crează un array de obiecte cu informații despre fiecare fișier
    const fileInfos = files.map(filename => {
      return {
        name: filename,
        url: `/uploads/${filename}`,
      };
    });

    res.status(200).json(fileInfos);
  });
});

// Ruta POST pentru a prelucra numărul ales aleatoriu
app.post('/api/process-number', (req, res) => {
  const { number } = req.body;

  // Logica pentru a verifica dacă numărul este 9
  if (number === 6) {
    // Dacă numărul este 9, trimiteți un răspuns cu succes și datele utilizatorului
    const users = [{ id: 6, nume: "Mihai" }, { id: 9, nume: "Elena" }];
    res.status(200).json(users);
  } else {
    // Dacă numărul este mai mic decât 9, trimiteți un mesaj de eroare
    res.status(400).json({ error: 'The picked number is less than 6.' });
  }
});

// Pornirea serverului pe portul specificat în variabila de mediu PORT sau 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
