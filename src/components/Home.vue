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
    <Library :videos="$store.getters.getAllVideos" />
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
  },
  methods: {
    uploadFiles() {
      if (!(this.selectedFiles && this.selectedFiles.length)) {
        return;
      }

      const formData = new FormData();
      this.selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      videoService.createVideos(formData).then(() => {
        this.selectedFiles = [];
      });
    }
  },
  data: function () {
    return {
      rooms: [],
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