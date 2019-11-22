<template>
  <div class="flex flex-row h-12 bg-gray-900 w-full items-center shadow-lg">
    <img src="/favicon.ico" class="h-8 w-8 mx-2" />
    <span class="label text-xl text-blue-700">CTFBot</span>
    <div class="flex-1" />
    <div v-if="userInfo" class="flex flex-row">
      <img
        class="h-6 w-6 rounded-full shadow-md"
        :src="`https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png?size=32`"
      />
      <span class="input text-gray-600 ml-1 mr-2">{{userInfo.username}}</span>
    </div>
    <button v-else class="shadow px-2 py-1 mx-2 bg-green-700 rounded label" @click="login">LOGIN</button>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import getUserInfo, { UserInfo } from "../session";
import { login } from "@/session";

@Component
export default class NavBar extends Vue {
  public userInfo: UserInfo | null = null;

  async mounted() {
    this.userInfo = (await getUserInfo()) || null;
  }

  login() {
    login();
  }
}
</script>
