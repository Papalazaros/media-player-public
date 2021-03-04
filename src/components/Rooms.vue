<template>
  <v-container fluid class="pa-0">
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
    const self = this;
    roomService.getAll().then((rooms) => {
      self.rooms = rooms;
    });

    roomService.getMemberships().then((rooms) => {
      self.memberships = rooms;
    });

    videoService.getAll().then((videos) => {
      self.videos = videos;
    });
  },
  data: function () {
    return {
      rooms: [],
      videos: [],
      memberships: [],
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