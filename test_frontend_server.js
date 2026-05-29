/**
 * ============================================================
 * Crudier CRM — Frontend Dev Server & Integration Test Runner
 * ============================================================
 * Verifies that the Vite development server is running on port 5173,
 * serves the application entrypoints, links dependencies, and that
 * all registered route components exist in the workspace.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DEV_SERVER_URL = 'http://localhost:5173';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('\n🎨 Starting Crudier CRM Frontend Integration Test Suite...');
  console.log('========================================================');

  // ----------------------------------------
  // [Test 1] Check Vite Dev Server Connection
  // ----------------------------------------
  console.log('[Test 1] Verifying Vite Dev Server connection on port 5173...');
  let homeResponse;
  try {
    homeResponse = await get(DEV_SERVER_URL);
    assert.strictEqual(homeResponse.statusCode, 200, 'Dev server did not return 200 OK');
    console.log('✓ Vite dev server is active and accessible.');
  } catch (err) {
    console.error('❌ Test 1 Failed: Could not connect to Vite dev server.');
    console.error('   Please make sure "npm run dev" is running inside the "client" directory.\n');
    process.exit(1);
  }

  // ----------------------------------------
  // [Test 2] Validate HTML Document Structure
  // ----------------------------------------
  console.log('\n[Test 2] Validating HTML document structure...');
  const html = homeResponse.data;
  
  assert.ok(html.includes('<div id="root">'), 'Missing target root div <div id="root">');
  assert.ok(html.includes('src/main.jsx'), 'Missing entrypoint link to "src/main.jsx"');
  assert.ok(html.includes('fonts.googleapis.com'), 'Missing DM Sans google font connection');
  console.log('✓ HTML document skeleton and style sheets validated successfully.');

  // ----------------------------------------
  // [Test 3] Check Client Routing Table
  // ----------------------------------------
  console.log('\n[Test 3] Checking Client Page Router and components...');
  const appRouterPath = path.join(__dirname, 'client', 'src', 'routes', 'AppRouter.jsx');
  
  if (!fs.existsSync(appRouterPath)) {
    console.error(`❌ Test 3 Failed: Router file not found at ${appRouterPath}`);
    process.exit(1);
  }

  const appRouterContent = fs.readFileSync(appRouterPath, 'utf8');
  
  // Extract all import declarations of pages
  const importRegex = /import\s+(\w+)\s+from\s+['"](.+)['"]/g;
  let match;
  let missingFilesCount = 0;
  let checkedFilesCount = 0;

  while ((match = importRegex.exec(appRouterContent)) !== null) {
    const componentName = match[1];
    const importPath = match[2];

    // Filter out relative pages imports only
    if (importPath.startsWith('../pages/')) {
      // Resolve path
      const resolvedPath = path.resolve(
        path.dirname(appRouterPath),
        importPath + (importPath.endsWith('.jsx') ? '' : '.jsx')
      );

      checkedFilesCount++;
      if (fs.existsSync(resolvedPath)) {
        // Page exists
      } else {
        console.error(`  ✗ Missing component file: ${componentName} -> ${resolvedPath}`);
        missingFilesCount++;
      }
    }
  }

  assert.strictEqual(missingFilesCount, 0, `${missingFilesCount} registered route pages are missing in files!`);
  console.log(`✓ Checked ${checkedFilesCount} page components. All file maps resolved successfully.`);

  // ----------------------------------------
  // [Test 4] Query Dev Server for Assets
  // ----------------------------------------
  console.log('\n[Test 4] Querying Vite Dev Server for source files...');
  try {
    const mainJsxRes = await get(`${DEV_SERVER_URL}/src/main.jsx`);
    assert.strictEqual(mainJsxRes.statusCode, 200, 'Failed to fetch main.jsx');
    
    const indexCssRes = await get(`${DEV_SERVER_URL}/src/index.css`);
    assert.strictEqual(indexCssRes.statusCode, 200, 'Failed to fetch index.css');
    
    console.log('✓ Dev server successfully transpiles and serves JSX modules and CSS tokens.');
  } catch (err) {
    console.error('❌ Test 4 Failed: Dev server failed to serve asset modules.', err.message);
    process.exit(1);
  }

  console.log('\n========================================================');
  console.log('🎉 ALL FRONTEND INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runTests();
