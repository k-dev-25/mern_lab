import { spawn } from 'node:child_process';

const backend = new URL('../backend/', import.meta.url);
const mongoUri = 'mongodb://shopkart:shopkart_password@127.0.0.1:27018/shopkart?authSource=admin';

function run(command, args, options = {}) {
  return spawn(command, args, { stdio: 'inherit', ...options });
}

const mongo = run('docker', ['compose', 'up', '-d'], { cwd: backend });
mongo.on('exit', (code) => {
  if (code !== 0) process.exit(code ?? 1);

  const api = run('npm', ['run', 'dev'], {
    cwd: backend,
    env: { ...process.env, MONGO_URI: mongoUri },
  });
  const web = run('npm', ['run', 'dev:frontend']);
  const stop = () => {
    api.kill('SIGTERM');
    web.kill('SIGTERM');
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  api.on('exit', (apiCode) => {
    if (apiCode !== 0 && apiCode !== null) process.exitCode = apiCode;
    stop();
  });
  web.on('exit', (webCode) => {
    if (webCode !== 0 && webCode !== null) process.exitCode = webCode;
    stop();
  });
});
