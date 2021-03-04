<template>
  <v-img :max-width="width" :height="height" :src="src"></v-img>
</template>
<script>
export default {
  props: {
    videoId: [String, Number],
    width: String,
    height: String,
  },
  mounted: function () {
    const self = this;

    this.$auth
      .getTokenSilently()
      .then(
        (accessToken) =>
          (self.src = `https://localhost:5001/Videos/${self.videoId}/thumbnail?accessToken=${accessToken}`)
      );
  },
  data: function () {
    return {
      src: "",
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