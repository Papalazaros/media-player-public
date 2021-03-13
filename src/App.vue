<template>
  <v-app>
    <v-app-bar app dark>
      <v-row align="center" no-gutters v-if="!$auth.loading">
        <v-col align="start">
          <v-btn v-if="$auth.isAuthenticated" to="/">HOME</v-btn>
          <v-btn color="success" v-if="!$auth.isAuthenticated" @click="login">Sign In</v-btn>
          <v-btn color="error" v-if="$auth.isAuthenticated" @click="logout">Logout</v-btn>
        </v-col>
        <v-col v-if="$auth.isAuthenticated" align="end">{{ $auth.user.email }}</v-col>
      </v-row>
    </v-app-bar>
    <v-main v-if="$auth.isAuthenticated">
      <router-view :key="$route.fullPath" />
    </v-main>
  </v-app>
</template>
<script>
export default {
  watch: {
    '$auth.isAuthenticated': {
      handler: function() {
        this.$store.dispatch("setAllVideos"); 
      },
      immediate: true,
    }
  },
  methods: {
    async login() {
      this.$auth.loginWithRedirect();
    },
    logout() {
      this.$auth.logout({
        returnTo: window.location.origin,
      });
    },
  },
};
</script>
<style>
</style>
