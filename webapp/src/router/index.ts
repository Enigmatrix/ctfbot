import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import ResourceEdit from '../views/ResourceEdit.vue';
import getUserInfo, { login } from '@/session';

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: '/resource/:id',
    name: 'resource',
    component: ResourceEdit,
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/help',
    name: 'help',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Help.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach(async (to, _, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const info = await getUserInfo();
    if (info) {
      next();
    } else {
      login(to.fullPath);
    }
  } else {
    next();
  }
});

export default router;
