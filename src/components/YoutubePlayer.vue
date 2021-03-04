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

    const self = this;
    this.player.on("unstarted", () => (self.state = "unstarted"));
    this.player.on("ended", () => (self.state = "ended"));
    this.player.on("playing", () => (self.state = "playing"));
    this.player.on("paused", () => (self.state = "paused"));
    this.player.on("buffering", () => (self.state = "buffering"));
    this.player.on("cued", () => (self.state = "cued"));
  },
  data: function () {
    return {
      player: null,
      state: null,
    };
  },
};
</script>
