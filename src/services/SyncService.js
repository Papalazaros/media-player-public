import Vue from 'vue';
const signalR = require('@microsoft/signalr');
const baseUrl = 'http://localhost:5000';
let connection;

async function sendMessage(roomId, payload) {
    if (connection) {
        let accessToken = await Vue.prototype.$auth.getTokenSilently();
        connection.invoke("ReceiveSyncMessage", roomId, accessToken, payload)
            .catch(err => console.error(err.toString()));
    }
}

export default {
    async createConnection() {
        connection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/videoHub`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Error)
            .build();

        await connection.start({
            transport: ['webSockets', 'longPolling']
        });

        return connection;
    },
    joinRoom(roomId) {
        if (!roomId) return;
        connection.invoke("JoinRoom", roomId)
            .catch(err => console.error(err.toString()));
    },
    sendSeekMessage(roomId, time) {
        sendMessage(roomId, {
            "VideoSyncOperation": "Seek",
            "Payload": time
        });
    },
    sendChangeMessage(roomId, videoId) {
        sendMessage(roomId, {
            "VideoSyncOperation": "ChangeVideo",
            "Payload": videoId
        });
    },
    sendPauseMessage(roomId) {
        sendMessage(roomId, {
            "VideoSyncOperation": "Pause",
        });
    },
    sendStopMessage(roomId) {
        sendMessage(roomId, {
            "VideoSyncOperation": "Stop",
        });
    },
    sendPlayMessage(roomId) {
        sendMessage(roomId, {
            "VideoSyncOperation": "Play",
        });
    }
};