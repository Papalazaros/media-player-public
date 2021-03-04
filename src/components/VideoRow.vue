<template>
  <v-hover v-slot:default="{ hover }">
    <v-container
      fluid
      :class="{ 'on-hover': hover && clickEvent }"
      @click="clickEvent ? emitItemEvent('click-video') : ''"
      v-ripple="clickEvent"
      class="pa-2"
    >
      <v-row no-gutters align="center">
        <v-col :cols="actionButtons ? '2' : '4'" v-if="showThumbnail" align="start">
          <Thumbnail width="100px" height="100px" :videoId="video.videoId" />
          <v-img></v-img>
        </v-col>
        <v-col class="px-2" :cols="titleColumns" align="start">
          <div class="video-title" v-text="title" />
          <div v-if="showDetails">
            <div style="color: red">
              {{ duration }}
              <span style="color: #888">{{ '(' + sizeInMb + ' mb)' }}</span>
            </div>
            <div style="color: #888">{{ new Date(video.createdDate).toDateString() }}</div>
          </div>
        </v-col>
        <v-col v-if="actionButtons" cols="2" align="end">
          <template v-for="(item, index) in actionButtons">
            <v-btn :key="index" icon small @click="emitItemEvent(item.event)">
              <v-icon :color="item.color">{{ item.icon }}</v-icon>
            </v-btn>
          </template>
        </v-col>
      </v-row>
    </v-container>
  </v-hover>
</template>
<script>
export default {
  props: {
    video: {
      type: Object,
      default: function () {
        return {};
      },
    },
    showDetails: Boolean,
    showThumbnail: Boolean,
    clickEvent: Boolean,
    actionButtons: Array,
  },
  components: {
    Thumbnail: () => import("./Thumbnail.vue"),
  },
  computed: {
    titleColumns: function () {
      let availableColumns = 12;

      if (this.actionButtons) {
        if (this.showThumbnail) {
          availableColumns -= 4;
        } else {
          availableColumns -= 2;
        }
      } else {
        availableColumns -= 4;
      }

      return availableColumns;
    },
    styleObject: function () {
      return {
        cursor: this.clickEvent ? "pointer" : "auto",
        color: "white",
        "color-hover": "black",
      };
    },
    title() {
      if (!this.video) return null;

      return this.video.originalFileName.slice(
        0,
        this.video.originalFileName.indexOf(".")
      );
    },
    sizeInMb() {
      if (!this.video) return 0;

      return (this.video.length * 1e-6).toFixed(2);
    },
    duration() {
      if (!this.video) return 0;

      const minutes = Math.floor(this.video.durationInSeconds / 60);
      const seconds = this.video.durationInSeconds % 60;

      if (this.video.durationInSeconds < 60) {
        return seconds + "s";
      }

      if (!seconds) {
        return minutes + "m ";
      }

      return minutes + "m " + seconds + "s";
    },
  },
  methods: {
    emitItemEvent(event) {
      this.$emit(event);
    },
  },
};
</script>

<style scoped>
.on-hover {
  background-color: rgba(75, 75, 75, 0.5);
  cursor: pointer;
}
.video-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>