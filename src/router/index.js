import { createRouter, createWebHistory } from 'vue-router';
import RegisterView from '../views/RegisterView.vue';
import LoginView from '../views/LoginView.vue';
import InventoryView from '../views/InventoryView.vue';
import ProductView from '../components/ProductItem.vue';
import CreateProductView from '../components/CreateProduct.vue';
import DeleteProduct from '../components/DeleteProduct.vue';
import UpdateProduct from '../components/UpdateProduct.vue';
import CategoryCreate from '../components/CategoryCreate.vue';

const routes = [
  {
    path: '/',
    redirect: '/inventory'
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: InventoryView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/products/:id', 
    name: 'ProductView', 
    component: ProductView 
  },
  {
    path: '/create-product',
    name: 'CreateProduct',
    component: CreateProductView
  },
  {
    path: '/delete-product/:productId',
    name: 'DeleteProduct',
    component: DeleteProduct,
    props: true
  },
  {
    path: '/update-product/:productId',
    name: 'UpdateProduct',
    component: UpdateProduct,
    props: true
  },
  {
    path: '/create-category', 
    name: 'CreateCategory', 
    component: CategoryCreate 
  },
  {
    path: '/delete-product/:productId',
    name: 'DeleteProduct',
    component: DeleteProduct,
    props: true 
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
