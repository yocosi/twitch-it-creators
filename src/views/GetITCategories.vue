<script>
import tokens from "../tokens.json";
import router from "../router/router.js";
import Footer from "@/components/Footer.vue";

export default{
  name: 'GetITCategories',
  components: {Footer},
  data(){
    return {
      categories : []
    }
  },
  methods: {
    fetchCategories(){
      const categoriesQueryParams = new URLSearchParams();
      const categoryNames = ['Software and Game Development', 'Science & Technology'];
      categoryNames.forEach(name => {
        categoriesQueryParams.append('name', name);
      });

      const GamesAPISettings = {
        headers: new Headers({
          'Authorization': `Bearer ${tokens.ACCESS_TOKEN}`,
          'Client-Id': `${tokens.CLIENT_ID}`
        }),
        params: categoriesQueryParams,
        baseURL: 'https://api.twitch.tv/helix/games'
      }

      fetch(GamesAPISettings.baseURL + '?' + GamesAPISettings.params, {
        method: 'GET',
        headers: GamesAPISettings.headers
      })
          .then(res => {
            return res.json();
          })
          .then(data => {
              let dataCategories = [];
              for(let index in data.data){
                dataCategories.push({
                  id: data.data[index].id,
                  name: data.data[index].name,
                  box_art_url: data.data[index].box_art_url
                      .replace('{width}', '285').replace('{height}', '380'),
                  igdb_id: data.data[index].igdb_id
                });
              }

              this.categories = dataCategories;
          })
    },
    goToStreamersList(categoryId, categoryName){
      router.push({
        name: 'GetITStreamers',
        params: {
          game_name: categoryName
        },
        query: {
          game_id: categoryId,
        }
      });
    }
  },
  mounted() {
    this.fetchCategories();
  }
}
</script>

<template>
  <h1>Twitch IT Creators</h1>
  <p style="font-size: 18px;">
    Choose one of the following categories to see all the streamers
    currently broadcasting their IT related work
    on <span style="text-decoration: underline"><a href="https://twitch.tv/" style="color: white;" target="_blank">Twitch</a></span>
  </p>
  <div id="categories">
    <div class="category" v-for="category in categories"
    :key="category.id">
      <div class="categoryImgContainer">
        <img :src="category.box_art_url" alt="" class="categoryImg" @click="goToStreamersList(category.id, category.name)">
      </div>
      <div v-if="category.name === 'Software and Game Development'">
        <p>Mostly Programming</p>
        <p style="opacity: 0.5;">(software engineering <br>or video games development)</p>
      </div>
      <div v-else>
        <p>Mostly general purpose scientific stuff</p>
        <p style="opacity: 0.5;">(From simple programming <br>all the way to growing plants in the garden)</p>
      </div>
    </div>
  </div>
  <br>
  <Footer></Footer>
</template>

<style>
#categories{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.category {
  margin: 2rem;
  cursor: pointer;
}

.categoryImgContainer {
  position: relative;
  width: 285px;
  height: 380px;
  overflow: hidden;
  border-radius: 0.5rem;
  border: 2px solid #17171a;
  margin-bottom: 2rem;
}

.categoryImgContainer img {
  width: 100%;
  height: auto;
  cursor: pointer;
  transition: transform 0.5s ease;
}

.categoryImgContainer:hover img {
  transform: scale(1.2);
}
</style>