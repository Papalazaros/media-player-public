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
              @loop-toggle="toggleLoop"
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
          <template v-slot:item="{ item, index }">
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
import VideoController from "./VideoController";
import ItemList from "./ItemList";
import VideoRow from "./VideoRow";
import LibraryMini from "./LibraryMini";
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
    LibraryMini,
    VideoRow,
    ItemList,
    VideoController,
    VideoContainer,
  },
  computed: {
    recentlyPlayedVideos() {
      if (this.playedVideos.length <= 10) return this.playedVideos;
      return this.playedVideos.slice(10 * -1, -1);
    },
  },
  props: {
    videoId: String,
    roomId: Number,
  },
  watch: {
    currentVideoDetail(newVideo, oldVideo) {
      if (
        (oldVideo && this.playedVideos.length === 0) ||
        (this.playedVideos.length &&
          this.playedVideos[this.playedVideos.length - 1].videoId !=
            oldVideo.videoId)
      ) {
        this.playedVideos.push(oldVideo);
      }

      if (this.currentVideoDetail) {
        this
          .getStreamFromVideoId(this.currentVideoDetail.videoId)
          .then((src) => (this.video.src = src));

        syncService.sendSyncMessage(
          this.roomId,
          {
            video: this.currentVideoDetail,
            currentTime: this.video.currentTime,
            videoState: this.videoState,
          },
        );
      }
    },
  },
  created: async function() {
    this.allVideos = await videoService.getAll(this.roomId);
  },
  mounted: async function () {
    this.initializeElements();
    this.addListeners();

    if (this.videoId) {
      this.getVideoDetail(this.videoId).then((videoDetail) => {
        this.currentVideoDetail = videoDetail;
      });
    } else {
      this.getNextVideo();
    }

    syncService.createConnection().then((connection) => {
      this.connection = connection;
      syncService.joinRoom(this.roomId);
      this.connection.on("VideoSyncMessage", (message) =>
        this.messageReceived(message)
      );
    });

    roomService.canEdit(this.roomId).then((canEdit) => {
      this.canEdit = canEdit;
    });

    this.$nextTick(function () {
        window.setInterval(() => {
          syncService.sendSyncMessage(
            this.roomId,
            {
              video: this.currentVideoDetail,
              currentTime: this.video.currentTime,
              videoState: this.videoState,
            },
          );
        }, 5000);
    });
  },
  methods: {
    toggleLoop() {
      this.loop = !this.loop;
    },
    handleVolumeChange(volume) {
      this.video.volume = (volume / 100).toFixed(2);
    },
    handleProgressChange(time) {
      this.video.currentTime = time;
      syncService.sendSeekMessage(this.roomId, time);
    },
    messageReceived(message) {
      if (!this.syncronized) return;
      switch (message.videoSyncOperation.toLowerCase()) {
        case "sync":
          this.playVideo(message.payload.video);

          this.$nextTick(() => {
            if (message.payload.currentTime && this.video.currentTime > message.payload.currentTime * 1.05 || this.video.currentTime < message.payload.currentTime * 0.95) {
              this.video.currentTime = parseFloat(message.payload.currentTime);
            }
          })
          break;
        case "stop":
          this.stopVideo();
          break;
        case "pause":
          this.video.pause();
          break;
        case "play":
          this.video.play();
          break;
        case "seek":
          this.video.currentTime = parseFloat(message.payload.currentTime);
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
      if (!videoDetail || (this.currentVideoDetail && this.currentVideoDetail.videoId == videoDetail.videoId)) return;
      const currentIndex = this.allVideos.findIndex(video => video.videoId === videoDetail.videoId);
      this.currentVideoIndex = currentIndex;
      this.currentVideoDetail = videoDetail;
    },
    initializeElements() {
      this.video = document.getElementById("video");
      this.video.controls = false;
      this.videoContainer = document.getElementById("videoContainer");
      this.isMuted = this.video.muted;
    },
    addListeners() {
      document.addEventListener("fullscreenchange", () => {
        this.setFullscreenData(
          !!(document.fullScreen || document.fullscreenElement)
        );
      });
      document.addEventListener("webkitfullscreenchange", () => {
        this.setFullscreenData(!!document.webkitIsFullScreen);
      });
      document.addEventListener("mozfullscreenchange", () => {
        this.setFullscreenData(!!document.mozFullScreen);
      });
      document.addEventListener("msfullscreenchange", () => {
        this.setFullscreenData(!!document.msFullscreenElement);
      });

      if (!this.video) return;

      this.video.addEventListener("timeupdate", () => {
        this.currentTime = this.video.currentTime;
      });

      this.video.addEventListener("ended", this.trackVideoState);
      this.video.addEventListener("pause", this.trackVideoState);
      this.video.addEventListener("play", this.trackVideoState);
      this.video.addEventListener("volumechange", this.trackAudioState);
      this.video.addEventListener(
        "durationchange",
        () => (this.videoDuration = this.video.duration)
      );
    },
    trackVideoState(e) {
      this.videoState = e.type;
    },
    trackAudioState() {
      this.isMuted = this.video.muted;
    },
    playOrPauseVideo() {
      if (this.video.paused || this.video.ended) {
        this.video.play();
        syncService.sendPlayMessage(this.roomId);
      } else {
        this.video.pause();
        syncService.sendPauseMessage(this.roomId);
      }
    },
    stopVideo() {
      this.video.pause();
      this.handleProgressChange(0);
      syncService.sendStopMessage(this.roomId);
    },
    muteOrUnmuteVideo() {
      this.video.muted = !this.video.muted;
    },
    getNextVideo() {
      if (this.loop) {
        this.handleProgressChange(0);
        this.video.play();
      } else if (this.nextVideos.length) {
        const previousVideoDetail = this.currentVideoDetail;
        this.currentVideoDetail = this.nextVideos.shift();

        if (previousVideoDetail === this.currentVideoDetail) {
          this.handleProgressChange(0);
          this.video.play();
        }
      } else {
        if (this.currentVideoDetail && this.allVideos.length > this.currentVideoIndex + 1) {
          this.currentVideoIndex++;
        }
        else {
          this.currentVideoIndex = 0;
        }

        this.currentVideoDetail =  this.allVideos[this.currentVideoIndex];
      }
    },
    getVideoDetail(videoId) {
      return videoService.getDetail(videoId);
    },
    async getStreamFromVideoId(videoId) {
      if (videoId) {
        let accessToken = await this.$auth.getTokenSilently();
        return `https://localhost:5001/Videos/${videoId}/Stream?accessToken=${accessToken}`;
      }

      return null;
    },
    getPreviousVideo() {
      if (
        this.video.currentTime / this.video.duration > 0.15
      ) {
        this.handleProgressChange(0);
      } else if (this.currentVideoDetail) {
        const currentIndex = this.allVideos.findIndex(video => video.videoId === this.currentVideoDetail.videoId);

        if (currentIndex === 0) {
          this.currentVideoIndex = this.allVideos.length - 1;
        }
        else {
          this.currentVideoIndex--;
        }

        this.currentVideoDetail = this.allVideos[this.currentVideoIndex];
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
      if (this.isFullScreen()) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitCancelFullScreen)
          document.webkitCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        this.setFullscreenData(false);
      } else {
        if (this.videoContainer.requestFullscreen)
          this.videoContainer.requestFullscreen();
        else if (this.videoContainer.mozRequestFullScreen)
          this.videoContainer.mozRequestFullScreen();
        else if (this.videoContainer.webkitRequestFullScreen)
          this.videoContainer.webkitRequestFullScreen();
        else if (this.videoContainer.msRequestFullscreen)
          this.videoContainer.msRequestFullscreen();
        this.setFullscreenData(true);
      }
    },
    setFullscreenData(state) {
      this.videoContainer.setAttribute("data-fullscreen", !!state);
    },
    addToQueue(video) {
      this.nextVideos.push(video);
    },
    removeFromQueue(index) {
      this.nextVideos.splice(index, 1);
    },
  },
  data: function () {
    return {
      allVideos: [],
      playedVideos: [],
      nextVideos: [],
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
      currentVideoIndex: 0,
      loop: false,
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