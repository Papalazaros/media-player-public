import Vue from 'vue';
import axios from 'axios';

const client = axios.create({
    baseURL: 'https://localhost:5001/Videos'
});

async function execute(method, url, params, data) {
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
    });
}

export default {
    createVideos(videos) {
        return execute('post', null, null, videos);
    },    
    deleteVideo(videoId) {
        return execute('delete', `/${videoId}`);
    },
    getAll(roomId) {
        let url = '?videoStatus=Ready'
        if (roomId) {
            url += `&roomId=${roomId}`
        }
        return execute('get', url);
    },
    getDetail(videoId) {
        return execute('get', `/${videoId}`);
    }
};