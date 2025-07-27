import fs from 'node:fs';

let isDockerCached: boolean | undefined;

const hasDockerEnv = () => {
  try {
    fs.statSync('/.dockerenv');
    return true;
  } catch {
    return false;
  }
};

const hasDockerCGroup = () => {
  try {
    return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
  } catch {
    return false;
  }
};

const isDocker = () => {
  isDockerCached ??= hasDockerEnv() || hasDockerCGroup();

  return isDockerCached;
};

export default isDocker;
