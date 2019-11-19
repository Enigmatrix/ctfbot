<template>
  <div id="app" class="flex bg-gray-800 min-h-screen text-gray-300">
    <router-view/>
  </div>
</template>

<style lang="stylus">
@import 'assets/styles/tailwind.postcss';

#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale

.input
  font-family 'PT Sans Narrow'

.label
  font-family 'PT Sans Caption'

@import url('https://fonts.googleapis.com/css?family=PT+Sans+Caption|PT+Sans+Narrow&display=swap')
</style>
