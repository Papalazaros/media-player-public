<template>
  <v-container fluid>
    <v-row dense>
      <v-col v-for="video in videos" :key="video.videoId" :cols="3" align="center">
        <v-card>
          <v-card-title class="justify-center" v-text="video.originalFileName"></v-card-title>
          <v-card-text>
            <Thumbnail width="250px" height="250px" :videoId="video.videoId" />
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon color="success">mdi-plus</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon color="yellow">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon color="error">mdi-delete</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  props: {
    videos: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    Thumbnail: () => import("./Thumbnail.vue"),
  },
  methods: {
    emitItemEvent(event, item) {
      this.$emit(event, item);
    },
  },
  data: function () {
    return {
      actionButtons: [
        {
          icon: "mdi-plus",
          color: "white",
          event: "enqueue-video",
        },
        {
          icon: "mdi-play",
          color: "red",
          event: "play-video",
        },
        {
          icon: "mdi-play",
          color: "yellow",
          event: "play-video",
        },
      ],
    };
  },
};
</script>

<style scoped>
.v-list-item__title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>