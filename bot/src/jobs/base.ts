import Agenda from "agenda";
import log from "@/util/logging";
import config from "@/util/config";

const agenda = new Agenda({
  db: { address: config.get("DATA_CONNECTION_URI"),
    options: { 
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
});

export abstract class Job<T> {
    abstract ID: string;

    abstract run(args: T): Promise<void>;

    register() {
      agenda.define<T>(this.ID, async (job, done) => {
        await this.run(job.attrs.data)
          .then(() => { 
            log.info(`job ${this.ID} success`);
            done();
          })
          .catch(err => {
            log.error(`job ${this.ID} failed`, err);
            done(err);
          });
      });
    }

    async schedule(when: string|Date, args: T) {
      await agenda.schedule<T>(when, this.ID, args);
    }

    async every(interval: string|number, args: T) {
      await agenda.every<T>(interval, this.ID, args);
    }
}

agenda.on("ready", async () => {
  await agenda.purge(); /*
    let oldRepeatJobs = await agenda.jobs({name: {$regex: "repeated_.*"}});
    for(let job of oldRepeatJobs){
        await job.remove();
    }*/

  /*
    await agenda.create(REPEATED_NOTIFY_UPCOMING_CTF)
        .schedule('sunday at 6pm')
        .repeatEvery('1 week', { timezone: "Asia/Singapore", skipImmediate: true })
        .save();
    */

  //await agenda.every("every 15 minutes", REPEATED_NOTIFY_CTF_WRITEUPS);
  log.info("jobs ready");
});

export default agenda.on("error", e => log.error("agenda error", e));