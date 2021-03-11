<template>
  <div>
    <div class="player-container">
      <div id="player"></div>
    </div>
    <Controller
      v-if="player"
      v-on:start="player.play()"
      v-on:pause="player.pause()"
      :state="state"
    />
  </div>
</template>

<script>
const YTPlayer = require("yt-player");

export default {
  components: {
    Controller: () => import("./Controller.vue"),
  },
  props: {
    videoId: String,
  },
  mounted: function () {
    this.player = new YTPlayer("#player", {
      controls: false,
      keyboard: false,
      fullscreen: false,
      annotations: false,
      modestBranding: true,
      related: false,
    });

    this.player.load(this.videoId);
    this.player.setPlaybackQuality("highres");

    if (!this.player.isMuted()) {
      this.player.setVolume(25);
    }

    this.player.on("unstarted", () => (this.state = "unstarted"));
    this.player.on("ended", () => (this.state = "ended"));
    this.player.on("playing", () => (this.state = "playing"));
    this.player.on("paused", () => (this.state = "paused"));
    this.player.on("buffering", () => (this.state = "buffering"));
    this.player.on("cued", () => (this.state = "cued"));
  },
  data: function () {
    return {
      player: null,
      state: null,
    };
  },
};
</script>
