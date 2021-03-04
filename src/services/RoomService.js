import Vue from 'vue';
import axios from 'axios';

const client = axios.create({
    baseURL: 'https://localhost:5001/Rooms'
});

async function execute(method, resource, params, data) {
    let accessToken = await Vue.prototype.$auth.getTokenSilently();

    return client({
        method,
        url: resource,
        data,
        params,
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then(req => {
        return req.data;
    }).catch((error) => {
        console.log(error);
    });
}

export default {
    getAll() {
        return execute('get');
    },
    getMemberships() {
        return execute('get', "Memberships");
    },
    get(roomId) {
        return execute('get', `/${roomId}`);
    },
    canView(roomId) {
        return execute('get', `/${roomId}/CanView`);
    },
    canEdit(roomId) {
        return execute('get', `/${roomId}/CanEdit`);
    }
};