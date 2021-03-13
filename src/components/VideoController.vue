<template>
  <v-container fluid fill-height class="pa-0">
    <v-row no-gutters>
      <v-progress-linear rounded v-model="progress" id="progress" color="grey" height="15" reactive></v-progress-linear>
    </v-row>
    <v-row class="pt-2" align="center" no-gutters>
      <v-col cols="6" align="start">
        <v-btn small class="mr-2" icon @click="$emit('play-or-pause')">
          <v-icon
            :color="videoState === 'pause' || videoState === 'ended' ? 'success' : 'warning'"
          >{{ videoState === "pause" || videoState === "ended" ? 'mdi-play' : 'mdi-pause' }}</v-icon>
        </v-btn>
        <v-btn small class="mr-2" icon @click="$emit('stop')">
          <v-icon color="error">mdi-stop</v-icon>
        </v-btn>
        <v-btn small class="mr-2" icon @click="$emit('get-previous')">
          <v-icon color="primary">mdi-skip-backward</v-icon>
        </v-btn>
        <v-btn small class="mr-2" icon @click="$emit('get-next')">
          <v-icon color="primary">mdi-skip-forward</v-icon>
        </v-btn>
        <v-btn small class="mr-2" icon @click="$emit('loop-toggle');loop = !loop;">
          <v-icon :color="loop ? 'error' : 'success'">mdi-refresh</v-icon>
        </v-btn>
        <v-btn small icon :disabled="!fullScreenEnabled" @click="$emit('fullscreen')">
          <v-icon>mdi-arrow-expand</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="6" align="end">
        <v-row align="center" no-gutters>
          <v-col class="pr-2" cols="3" align="end">
            <v-btn small icon @click="$emit('mute-or-unmute')">
              <v-icon
                :color="isMuted ? 'grey' : 'white'"
              >{{ isMuted ? 'mdi-volume-off' : 'mdi-volume-high' }}</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="9" align="end">
            <v-progress-linear
              rounded
              v-model="volume"
              id="volume"
              color="grey"
              height="10"
              reactive
            ></v-progress-linear>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  computed: {
    fullScreenEnabled() {
      return !!(
        document.fullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled ||
        document.webkitSupportsFullscreen ||
        document.webkitFullscreenEnabled ||
        document.createElement("video").webkitRequestFullScreen
      );
    },
  },
  props: {
    isMuted: Boolean,
    videoState: String,
    currentTime: Number,
    videoDuration: Number,
  },
  watch: {
    currentTime() {
      const newProgress = (
        (this.currentTime / this.videoDuration) *
        100
      ).toFixed(1);

      if (this.progress != newProgress) {
        this.progress = newProgress;
      }
    },
    volume() {
      this.$emit("volume-changed", this.volume);
    },
    progress() {
      let newTime = ((this.progress / 100) * this.videoDuration).toFixed(2);
      const granularity = Math.min(this.videoDuration * 0.01, 0.25);

      if (
        newTime - this.currentTime > granularity ||
        newTime - this.currentTime < granularity * -1
      ) {
        this.$emit("progress-changed", newTime);
      }
    },
  },
  mounted: function () {
    this.$emit("volume-changed", this.volume);
  },
  data: function () {
    return {
      volume: 25,
      progress: null,
      loop: null,
    };
  },
};
</script>

<style scoped>
#volume {
  width: 100%;
}

#progress {
  width: 100%;
}
</style>