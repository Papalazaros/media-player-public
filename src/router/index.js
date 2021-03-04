import Vue from 'vue';
import Router from 'vue-router';
import {
    authGuard
} from "../auth/authGuard";

Vue.use(Router);

function castRouteParams(route) {
    return {
        roomId: Number(route.params.roomId),
    };
}

let router = new Router({
    mode: 'history',
    routes: [{
            path: '/',
            name: 'Home',
            component: () => import('../components/Rooms.vue')
        },
        {
            path: '/library',
            name: 'Library',
            component: () => import('../components/CustomPlayer.vue'),
            beforeEnter: authGuard
        },
        {
            path: '/rooms',
            name: 'Rooms',
            component: () => import('../components/Rooms.vue'),
            beforeEnter: authGuard
        },
        {
            path: '/rooms/:roomId',
            name: 'Room',
            props: castRouteParams,
            component: () => import('../components/CustomPlayer.vue'),
            beforeEnter: authGuard
        }
    ]
});

export default router;