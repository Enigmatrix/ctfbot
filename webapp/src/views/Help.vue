<template>
  <div class="help p-4 text-sm container mx-auto">
    <section>
      <h2>Introduction</h2>
      <p>
        CTFBot is a bot that aids in solving CTFs. It integrates deeply with
        Trello and Discord to bring a unified experience for CTF management.
      </p>
      <p>
        We made CTFBot because we were tired of looking up at CTFTime for new CTFs.
        Furthermore, information about challenges would be buried amongst other chatter
        in our Discord channel, and we wanted a better way to manage this.
      </p>
      <p>
        We also find a lot of articles about CTF challenges and the leading edge of the
        Infosec industry. We wanted these articles (refered to as <b class="h-mono">resources</b>)
        to be catalogued, with the option to add our own descriptions.
      </p>
    </section>
    <p>
      <h2>CTF Workflow</h2>
      <h3>Finding CTFs</h3>
      <p>
        Every week, CTFBot will put up a list of upcoming online CTFs in the
        <b class="channel">#upcoming</b> channel.
        <img src="/img/help/upcoming-ctf.png">
        You can run <b class="cmd">!addctf &lt;ctf_url&gt;</b> in the
        <b class="channel">#capture-the-flag</b> channel to create a channel for the CTF
        and start tracking it. A new channel will be created in the <b class="category">CTFs</b>
        category, with details about the CTF in an embed message. e.g.
        <b class="cmd">!addctf https://ctftime.org/event/825/</b> will produce:
        <div class="flex flex-wrap">
          <img src="/img/help/new-ctf-category.png">
          <img src="/img/help/ctf-info-embed.png">
        </div>
      </p>
      <h3>Joining CTFs</h3>
      <p>
        If you want to join an existing CTF channel that someone created, just play along
        when the CTF starts with the credentials provided. If you are the one
        who created the channel, then there are some extra steps:
      </p>

      <p>
        After creating the channel, you still have to join the CTF by registering in the official
        website of the CTF on behalf of the team. You can show the credentials by typing
        <b class="cmd">
          !addcreds &lt;key1&gt;=&lt;value1&gt; &lt;key2&gt;=&lt;value2&gt; ...</b> into the
        CTF channel. The credentials will be saved in the CTF embed message for others to use:
      <div class="flex flex-wrap">
        <img src="/img/help/addcreds.png">
        <img src="/img/help/ctf-info-embed-creds.png">
      </div>
      Of course, the inverse of this operation exists,
      called <b class="cmd">!rmvcreds &lt;key1&gt; &lt;key2&gt; ...</b>
      </p>

      <h3>CTF Notifications</h3>
      <p>
        To get notification 1 hour before the CTF starts, simply click the
         👌 emoji reaction at the bottom of the CTF embed message.
      </p>

      <h3>Adding and Solving Challenges</h3>
      <p>
        On the CTF website itself, there should be a list of challenges that are open
        for us to solve. To track the progress of these challenges on our team's side,
        you will have to follow our workflow:
        <img src="/img/help/workflow.png">
      </p>
      <p>
        <li class="font-mono">addchall</li>
      </p>
    <p>
    <li class="font-mono">rmvchall</li>
    </p>
    <p>
    <li class="font-mono">workon</li>
    </p>
    <p>
    <li class="font-mono">ditch</li>
    </p>
    <p>
    <li class="font-mono">solve</li>
    </p>
    <p>
    <li class="font-mono">unsolve</li>
    </p>
    </section>
    <section>
      <h2>Resources</h2>
    </section>
    <section>
      <h2>Fun Stuff</h2>
    </section>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Help extends Vue {

}
</script>
<style lang="stylus">
.help h2
  @apply text-xl
  @apply py-2
  font-weight bold
  color white

.help h3
  @apply text-lg
  @apply py-1
  @apply px-1
  color white

.help p
  @apply p-2

.help img
  @apply py-2
  margin auto

.help .h-mono
  @apply bg-gray-900
  @apply font-mono

.help .cmd
  padding 2px
  @apply rounded
  @apply bg-green-800
  @apply font-mono
  color white

.help .channel
  padding 2px
  @apply rounded
  @apply bg-blue-800
  color white
  font-family 'PT Sans Caption'

.help .category
  padding 2px
  @apply rounded
  @apply bg-blue-600
  color white
  font-family 'PT Sans Caption'
</style>
