<template>
  <v-container fluid class="pa-0">
    <v-card class="pa-0">
      <v-card-title class="px-1 py-0">
        <v-row no-gutters align="center">
          <v-col sm="12" md="6" align="start">
            <div style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;">
              <span>{{ title }}</span>
              <span style="color: #888">({{ filteredVideos.length }})</span>
            </div>
          </v-col>
          <v-col sm="12" md="6" align="end">
            <v-row style="white-space: nowrap" justify="center" align="center" no-gutters>
              <v-col cols="4">
                <v-btn icon :disabled="pagination.page === 1" @click="pagination.page--">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
              </v-col>
              <v-col cols="4">
                <div>{{ pagination.page + '/' + totalPages }}</div>
              </v-col>
              <v-col cols="4">
                <v-btn icon :disabled="pagination.page === totalPages" @click="pagination.page++">
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-col v-if="includeSearch" cols="12" align="start">
            <v-text-field
              label="Search"
              full-width
              clearable
              dense
              outlined
              hide-details
              single-line
              v-model="search"
              class="pb-2"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-list class="pa-0">
          <template v-for="(item, index) in getVisibleVideos()">
            <v-divider :key="index"></v-divider>
            <slot name="item" v-bind:item="item" v-bind:index="index"></slot>
          </template>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
export default {
  props: {
    videos: {
      type: Array,
      default: () => [],
    },
    title: String,
    includeSearch: Boolean,
  },
  computed: {
    totalPages() {
      return Math.max(
        1,
        Math.ceil(this.filteredVideos.length / this.pagination.itemsPerPage)
      );
    },
  },
  watch: {
    async search() {
      if (!this.searchStarted) {
        this.searchStarted = true;
        if (!this.search && this.filteredVideos.length != this.videos.length) {
          this.filteredVideos = this.videos;
          this.searchStarted = false;
        } else {
          await this.searchMethod();
        }
      }
    },
    async videos() {
      if (this.search) {
        this.searchStarted = true;
        await this.searchMethod();
      } else {
        this.filteredVideos = this.videos;
      }
    },
    searchStarted(oldValue, newValue) {
      if (oldValue && !newValue) {
        this.page = 1;
      }
    },
  },
  mounted: function () {
    this.filteredVideos = this.videos;
  },
  methods: {
    getVisibleVideos() {
      return this.filteredVideos.slice(
        (this.pagination.page - 1) * this.pagination.itemsPerPage,
        this.pagination.page * this.pagination.itemsPerPage
      );
    },
    async searchMethod() {
      let cleanedSearchString = this.search?.toLowerCase().trim();

      while (this.searchStarted) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newSearchString = this.search?.toLowerCase().trim();

        if (cleanedSearchString === newSearchString) {
          this.filteredVideos = this.videos.filter((x) =>
            x.originalFileName.toLowerCase().includes(cleanedSearchString)
          );
          this.searchStarted = false;
        } else {
          cleanedSearchString = newSearchString;
        }
      }
    },
  },
  data: function () {
    return {
      pagination: {
        page: 1,
        itemsPerPage: 10,
      },
      filteredVideos: [],
      search: null,
      searchStarted: false,
      drag: false,      
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