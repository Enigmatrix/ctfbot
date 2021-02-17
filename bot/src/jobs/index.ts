import NotifyCTFReactors from "@/jobs/NotifyCTFReactors";
import agenda from "@/jobs/base";

for(const job of [NotifyCTFReactors]) {
  job.register();
}

export default agenda;

