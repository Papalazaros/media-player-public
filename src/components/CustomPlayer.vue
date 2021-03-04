<template>
  <v-container justify-center align-start fill-height fluid class="pa-0">
    <v-row no-gutters>
      <v-col class="pa-2" lg="9" sm="12">
        <VideoContainer id="videoContainer">
          <template v-slot:title>
            <div>{{ currentVideoDetail ? getVideoTitle(currentVideoDetail) : null }}</div>
          </template>
          <template v-slot:video>
            <video
              @click="playOrPauseVideo"
              @ended="getNextVideo()"
              autoplay
              muted
              id="video"
              preload="metadata"
              controlslist="nodownload noremoteplayback"
              disablepictureinpicture
            >
              <source />
            </video>
          </template>
          <template v-if="video" v-slot:controller>
            <VideoController
              :videoState="videoState"
              :isMuted="isMuted"
              :currentTime="currentTime"
              :videoDuration="videoDuration"
              @play-or-pause="playOrPauseVideo"
              @stop="stopVideo"
              @get-previous="getPreviousVideo"
              @get-next="getNextVideo"
              @fullscreen="handleFullscreen"
              @volume-changed="handleVolumeChange"
              @progress-changed="handleProgressChange"
              @mute-or-unmute="muteOrUnmuteVideo"
            />
          </template>
        </VideoContainer>
      </v-col>
      <v-col align="center" class="pa-2" lg="3" sm="12">
        <v-row style="width: 100%" class="pb-2" no-gutters>
          <v-col class="pr-2" align="start">
            <v-btn :disabled="selectedTab === 0" block color="primary" @click="selectedTab = 0">
              <v-icon>mdi-view-list</v-icon>
            </v-btn>
          </v-col>
          <v-col class="pr-2" align="center">
            <v-btn :disabled="selectedTab === 1" block color="error" @click="selectedTab = 1">
              <v-icon>mdi-skip-next</v-icon>
            </v-btn>
          </v-col>
          <v-col align="end">
            <v-btn :disabled="selectedTab === 2" block color="success" @click="selectedTab = 2">
              <v-icon>mdi-history</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <LibraryMini
          v-if="selectedTab === 0"
          v-on:play-video="playVideo"
          v-on:enqueue-video="addToQueue"
          class="side-card"
          :videos="allVideos"
        />
        <ItemList v-if="selectedTab === 1" class="side-card" title="Queued" :videos="nextVideos">
          <template v-slot:item="{ item, index }">
            <VideoRow
              :video="item"
              :key="item.videoId.toString() + index"
              :clickEvent="false"
              :actionButtons="actionButtons"
              :showThumbnail="true"
              :showDetails="true"
              @delete-video="removeFromQueue(index)"
            />
          </template>
        </ItemList>
        <ItemList v-if="selectedTab === 2" class="side-card" title="Played" :videos="playedVideos">
          <template v-slot:item="{ item }">
            <VideoRow
              :video="item"
              :key="item.videoId.toString() + index"
              :clickEvent="true"
              :showThumbnail="true"
              :showDetails="true"
              @click-video="playVideo(item)"
            />
          </template>
        </ItemList>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import VideoContainer from "./VideoContainer";
import syncService from "../services/SyncService";
import roomService from "../services/RoomService";
import videoService from "../services/VideoService";

