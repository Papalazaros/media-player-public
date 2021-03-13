import Vue from "vue";
import Vuex from "vuex";
import videoService from "../services/VideoService";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        all_videos: [],
    },
    getters: {
        getAllVideos(state) {
            return state.all_videos;
        }
    },
    mutations: {
        SET_PROPERTY(state, {
            property,
            key,
            value
        }) {
            Vue.set(property ? state[property] : state, key, value);
        },
        REMOVE_VIDEO(state, videoId) {
            const foundFileIndex = state.all_videos.findIndex(video => video.videoId === videoId);

            if (foundFileIndex !== -1) {
                state.all_videos.splice(foundFileIndex, 1);
            }
        }
    },
    actions: {
        setAllVideos({
            commit
        }) {
            videoService.getAll().then((allVideos) => {
                if (allVideos) {
                    commit("SET_PROPERTY", {
                        key: "all_videos",
                        value: allVideos
                    });
                    this.allVideos = allVideos;
                }
            });
        },
        removeVideo({
            commit,
        }, videoId) {
            commit("REMOVE_VIDEO", videoId);
        }
    }
});