import NotifyCTFReactors from "@/jobs/NotifyCTFReactors";
import RepeatedNotifyNewWriteups from "@/jobs/RepeatedNotifyNewWriteups";
import agenda from "@/jobs/base";
import log from "@/util/logging";

for(const job of [NotifyCTFReactors, RepeatedNotifyNewWriteups]) {
  job.register();
}

export default agenda.on("ready", async () => {
  await agenda.purge();

  const oldRepeatJobs = await agenda.jobs({name: {$regex: "repeated_.*"}});
  for(const job of oldRepeatJobs){
    await job.remove();
  }

  await RepeatedNotifyNewWriteups.every("15 minutes");
  log.info("jobs ready");
})
  .on("error", e => log.error("agenda error", e));