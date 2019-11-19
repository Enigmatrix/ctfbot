<template>
  <div class="mx-5 w-full md:w-4/5 md:mx-auto flex flex-col mt-3" v-if="resource !== undefined">
    <div class="flex flex-col mt-8">
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

    <button class="label bg-green-800 mt-8 mb-4 p-2 rounded-lg shadow-lg md:w-64 md:self-end">SAVE</button>

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
import { ResourceModel } from "../../../shared/resource";

@Component({
  components: { Tags }
})
export default class ResourceEdit extends Vue {
  @Prop() private id!: string;

  public resource!: ResourceModel;

  async mounted() {
    const res = await fetch(`/api/resources/${this.id}`);
    this.resource = (await res.json()) as ResourceModel;
    this.$forceUpdate();
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
