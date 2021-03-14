<template>
  <v-img @mouseenter="src = `https://localhost:5001/Videos/${videoId}/preview?accessToken=${accessToken}`" @mouseleave="src = `https://localhost:5001/Videos/${videoId}/thumbnail?accessToken=${accessToken}`" :max-width="width" :height="height" :src="src"></v-img>
</template>
<script>
export default {
  props: {
    videoId: [String, Number],
    width: String,
    height: String,
  },
  created: async function () {
    this.accessToken = await this.$auth.getTokenSilently();
    this.src = `https://localhost:5001/Videos/${this.videoId}/thumbnail?accessToken=${this.accessToken}`;
  },
  data: function () {
    return {
      accessToken: null,
      src: null,
    };
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