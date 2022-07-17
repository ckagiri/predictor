import schedule, { Job } from 'node-schedule'
type SchedulerOptions = {
  whenToExecute: number,
  runImmediately?: boolean,
};

class MatchesScheduler {
  private job: Job = new schedule.Job('Matches Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private jobRescheduled: boolean = false;


  constructor() {
    this.job.on('success', answer => {
      this.jobSuccess(answer);
    });
    this.job.on('scheduled', () => {
      console.log('sche')
    })
  }

  scheduleJob({ whenToExecute, runImmediately = false }: SchedulerOptions) {
    if (this.jobScheduled) throw new Error('Job already sheduled.');
    if (runImmediately) {
      console.log('runImmediately + scheduleJob in 2s');
      this.jobTask().then(() => {
        this.job.runOnDate(new Date(Date.now() + whenToExecute));
      });
    } else {
      console.log('scheduleJob');
      return this.job.runOnDate(new Date(Date.now() + whenToExecute));
    }
  }

  async jobTask() {
    if (this.taskRunning) return;
    this.taskRunning = true;
    console.log('jobTask will run for 2s');
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.taskRunning = false;
    console.log('jobTask done running 2s');
    return 'foobar';
  }

  cancelJob() {
    this.jobScheduled = false;
  }

  jobSuccess(result: any, reschedule: boolean = false) {
    console.log(`Job success ${result}`);
    const nextUpdate = new Date(Date.now() + this.nextUpdate(result));
    if (reschedule) {
      console.log('reschedule in 3s')
      this.job.reschedule(nextUpdate.getTime());
    } else {
      console.log('schedule again in 3s')
      this.job.schedule(nextUpdate)
      this.runJob();

    }
  }

  nextUpdate(result: any) {
    console.log(`Next update result: ${result}`);
    return 3000;
  }

  runJob() {
    if (this.jobRescheduled) return;
    console.log('run job')
    this.jobTask().then(() => {
      this.jobRescheduled = true;
      this.jobSuccess('barfoo', true);
    });
  }
}

// runImmediately task - which task
const ms = new MatchesScheduler();
ms.scheduleJob({ whenToExecute: 2000, runImmediately: true });
// (async () => { await new Promise(resolve => setTimeout(resolve, 6000)); })();
// ms.runJob()
// MatchesScheduler Schedule { whenToExecute?: number, milliseconds, ri?: boolean }
// async jobTask { running: true; await result running: false return result } // async or promise
// scheduleJob(schedule?) { whenToExecute: 0, runImmediately: false }?
// if job == null return
// if runImmediately { this.jobTask() }
// this.job = new schedule.Job(this.jobTask)
// this.job.runOnDate(new Date(now + whenToExecuteMs)) }
// this.job.on('success', this.jobSuccess)
// this.mediator.on('matches', this.runJob } { this.jobTask().then((result) => this.jobSuccess(result, true)) }
// jobSuccess { job.schedule (nextUpdate, reschedule = false) }
// nextUpdate(result) { }
// cancelJob
//   this.job.cancel; this.job = null;
//