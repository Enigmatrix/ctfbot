<template>
  <div class="px-5 w-full md:w-4/5 md:mx-auto flex flex-col mt-3" v-if="resource">
    <div
      class="mt-4 label bg-green-500 text-white flex border-l-4 border-green-700 p-2"
      v-if="message && message.type === 'success'"
    >
      <span class="flex-1">{{message.text}}</span>
      <button @click="clearMessage">X</button>
    </div>
    <div
      class="mt-4 label bg-red-500 text-white flex border-l-4 border-red-700 p-2"
      v-if="message && message.type === 'error'"
    >
      <span class="flex-1">{{message.text}}</span>
      <button @click="clearMessage">X</button>
    </div>

    <div class="flex flex-col mt-4">
      <span class="label text-2xl">Link</span>
      <textarea
        name="description"
        class="input bg-gray-900 p-2 text-lg min-w-0 rounded border border-blue-700 mt-2 text-blue-600 underline"
        placeholder="The link itself"
        v-model="resource.link"
      ></textarea>
    </div>

    <!--<iframe :src="resource.link" class="mt-10"></iframe>-->

    <div class="flex flex-col mt-8">
      <span class="label text-2xl">Description</span>
      <textarea
        name="description"
        class="input bg-gray-900 p-2 text-lg min-w-0 rounded border border-blue-700 mt-2 text-gray-400"
        placeholder="Short summary of the link"
        v-model="resource.description"
      ></textarea>
    </div>

    <div class="flex flex-col mt-8">
      <span class="label text-2xl">Category</span>
      <input
        name="category"
        class="input bg-gray-900 p-2 text-lg min-w-0 rounded border border-blue-700 mt-2 text-gray-400"
        placeholder="Immediate category of the link"
        v-model="resource.category"
      />
    </div>

    <div class="flex flex-col mt-8">
      <span class="label text-2xl">Tags</span>
      <Tags :tags="resource.tags" />
    </div>

    <button
      @click="save"
      class="label bg-green-800 mt-8 mb-4 p-2 rounded-lg shadow-lg md:w-64 md:self-end"
    >SAVE</button>

    <div class="flex-1" />

    <div class="input m-2 text-center">
      Posted
      <span v-if="resource.author && resource.channel">
        by
        <span class="text-blue-500">{{resource.author}}</span> in
        <span class="text-green-500">{{resource.channel}}</span>
      </span> at
      <span class="text-orange-500">{{formatNiceSGT(resource.timestamp)}}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import moment from "moment-timezone";
import Tags from "@/components/Tags.vue";
import request from "../requests";
import {
  ResourceModel,
  ResourceEditModel
} from "../../../bot/src/shared/resource";

@Component({
  components: { Tags }
})
export default class ResourceEdit extends Vue {
  @Prop() private id!: string;

  private resource: ResourceModel | null = null;
  private message: { text: string; type: "error" | "success" } | null = null;

  async mounted() {
    this.resource = await request
      .get<ResourceModel>(`/api/resources/${this.id}`)
      .then(x => x.data);
    this.$forceUpdate();
  }

  async save() {
    if (!this.resource) return;
    const { tags, link, description, category } = this.resource;
    const res = await request.post(`/api/resources/${this.id}`, {
      body: { tags, link, description, category }
    });
    if (res.status === 200) {
      this.message = { text: "Save successful!", type: "success" };
    } else {
      this.message = { text: "Save failed!", type: "error" };
    }
  }

  clearMessage() {
    this.message = null;
  }

  formatNiceSGT(date: Date) {
    return (
      moment(date)
        .tz("Asia/Singapore")
        .format("DD MMM, h:mma") + " (SGT)"
    );
  }
}
</script>
