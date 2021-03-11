import Vue from 'vue';
import axios from 'axios';

const client = axios.create({
    baseURL: 'https://localhost:5001/Videos'
});

async function execute(method, url, params, data, headers) {
    let accessToken = await Vue.prototype.$auth.getTokenSilently();

    return client({
        method,
        url,
        params,
        data,
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then(req => {
        return req.data;
    }).catch((error) => {
        console.log(error);
        return error;
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
    createVideo(video) {
        return execute('post', null, null, video);
    },
    deleteVideo(videoId) {
        return execute('delete', `/${videoId}`);
    },
    getAll() {
        return execute('get', '?videoStatus=Ready');
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