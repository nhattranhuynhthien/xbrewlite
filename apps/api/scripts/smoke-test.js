/**
 * BrewLite - Deployment Smoke Test Script
 * Author: TV2 (Backend - Auth & User)
 * Task 5.3: S2-35 (Closes #33)
 * Usage: node scripts/smoke-test.js [BASE_URL]
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.argv[2] || process.env.API_URL || 'http://localhost:3001';

console.log('====================================================');
console.log(`BẮT ĐẦU SMOKE TEST SAU TRIỂN KHAI: ${BASE_URL}`);
console.log('====================================================');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout sau 5000ms'));
    });
  });
}

async function runSmokeTests() {
  let passed = true;

  // Test 1: Health Check (NFR-09)
  try {
    console.log('\n[1/3] Kiểm tra GET /api/v1/health ...');
    const res = await makeRequest(`${BASE_URL}/api/v1/health`);
    if (res.statusCode === 200 && res.body.status === 'ok') {
      console.log('✓ PASS: Health check OK. Database connected.');
    } else {
      console.error(`✗ FAIL: Health check returned ${res.statusCode}:`, res.body);
      passed = false;
    }
  } catch (err) {
    console.error('✗ FAIL: Không thể gọi /api/v1/health:', err.message);
    passed = false;
  }

  // Test 2: Products Catalog (FR-01)
  try {
    console.log('\n[2/3] Kiểm tra GET /api/v1/products ...');
    const res = await makeRequest(`${BASE_URL}/api/v1/products`);
    if (res.statusCode === 200 && Array.isArray(res.body.products)) {
      console.log(`✓ PASS: Catalog OK. Tìm thấy ${res.body.products.length} sản phẩm.`);
    } else {
      console.error(`✗ FAIL: Products API returned ${res.statusCode}:`, res.body);
      passed = false;
    }
  } catch (err) {
    console.error('✗ FAIL: Không thể gọi /api/v1/products:', err.message);
    passed = false;
  }

  // Test 3: Swagger Documentation API (S1-24)
  try {
    console.log('\n[3/3] Kiểm tra GET /docs-json (Swagger Contract) ...');
    const res = await makeRequest(`${BASE_URL}/docs-json`);
    if (res.statusCode === 200 && res.body.openapi) {
      console.log(`✓ PASS: Swagger Contract OK. Version OpenAPI ${res.body.openapi}`);
    } else {
      console.warn(`! WARN: Swagger endpoint returned ${res.statusCode}`);
    }
  } catch (err) {
    console.warn('! WARN: Không truy cập được Swagger contract:', err.message);
  }

  console.log('\n====================================================');
  if (passed) {
    console.log('KẾT QUẢ: 100% SMOKE TESTS THÀNH CÔNG! HỆ THỐNG SẴN SÀNG PHỤC VỤ.');
    console.log('====================================================');
    process.exit(0);
  } else {
    console.error('KẾT QUẢ: SMOKE TEST THẤT BẠI! YÊU CẦU DỪNG PIPELINE & ROLLBACK.');
    console.log('====================================================');
    process.exit(1);
  }
}

runSmokeTests();
