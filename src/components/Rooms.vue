<template>
  <v-container fluid class="pa-0">
    <v-file-input
      truncate-length="15"
      accept="video/*"
      multiple
      v-model="selectedFiles"
    ></v-file-input>
    <v-btn color="success" @click="uploadFiles">Upload Files</v-btn>
    <h1>Your rooms:</h1>
    <v-list class="pa-0">
      <template v-for="(room, index) in rooms">
        <v-list-item :key="index" :to="`/Rooms/${room.roomId}`" exact>
          <v-list-item-content>
            <v-list-item-title>{{ room.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
    <h1>Rooms you have access to:</h1>
    <v-list class="pa-0">
      <template v-for="(room, index) in memberships">
        <v-list-item :key="index" :to="`/Rooms/${room.roomId}`" exact>
          <v-list-item-content>
            <v-list-item-title>{{ room.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
    <h1>Your library:</h1>
    <Library :videos="videos" />
  </v-container>
</template>
<script>
import roomService from "../services/RoomService";
import videoService from "../services/VideoService";

export default {
  components: {
    Library: () => import("./Library.vue"),
  },
  mounted: async function () {
    roomService.getAll().then((rooms) => {
      this.rooms = rooms;
    });

    roomService.getMemberships().then((rooms) => {
      this.memberships = rooms;
    });

    videoService.getAll().then((videos) => {
      this.videos = videos;
    });
  },
  methods: {
    uploadFiles() {
      if (!(this.selectedFiles && this.selectedFiles.length)) {
        return;
      }
      this.selectedFiles.forEach(file => {
        let formData = new FormData();
        formData.append('file', file);
        videoService.createVideo(formData).then((res) => {
          if (res && !res.isAxiosError && res.status === 'Uploaded') {
            const foundFileIndex = this.selectedFiles.findIndex(x => x.name === file.name);
            if (foundFileIndex !== -1) {
              this.selectedFiles.splice(foundFileIndex, 1);
            }
          }
        });
      });
    }
  },
  data: function () {
    return {
      rooms: [],
      videos: [],
      memberships: [],
      selectedFiles: [],
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