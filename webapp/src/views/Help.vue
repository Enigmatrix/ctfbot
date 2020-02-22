<template>
  <div class="help p-4 text-sm container mx-auto">
    <h1 class="py-6 text-3xl font-mono font-bold">CTFBot --help</h1>
    <section>
      <h2>Introduction</h2>
      <p>
        CTFBot is a bot that aids in solving CTFs. It integrates deeply with
        Trello and Discord to bring a unified experience for CTF management.
      </p>
      <p>
        We made CTFBot because we were tired of looking up at CTFTime for new CTFs.
        Furthermore, information about challenges would be buried amongst other chatter
        in our Discord channel, and we wanted a better way to manage this. We put the
        challenges in Trello and manage the discussion and challenge status there.
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
        category, with details about the CTF in an embed message. e.g. start time, end time and
        associated Trello board. Here is an example:
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
        we use Trello (to hold details about the challenges), and we use Discord commands
        to change challenge status. Here is the workflow:
        <img src="/img/help/workflow.png">
      </p>
    <div class="bg-blue-600 p-4 border-l-4 border-blue-700 my-2">
      <span class="font-bold text-base">TIP</span>
      <span class="text-sm px-4">Put all information regarding the challenge in Trello.
      Discord should used for asking help, reporting status, and complaining only!</span>
    </div>
    <div class="bg-blue-600 p-4 border-l-4 border-blue-700">
      <span class="font-bold text-base">TIP</span>
      <span class="text-sm px-4">All these commands are meant to be run in the CTF channel itself.
      Do not run these in other channels</span>
    </div>
      <p>
        <li class="font-mono">addchall</li>
    <b class="cmd">!addchall &lt;name&gt; &lt;cat1&gt;,&lt;cat2&gt;...</b> is used to add
    a challenge for tracking. <b class="h-mono">cat1,cat2,...</b> are the category the challenges
    belong to, usually categories like <b class="h-mono">pwn</b>, <b class="h-mono">web</b> and
    <b class="h-mono">crypto</b>. A card will be created in the Trello board under
    <b class="h-mono">To Do</b>.</p>
    <p>
    <li class="font-mono">rmvchall</li>
    <b class="cmd">!rmvchall &lt;name&gt;</b> removes the challenge from tracking.
    The associated Trello card is also removed.
    </p>
    <p>
    <li class="font-mono">workon</li>
    <b class="cmd">!workon &lt;name&gt;</b> is used to signal that you are working on the challenge.
    The associated Trello card will be moved to <b class="h-mono">Doing</b> with your Trello name as
    the assignee.
    </p>
    <p>
    <li class="font-mono">ditch</li>
    <b class="cmd">!ditch &lt;name&gt;</b> is used to signal that you are no longer working on the
    challenge. The associated Trello card will be moved back to <b class="h-mono">To Do</b> if you
    are the only one working on the challenge.
    Your Trello name will be removed from the card's list of assignees. If you are going to use
    this, please leave adequate information on your findings in the Trello card!
    </p>
    <p>
    <li class="font-mono">solve</li>
    <b class="cmd">!solve &lt;name&gt;</b> marks the challenge as solved, and the Trello card will
    be moved to the <b class="h-mono">Done</b> list. Congratulations!
    </p>
    <p>
    <li class="font-mono">unsolve</li>
    <b class="cmd">!unsolve &lt;name&gt;</b> brings the challenge back to unsolved status, and moves
    the card to the <b class="h-mono">To Do</b> list. Don't be fake news!
    </p>

    <p>Here is an example of a Trello board for one of our CTFs:</p>
    <img src="/img/help/trello.png">
    </section>
    <section>
      <h2>Resources</h2>
      <p>
        Members post articles about exploits and innovative challenges in the
        <b class="category">Interest Labs</b> category, under a suitable channel.
        These articles are catalogued, with the option for manual intervention to
        provide extra details. Here is an example (posted under
        <b class="channel">cryptography</b>):
      </p>
      <img src="/img/help/resource.png">
      <p>
        To provide additional details, click on the 🗒 icon. A private
        message will be sent by CTFBot. Click on the link to provide more details, or use
        <b class="cmd">
          !res &lt;link&gt;  &lt;category&gt;  &lt;tag1,tag2...&gt; &lt;description&gt;
        </b>
        <div class="flex flex-wrap">
          <img src="/img/help/ctfbot-res-pm.png">
          <img src="/img/help/ctfbot-res-form.png" class="shadow-lg rounded">
        </div>

        To search for articles with respect to certain keywords, use the
        <b class="cmd">!search &lt;keyword&gt;</b> in any channel, including the
        CTFBot private message channel.

      <img src="/img/help/ctfbot-search.png">
      </p>
    </section>
    <section>
      <h2>Misc</h2>
      <p>
        CTFBot also has some random fun miscellaneous tools.
        <li class="font-mono">!help</li>
        <b class="cmd">!help</b> or <b class="cmd">!help &lt;command&gt;</b> will provide
        usage help for all commands or just the one command, respectively
      <div class="flex flex-wrap">
        <img src="/img/help/ctfbot-help.png">
        <img src="/img/help/ctfbot-help-addctf.png">
      </div>
      <li class="font-mono">!ping</li>
      <b class="cmd">!ping</b> to check whether the bot is up
      <li class="font-mono">!status</li>
      <b class="cmd">!status</b> to see more details like memory usage and uptime.
      <img src="/img/help/ctfbot-status.png">
      <li class="font-mono">!kick</li>
        <b class="cmd">!kick @user</b> to kick a user (only show a message :) )
      <li class="font-mono">!ban</li>
      <b class="cmd">!ban @user</b> to `ban` a user (only show a message :) )
      </p>
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
