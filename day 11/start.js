const { spawn } = require('child_process');
const path = require('path');

console.log('=== Starting Smart Doc Q&A App (Backend + Frontend) ===');

function startService(name, dir, command, args) {
  console.log(`[${name}] Starting service in ${dir}...`);
  const proc = spawn(command, args, {
    cwd: path.resolve(__dirname, dir),
    shell: true,
    stdio: 'inherit'
  });

  proc.on('close', (code) => {
    console.log(`[${name}] Service exited with code ${code}`);
    process.exit(code || 0);
  });

  return proc;
}

// Start Backend on PORT 5000 (starts first)
const backend = startService('Backend', 'backend', 'npm', ['run', 'dev']);

// Start Frontend on PORT 3000
const frontend = startService('Frontend', 'frontend', 'npm', ['run', 'dev']);

// Handle process termination cleanly
const cleanup = () => {
  console.log('\nShutting down dev servers...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
