import Vue from 'vue';
import VueRouter from 'vue-router';
import ResourceEdit from '../views/ResourceEdit.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/resource/:id',
    name: 'resource',
    component: ResourceEdit,
    props: true,
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
