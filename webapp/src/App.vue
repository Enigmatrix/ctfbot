<template>
  <div id="app" class="flex flex-col bg-gray-800 min-h-screen text-gray-300">
    <NavBar/>
    <router-view/>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import NavBar from "./components/NavBar.vue";

@Component({
  components: { NavBar }
})
export default class App extends Vue {
}
</script>

<style lang="stylus">
@import 'assets/styles/tailwind.postcss';

#app
  font-family 'DM Sans', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale

.input
  font-family 'PT Sans Narrow'

.label
  font-family 'PT Sans Caption'

@import url('https://fonts.googleapis.com/css?family=PT+Sans+Caption|PT+Sans+Narrow|DM+Sans&display=swap')
</style>
