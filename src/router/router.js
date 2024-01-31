import { createRouter, createWebHistory } from 'vue-router';
import GetITCategories from "../views/GetITCategories.vue";
import GetITStreamers from "../views/GetITStreamers.vue";

const routes = [
    {
        path: '/',
        name: 'GetITCategories',
        component: GetITCategories
    },
    {
        path: '/GetITStreamers/:game_name',
        name: 'GetITStreamers',
        component: GetITStreamers
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

