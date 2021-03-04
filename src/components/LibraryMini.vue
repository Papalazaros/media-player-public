<template>
  <v-container fluid class="pa-0">
    <ItemList title="Library" :videos="videos" :includeSearch="true">
      <template v-slot:item="{ item, index }">
        <VideoRow
          :video="item"
          :key="item.videoId.toString() + index"
          :showThumbnail="true"
          :showDetails="true"
          :actionButtons="actionButtons"
          @play-video="emitItemEvent('play-video', item)"
          @enqueue-video="emitItemEvent('enqueue-video', item)"
        />
      </template>
    </ItemList>
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
    VideoRow: () => import("./VideoRow.vue"),
    ItemList: () => import("./ItemList.vue"),
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
          icon: "mdi-play",
          color: "green",
          event: "play-video",
        },
        {
          icon: "mdi-plus",
          color: "white",
          event: "enqueue-video",
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