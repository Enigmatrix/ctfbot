import NotifyCTFReactors from "@/jobs/NotifyCTFReactors";
import RepeatedNotifyNewWriteups from "@/jobs/RepeatedNotifyNewWriteups";
import RepeatedUpcoming from "@/jobs/RepeatedUpcoming";
import agenda from "@/jobs/base";
import log from "@/util/logging";

for(const job of [NotifyCTFReactors, RepeatedNotifyNewWriteups, RepeatedUpcoming]) {
  job.register();
}

export default agenda.on("ready", async () => {
  await agenda.purge();

  await Promise.all((
    await agenda.jobs({name: {$regex: "repeated_.*"}}))
    .map(job => job.remove()));

  await RepeatedNotifyNewWriteups.every("15 minutes");
  await agenda.create(RepeatedUpcoming.ID)
    .repeatEvery("1 week", { timezone: "Asia/Singapore", skipImmediate: true })
    .schedule("monday at 8am")
    .save();

  log.info("jobs ready");
})
  .on("error", e => log.error("agenda error", e));