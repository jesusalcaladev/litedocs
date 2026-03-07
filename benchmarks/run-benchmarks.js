import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';


const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1'); 
const benchmarksDir = path.resolve(__dirname);

function measureExecutionTime(name, command, cwd, env = {}) {
  const start = performance.now();
  console.log(`🚀 Running benchmark for ${name}...`);
  
  if (!fs.existsSync(cwd)) {
    console.error(`❌ Workspace directory not found: ${cwd}`);
    return null;
  }

  try {
    // On Windows, pnpm is often a script, so shell: true is safer.
    // Also ensures we merge env correctly without losing critical Windows vars.
    execSync(command, { 
      cwd, 
      stdio: 'ignore', 
      shell: true,
      env: { 
        ...process.env, 
        ...env 
      } 
    });
  } catch (err) {
    console.error(`❌ Benchmark for ${name} failed:`, err.message);
    return null;
  }
  const end = performance.now();
  const duration = end - start;
  console.log(`✅ ${name} completed in ${(duration / 1000).toFixed(2)}s`);
  return duration;
}

function runBenchmarks() {
  const nextraDir = path.join(benchmarksDir, 'nextra-site');
  const boltdocsDir = path.join(benchmarksDir, 'boltdocs-site');
  const cacheDir = path.join(boltdocsDir, '.boltdocs');

  // 1. Nextra Benchmark
  const nextraTime = measureExecutionTime('Nextra', 'pnpm run build', nextraDir);

  // 2. Boltdocs Cold Build (No Cache)
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }
  const boltdocsColdTime = measureExecutionTime(
    'Boltdocs (Cold)', 
    'pnpm run build', 
    boltdocsDir, 
    { BOLTDOCS_NO_CACHE: '1' }
  );

  // 3. Boltdocs Warm Build (With Cache)
  measureExecutionTime('Boltdocs (Populate Cache)', 'pnpm run build', boltdocsDir);
  const boltdocsWarmTime = measureExecutionTime('Boltdocs (Warm)', 'pnpm run build', boltdocsDir);

  const result = {
    benchmarks: {
      nextra: {
        timeMs: nextraTime,
        timeSec: nextraTime ? parseFloat((nextraTime / 1000).toFixed(2)) : null
      },
      boltdocs_cold: {
        timeMs: boltdocsColdTime,
        timeSec: boltdocsColdTime ? parseFloat((boltdocsColdTime / 1000).toFixed(2)) : null
      },
      boltdocs_warm: {
        timeMs: boltdocsWarmTime,
        timeSec: boltdocsWarmTime ? parseFloat((boltdocsWarmTime / 1000).toFixed(2)) : null
      }
    },
    improvements: {
      cold_vs_nextra: nextraTime && boltdocsColdTime ? parseFloat((nextraTime / boltdocsColdTime).toFixed(2)) : null,
      warm_vs_cold: boltdocsColdTime && boltdocsWarmTime ? parseFloat((boltdocsColdTime / boltdocsWarmTime).toFixed(2)) : null,
      warm_vs_nextra: nextraTime && boltdocsWarmTime ? parseFloat((nextraTime / boltdocsWarmTime).toFixed(2)) : null
    }
  };

  const resultFilePath = path.join(benchmarksDir, 'result.json');
  fs.writeFileSync(resultFilePath, JSON.stringify(result, null, 2));
  console.log(`\n✅ Results saved to ${resultFilePath}`);
  
  console.log('\n--- Benchmark Summary ---');
  console.log(`Nextra:         ${result.benchmarks.nextra.timeSec}s`);
  console.log(`Boltdocs Cold:  ${result.benchmarks.boltdocs_cold.timeSec}s`);
  console.log(`Boltdocs Warm:  ${result.benchmarks.boltdocs_warm.timeSec}s`);
  console.log('--------------------------');
}

runBenchmarks();
