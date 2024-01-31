<script>
import tokens from "../tokens.json";
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import router from "@/router/router.js";
import Footer from "@/components/Footer.vue";

export default{
  name: 'GetITStreamers',
  components: {Footer},
  setup() {
    const router = useRouter(); // Access router instance

    const gameName = ref('');
    const gameId = ref('');

    onMounted(() => {
      gameName.value = router.currentRoute.value.params.game_name;
      gameId.value = router.currentRoute.value.query.game_id;
    });

    return {
      gameName,
      gameId
    };
  },
  data(){
    return {
      streamersForSpecificCategory: [],
      languageRequested: '',
      keyword: '',
      allImagesLoaded: false,
      streamersBroadcasting: true
    }
  },
  methods: {
    fetchStreamers(filtering){
      if(!filtering)
        this.allImagesLoaded = false;

      this.streamersBroadcasting = true;
      const streamsQueryParams = this.streamQueryConfig(this.languageRequested);
      const StreamsAPISettings = {
        headers: new Headers({
          'Authorization': `Bearer ${tokens.ACCESS_TOKEN}`,
          'Client-Id': `${tokens.CLIENT_ID}`
        }),
        params: streamsQueryParams,
        baseURL: 'https://api.twitch.tv/helix/streams'
      }

      fetch(StreamsAPISettings.baseURL + '?' + StreamsAPISettings.params, {
        headers: StreamsAPISettings.headers
      })
          .then(res => {
            return res.json();
          })
          .then( data => {
            let dataStreamers = [];
            for(let index in data.data){
              dataStreamers.push({
                game_id: data.data[index].game_id,
                game_name: data.data[index].game_name,
                stream_id: data.data[index].id,
                is_mature: data.data[index].is_mature,
                language: data.data[index].language,
                started_at: data.data[index].started_at,
                tag_ids: data.data[index].tag_ids,
                tags: data.data[index].tags,
                thumbnail_url: data.data[index].thumbnail_url
                    .replace('{width}', '320').replace('{height}', '180'),
                title: data.data[index].title,
                type: data.data[index].type,
                user_id: data.data[index].user_id,
                user_login: data.data[index].user_login,
                user_name: data.data[index].user_name,
                viewer_count: data.data[index].viewer_count
              });
            }

            this.streamersForSpecificCategory = dataStreamers.filter(stream => {
              return stream.title.toLowerCase().includes(this.keyword.toLowerCase());
            });

            const streamers = this.streamersForSpecificCategory;
            const imageUrls = streamers.map(streamer => streamer.thumbnail_url);
            let loadedCount = 0;

            const checkAllImagesLoaded = () => {
              loadedCount++;
              if (loadedCount === imageUrls.length) {
                this.allImagesLoaded = true;
              }
            };

            if(imageUrls.length > 0) {
              imageUrls.forEach(url => {
                const img = new Image();
                img.onload = checkAllImagesLoaded;
                img.src = url;
              });
            }
            else {
              this.streamersBroadcasting = false;
              this.allImagesLoaded = true;
            }
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
    },
    goBackToMenu(){
      router.push({
        name: 'GetITCategories'
      })
    },
    streamQueryConfig(language){
      if(language === '' || language === 'all'){
        return new URLSearchParams({
          'type': 'live',
          'first': '100',
          'game_id': this.gameId
        });
      } else {
        return new URLSearchParams({
          'type': 'live',
          'language': language,
          'first': '100',
          'game_id': this.gameId
        });
      }
    }
  },
  mounted() {
    this.fetchStreamers(false);
  }
}
</script>

<template>
  <div class="mainContainer" v-if="this.allImagesLoaded">
    <button @click="goBackToMenu()">Go back to menu</button>
    <br>
    <h1 style="margin-bottom: 2rem;">{{ gameName.toUpperCase() }}</h1>
    <div id="streamersListContainer">
      <div class="languageChoice">
        <label for="languageSelect">Choose a language: </label>
        <select id="languageSelect" v-model="languageRequested" @change="fetchStreamers(false)">
          <option value="">--Choose a language--</option>
          <option value="all">All</option>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="es">Spanish</option>
          <option value="pt">Portuguese</option>
          <option value="it">Italian</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="zh">Chinese</option>
          <option value="ru">Russian</option>
        </select>
        <div class="streamFilter">
          <label for="filterByKeyword">Filter by keyword: </label>
          <input type="text" id="filterByKeyword" placeholder="keyword..." v-model="keyword" @input="fetchStreamers(true)">
        </div>
      </div>
      <br><br>
      <p v-if="!streamersBroadcasting"><i>No streamers broadcasting right now. You should try to choose another language or remove the filter.</i></p>
      <div id="streamers">
        <div class="streamer" v-for="streamer in streamersForSpecificCategory"
             :key="streamer.stream_id">
          <a :href="'https://twitch.tv/' + streamer.user_name" target="_blank">
            <div class="streamerImgContainer">
              <img :src="streamer.thumbnail_url" alt="" class="streamerImg"/>
            </div>
          </a>
          <div class="streamerSubInfo">
            <p>{{streamer.title.substring(0, 40)}}</p>
            <p class="streamerInfo">
              <a :href="'https://twitch.tv/' + streamer.user_name" target="_blank" style="text-decoration: none">
                <span style="color: #bf94ff;">{{streamer.user_name}}</span>
              </a>
              <span style="font-style: italic;"> - {{streamer.viewer_count}} viewers</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <br>
    <Footer></Footer>
  </div>
  <div v-else class="loadingContainer">
    <div class="spinner"></div>
  </div>
</template>

<style>
#streamers{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.streamerInfo{
  font-size: 14px;
}

.streamer {
  margin: 1rem;
}

.languageChoice{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.streamerImgContainer {
  position: relative;
  width: 320px;
  height: 180px;
  overflow: hidden;
  border-radius: 0.5rem;
  border: 2px solid #17171a;
  cursor: pointer;
}

.streamerImgContainer img {
  width: 100%;
  height: auto;
  transition: transform 0.5s ease;
}

.streamerImgContainer:hover img {
  transform: scale(1.1);
}

.streamerSubInfo{
  line-height: 0.6rem;
}

.loadingContainer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  border: 6px solid #f3f3f3; /* Light grey */
  border-top: 6px solid #17171a; /* Blue */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.streamFilter{
  padding-left: 2rem;
}

input{
  margin-left: 0.2rem;
  border: 1px solid white;
  border-radius: 0.2rem;
  background-color: #2c272f;
  color: white;
}

select{
  margin-left: 0.5rem;
  border: 1px solid white;
  border-radius: 0.2rem;
  background-color: #2c272f;
  color: white;
}

button {
  border: 1px solid white;
  border-radius: 0.2rem;
  background-color: #2c272f;
  color: white;
  padding: 0.5rem 1.5rem;
  margin: 1rem;
}

button:hover{
  background-color: #bf94ff;
  color: #17171a;
  cursor: pointer;
}
</style>