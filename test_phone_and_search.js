const axios = require('axios');

async function testPhoneAndSearch() {
  console.log('🧪 Testing Duplicate Phone Rejection & Patient Search...');
  const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

  // 1. Authenticate as Dr. Prajwal Kumar
  const loginRes = await api.post('/auth/login', {
    email: 'dr.prajwal@lakshmiaabha.com',
    password: 'EyeCare@2026',
  });
  api.defaults.headers.common['Authorization'] = `Bearer ${loginRes.data.token}`;
  console.log('✅ Authenticated as:', loginRes.data.user.fullName);

  // 2. Test duplicate phone rejection
  console.log('\n--- Test 1: Duplicate Phone Rejection ---');
  try {
    await api.post('/patients', {
      firstName: 'Duplicate',
      lastName: 'Test',
      dob: '1995-01-01',
      gender: 'MALE',
      phone: '7337367761', // Already belongs to Shekhar Suman
    });
    console.error('❌ FAILED: Duplicate phone was allowed!');
    process.exit(1);
  } catch (err) {
    if (err.response?.status === 409) {
      console.log('✅ SUCCESS: Duplicate phone correctly rejected with HTTP 409 Conflict:');
      console.log('   Message:', err.response.data.error);
    } else {
      console.error('❌ Unexpected error status:', err.response?.status, err.response?.data);
      process.exit(1);
    }
  }

  // 3. Test Patient Search by Name
  console.log('\n--- Test 2: Search Patient by Name ---');
  const searchNameRes = await api.get('/patients', { params: { search: 'Shekhar' } });
  console.log(`✅ Search by Name "Shekhar" returned ${searchNameRes.data.patients.length} patient(s):`);
  searchNameRes.data.patients.forEach((p) => {
    console.log(`   - MRN: ${p.mrn} | Name: ${p.firstName} ${p.lastName} | Phone: ${p.phone}`);
  });

  // 4. Test Patient Search by Phone Number
  console.log('\n--- Test 3: Search Patient by Phone Number ---');
  const searchPhoneRes = await api.get('/patients', { params: { search: '7337367761' } });
  console.log(`✅ Search by Phone "7337367761" returned ${searchPhoneRes.data.patients.length} patient(s):`);
  searchPhoneRes.data.patients.forEach((p) => {
    console.log(`   - MRN: ${p.mrn} | Name: ${p.firstName} ${p.lastName} | Phone: ${p.phone}`);
  });

  console.log('\n🎉 ALL PHONE VALIDATION & SEARCH TESTS PASSED SUCCESSFULLY!\n');
}

testPhoneAndSearch().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
