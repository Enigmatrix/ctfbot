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
        log.info(`running job ${this.ID}`);
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

export default agenda;