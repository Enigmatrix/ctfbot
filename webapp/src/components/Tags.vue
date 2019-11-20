<template>
  <div
    class="input bg-gray-900 text-lg rounded border mt-2 text-gray-400 inline-flex flex-wrap"
    v-bind:class="{'border-blue-600': focused, 'border-blue-700': !focused}"
  >
    <div
      v-for="(tag, i) in tags"
      :key="tag"
      class="inline-flex p-1 m-1 bg-green-600 text-gray-900 rounded-l-lg shadow-lg"
    >
      <span>{{tag}}</span>
      <button class="ml-1 appearance-none outline-none text-red-800" @click="rmvTag(i)">X</button>
    </div>

    <input
      class="bg-transparent border-0 appearance-none flex-1 p-2 outline-none min-w-0 tag-input"
      v-model="tagline"
      @focus="focused = true"
      @blur="focused = false"
      @keyup.enter="addTag"
      @keyup.space="addTag"
      placeholder="enter tag then space/enter"
    />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Tags extends Vue {
  @Prop() private tags!: string[];

  public focused = false;
  public tagline = "";

  addTag() {
    const tags = this.tagline
      .trim()
      .split(" ")
      .filter(x => x !== "");
    for (const tag of tags) {
      this.tags.push(tag);
    }
    this.tagline = "";
    // filter duplicates out
    this.tags.forEach((x, i, arr) => {
      if (arr.indexOf(x) !== i) {
        this.tags.splice(i, 1);
      }
    });
  }

  rmvTag(idx: number) {
    this.tags.splice(idx, 1);
  }
}
</script>
<style lang="stylus">
.tag-input::placeholder
  color gray
</style>