export default {
  beforeRouteEnter(to, from, next) {
    roomService.canView(to.params.roomId).then((canView) => {
      if (canView) next();
    });
  },
  components: {
    LibraryMini: () => import("./LibraryMini.vue"),
    VideoRow: () => import("./VideoRow.vue"),
    ItemList: () => import("./ItemList.vue"),
    VideoController: () => import("./VideoController.vue"),
    VideoContainer,
  },
  computed: {
    recentlyPlayedVideos() {
      const self = this;
      if (self.playedVideos.length <= 10) return self.playedVideos;
      return self.playedVideos.slice(10 * -1, -1);
    },
  },
  props: {
    videoId: String,
    roomId: Number,
  },
  watch: {
    currentVideoDetail(newVideo, oldVideo) {
      const self = this;

      if (
        (oldVideo && self.playedVideos.length === 0) ||
        (self.playedVideos.length &&
          self.playedVideos[self.playedVideos.length - 1].videoId !=
            oldVideo.videoId)
      ) {
        self.playedVideos.push(oldVideo);
      }

      self
        .getStreamFromVideoId(self.currentVideoDetail.videoId)
        .then((src) => (self.video.src = src));

      syncService.sendChangeMessage(
        self.roomId,
        self.currentVideoDetail.videoId
      );
    },
  },
  mounted: async function () {
    const self = this;

    self.initializeElements();
    self.addListeners();

    if (self.videoId) {
      self.getVideoDetail(self.videoId).then((videoDetail) => {
        self.currentVideoDetail = videoDetail;
      });
    } else {
      self.getNextVideo();
    }

    videoService.getAll(self.roomId).then((allVideos) => {
      self.allVideos = allVideos;
    });

    syncService.createConnection().then((connection) => {
      self.connection = connection;
      syncService.joinRoom(self.roomId);
      self.connection.on("VideoSyncMessage", (message) =>
        self.messageReceived(message)
      );
    });

    roomService.canEdit(self.roomId).then((canEdit) => {
      self.canEdit = canEdit;
    });
  },
  methods: {
    handleVolumeChange(volume) {
      const self = this;
      self.video.volume = (volume / 100).toFixed(2);
    },
    handleProgressChange(time) {
      const self = this;
      self.video.currentTime = time;
      syncService.sendSeekMessage(self.roomId, time);
    },
    messageReceived(message) {
      const self = this;
      if (!self.syncronized) return;

      const parsedValue = parseFloat(message.payload);

      switch (message.videoSyncOperation.toLowerCase()) {
        case "stop":
          self.stopVideo();
          break;
        case "pause":
          self.video.pause();
          break;
        case "play":
          self.video.play();
          break;
        case "seek":
          if (parsedValue >= 0 && parsedValue <= self.video.duration) {
            self.handleProgressChange(parsedValue);
          }
          break;
        case "changevideo":
          if (self.currentVideoDetail.videoId != message.payload) {
            self.getVideoDetail(message.payload).then((videoDetail) => {
              self.playVideo(videoDetail);
            });
          }
          break;
        default:
          console.log(message);
          break;
      }
    },
    getVideoTitle(videoDetail) {
      return videoDetail.originalFileName.slice(
        0,
        videoDetail.originalFileName.indexOf(".")
      );
    },
    playVideo(videoDetail) {
      const self = this;
      if (!videoDetail) return;
      self.currentVideoDetail = videoDetail;
    },
    initializeElements() {
      const self = this;

      self.video = document.getElementById("video");
      self.video.controls = false;
      self.videoContainer = document.getElementById("videoContainer");
      self.isMuted = self.video.muted;
    },
    addListeners() {
      const self = this;

      document.addEventListener("fullscreenchange", function () {
        self.setFullscreenData(
          !!(document.fullScreen || document.fullscreenElement)
        );
      });
      document.addEventListener("webkitfullscreenchange", function () {
        self.setFullscreenData(!!document.webkitIsFullScreen);
      });
      document.addEventListener("mozfullscreenchange", function () {
        self.setFullscreenData(!!document.mozFullScreen);
      });
      document.addEventListener("msfullscreenchange", function () {
        self.setFullscreenData(!!document.msFullscreenElement);
      });

      if (!self.video) return;

      self.video.addEventListener("timeupdate", function () {
        self.currentTime = self.video.currentTime;
      });

      self.video.addEventListener("ended", self.trackVideoState);
      self.video.addEventListener("pause", self.trackVideoState);
      self.video.addEventListener("play", self.trackVideoState);
      self.video.addEventListener("volumechange", self.trackAudioState);
      self.video.addEventListener(
        "durationchange",
        () => (self.videoDuration = self.video.duration)
      );
    },
    trackVideoState(e) {
      const self = this;
      self.videoState = e.type;
    },
    trackAudioState() {
      const self = this;
      self.isMuted = self.video.muted;
    },
    playOrPauseVideo() {
      const self = this;
      if (self.video.paused || self.video.ended) {
        self.video.play();
        syncService.sendPlayMessage(self.roomId);
      } else {
        self.video.pause();
        syncService.sendPauseMessage(self.roomId);
      }
    },
    stopVideo() {
      const self = this;
      self.video.pause();
      self.handleProgressChange(0);
      syncService.SendStopMessage(self.roomId);
    },
    muteOrUnmuteVideo() {
      const self = this;
      self.video.muted = !self.video.muted;
    },
    getNextVideo() {
      const self = this;

      if (self.nextVideos.length) {
        const previousVideoDetail = self.currentVideoDetail;
        self.currentVideoDetail = self.nextVideos.shift();

        if (previousVideoDetail === self.currentVideoDetail) {
          self.handleProgressChange(0);
          self.video.play();
        }
      } else {
        videoService.getRandom(self.roomId).then(async (ids) => {
          if (ids && ids.length) {
            self.currentVideoDetail = ids[0];
          }
        });
      }
    },
    getVideoDetail(videoId) {
      return videoService.getDetail(videoId);
    },
    async getStreamFromVideoId(videoId) {
      const self = this;
      if (videoId) {
        let accessToken = await self.$auth.getTokenSilently();
        return `https://localhost:5001/Videos/${videoId}/Stream?accessToken=${accessToken}`;
      }

      return null;
    },
    getPreviousVideo() {
      const self = this;

      if (
        self.video.currentTime / self.video.duration > 0.15 ||
        self.playedVideos.length === 0
      ) {
        self.handleProgressChange(0);
      } else if (self.playedVideos.length > 0) {
        self.nextVideos.unshift(self.currentVideoDetail);
        self.currentVideoDetail = self.playedVideos.pop();
      }
    },
    isFullScreen() {
      return !!(
        document.fullScreen ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement ||
        document.fullscreenElement
      );
    },
    handleFullscreen() {
      const self = this;
      if (self.isFullScreen()) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitCancelFullScreen)
          document.webkitCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        self.setFullscreenData(false);
      } else {
        if (self.videoContainer.requestFullscreen)
          self.videoContainer.requestFullscreen();
        else if (self.videoContainer.mozRequestFullScreen)
          self.videoContainer.mozRequestFullScreen();
        else if (self.videoContainer.webkitRequestFullScreen)
          self.videoContainer.webkitRequestFullScreen();
        else if (self.videoContainer.msRequestFullscreen)
          self.videoContainer.msRequestFullscreen();
        self.setFullscreenData(true);
      }
    },
    setFullscreenData(state) {
      const self = this;
      self.videoContainer.setAttribute("data-fullscreen", !!state);
    },
    addToQueue(video) {
      const self = this;
      self.nextVideos.push(video);
    },
    removeFromQueue(index) {
      const self = this;
      self.nextVideos.splice(index, 1);
    },
  },
  data: function () {
    return {
      playedVideos: [],
      nextVideos: [],
      allVideos: [],
      videoContainer: null,
      video: null,
      videoState: null,
      isMuted: null,
      currentVideoDetail: null,
      currentMessage: null,
      connection: null,
      selectedTab: 0,
      currentTime: null,
      videoDuration: null,
      messages: [],
      syncronized: true,
      canEdit: false,
      actionButtons: [
        {
          icon: "mdi-delete",
          color: "error",
          event: "delete-video",
        },
      ],
    };
  },
};
</script>

<style scoped>
video::-webkit-media-controls {
  display: none !important;
}

#volume {
  width: 50%;
}

#progress {
  width: 100%;
}

.side-card {
  -ms-overflow-style: none;
  overflow-y: scroll;
  width: 100%;
  max-height: 80vh;
  min-height: 80vh;
}

.side-card::-webkit-scrollbar {
  display: none;
}
</style>