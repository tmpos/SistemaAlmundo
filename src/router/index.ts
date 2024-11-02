import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAppStore } from '@/stores/index';
import { useAuthStore } from '@/stores/auth';
import appSetting from '@/app-setting';

import HomeView from '../views/index.vue';
import Prueba from '../views/Prueba/Prueba.vue';

const routes: RouteRecordRaw[] = [
    // dashboard
    { path: '/', name: 'home', component: HomeView },
    {
        path: '/prueba',
        name: 'prueba',
        component: () => import('../views/Prueba/Prueba.vue'),
    },
    {
        path: '/crearprueba',
        name: 'crearprueba',
        component: () => import('../views/Prueba/CrearPrueba.vue'),
    },
    {
        path: '/editarprueba/:id',
        name: 'editarprueba',
        component: () => import('../views/Prueba/EditarPrueba.vue'),
    },


    {
        path: '/empresa',
        name: 'empresa',
        component: () => import('../views/Empresa/Empresa.vue'),
    },
    {
        path: '/crearempresa',
        name: 'crearempresa',
        component: () => import('../views/Empresa/CrearEmpresa.vue'),
    },
    {
        path: '/editarempresa/:id',
        name: 'editarempresa',
        component: () => import('../views/Empresa/EditarEmpresa.vue'),
    },

        {
        path: '/clientes',
        name: 'clientes',
        component: () => import('../views/Clientes/Clientes.vue'),
    },
    {
        path: '/menu_aplicacion',
        name: 'menu_aplicacion',
        component: () => import('../views/Menu_aplicacion/Menu_aplicacion.vue'),
    },
    {
        path: '/destinations',
        name: 'destinations',
        component: () => import('../views/Destinations/Destinations.vue'),
    },
    {
        path: '/branch_office',
        name: 'branch_office',
        component: () => import('../views/Branch_office/Branch_office.vue'),
    },
    {
        path: '/customers',
        name: 'customers',
        component: () => import('../views/Customers/Customers.vue'),
    },
    {
        path: '/crearcustomers',
        name: 'crearcustomers',
        component: () => import('../views/Customers/CrearCustomers.vue'),
    },
    {
        path: '/editarcustomers/:id',
        name: 'editarcustomers',
        component: () => import('../views/Customers/EditarCustomers.vue'),
    },
    {
        path: '/contact_method',
        name: 'contact_method',
        component: () => import('../views/Contact_method/Contact_method.vue'),
    },
    {
        path: '/services',
        name: 'services',
        component: () => import('../views/Services/Services.vue'),
    },
    {
        path: '/agents',
        name: 'agents',
        component: () => import('../views/Agents/Agents.vue'),
    },
    {
        path: '/leads',
        name: 'leads',
        component: () => import('../views/Leads/Leads.vue'),
    },
    {
        path: '/crearleads',
        name: 'crearleads',
        component: () => import('../views/Leads/CrearLeads.vue'),
    },
    {
        path: '/editarleads/:id',
        name: 'editarleads',
        component: () => import('../views/Leads/EditarLeads.vue'),
    },

    {
        path: '/company',
        name: 'company',
        component: () => import('../views/Company/Company.vue'),
    },
        {
        path: '/error404',
        name: 'error404',
        component: () => import('../views/error404.vue'),
        meta: { layout: 'auth' },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('../views/error404.vue'),
        meta: { layout: 'auth' },
    },

    {
        path: '/login',
        name: 'login',
        component: () => import('../views/auth/cover-login.vue'),
        meta: { layout: 'auth' },
    },


];

const router = createRouter({
    history: createWebHistory(),
    linkExactActiveClass: 'active',
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { left: 0, top: 0 };
        }
    },
});

router.beforeEach((to, from, next) => {
  const store = useAppStore();
  const authStore = useAuthStore();
  const loggedIn = authStore.isAuthenticated;

  // Guardar la ruta anterior
  if (from.name) {
    localStorage.setItem('previousRoute', JSON.stringify({ ruta: from.name }));
  }

  // Verificar si la ruta requiere el layout 'auth' o 'app'
  if (to?.meta?.layout === 'auth') {
    store.setMainLayout('auth');
  } else {
    store.setMainLayout('app');
  }

  // Autenticación
  if (to.name !== 'login' && !loggedIn) {
    next({ name: 'login' });
  } else {
    next(true);   }
});

router.afterEach((to, from) => {
  appSetting.changeAnimation();
});

export default router;
