<template>
  <v-container fluid fill-height class="pa-0">
    <v-row no-gutters class="title" align="center" justify="center">
      <slot name="title"></slot>
    </v-row>
    <v-row
      oncontextmenu="return false"
      no-gutters
      class="video-row"
      align="center"
      justify="center"
    >
      <slot id="video" name="video"></slot>
    </v-row>
    <v-row no-gutters class="py-2 text-center message" align="end" justify="center">
      <slot name="controller"></slot>
    </v-row>
  </v-container>
</template>
<script>
export default {
  data: function () {
    return {
      video: null,
    };
  },
};
</script>

<style scoped>
video::-webkit-media-controls {
  display: none !important;
}

.title,
.message {
  overflow: hidden;
  text-overflow: ellipsis;
}

.message {
  max-height: 75px;
  min-height: 75px;
  font-size: 18px;
}

#video {
  max-height: 80vh;
  min-height: 80vh;
  width: 100%;
}
</style>