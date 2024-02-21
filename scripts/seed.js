const faker = require('faker');

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require('../private/serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const generateProducts = async () => {
  const productsCollection = db.collection('products');

  for (let i = 0; i < 20; i++) {
    const productName = faker.commerce.productName();
    await productsCollection.add({
      name: productName,
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      createdAt: FieldValue.serverTimestamp()
    });
  }
};

const generateCategories = async () => {
  const categoriesCollection = db.collection('categories');

  for (let i = 0; i < 5; i++) {
    const categoryName = faker.commerce.department();
    await categoriesCollection.add({
      name: categoryName,
      description: faker.lorem.sentence(),
      createdAt: FieldValue.serverTimestamp()
    });
  }
};

const seedDatabase = async () => {
  await generateProducts();
  await generateCategories();
  console.log('Database seeded successfully!');
};

seedDatabase().catch(console.error);