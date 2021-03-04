import Vue from 'vue';
import axios from 'axios';

const client = axios.create({
    baseURL: 'https://localhost:5001/Videos'
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
    getRandom(roomId) {
        let url = '/Random?count=1&videoStatus=Ready';

        if (roomId) {
            url += `&roomId=${roomId}`;
        }

        return execute('get', url);
    },
    getAll(roomId) {
        let url = '?videoStatus=Ready';

        if (roomId) {
            url += `&roomId=${roomId}`;
        }
        return execute('get', url);
    },
    getDetail(videoId) {
        return execute('get', `/${videoId}`);
    },
    getThumbnail(videoId) {
        return execute('get', `/${videoId}/thumbnail`);
    },
    getStream(videoId) {
        return execute('get', `/${videoId}/Stream`);
    }
};