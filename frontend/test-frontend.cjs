#!/usr/bin/env node
/**
 * Simple test script to verify frontend development server functionality.
 */
const { spawn } = require('child_process');
const http = require('http');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function testServer(port, retries = 5) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend server responding on port', port);
        resolve(true);
      } else {
        console.log('❌ Frontend server returned status', res.statusCode);
        resolve(false);
      }
    });

    req.on('error', async (err) => {
      if (retries > 0) {
        console.log(`⏳ Server not ready, retrying... (${retries} attempts left)`);
        await sleep(2000);
        const result = await testServer(port, retries - 1);
        resolve(result);
      } else {
        console.log('❌ Failed to connect to frontend server:', err.message);
        resolve(false);
      }
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testFrontend() {
  console.log('🧪 Testing frontend development server...');

  // Test build first
  console.log('🏗️  Testing build process...');
  const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'pipe' });

  const buildSuccess = await new Promise((resolve) => {
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Build successful!');
        resolve(true);
      } else {
        console.log('❌ Build failed with code', code);
        resolve(false);
      }
    });
  });

  if (!buildSuccess) {
    return false;
  }

  // Test dev server
  console.log('🚀 Starting development server...');
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    detached: false
  });

  let serverStarted = false;
  devProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('📄 Server output:', output.trim());
    if (output.includes('Local:') && output.includes('http://localhost:')) {
      serverStarted = true;
    }
  });

  // Give server time to start
  await sleep(5000);

  try {
    // Try common Vite ports
    const ports = [3000, 5173, 4173];
    let success = false;

    for (const port of ports) {
      console.log(`🔍 Testing port ${port}...`);
      const result = await testServer(port, 2);
      if (result) {
        success = true;
        break;
      }
    }

    if (success) {
      console.log('🎉 Frontend development server test passed!');
      return true;
    } else {
      console.log('💥 Frontend development server test failed!');
      return false;
    }
  } finally {
    console.log('🛑 Stopping development server...');
    devProcess.kill('SIGTERM');

    // Give process time to cleanup
    await sleep(1000);

    if (!devProcess.killed) {
      devProcess.kill('SIGKILL');
    }
  }
}

async function main() {
  const success = await testFrontend();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}
