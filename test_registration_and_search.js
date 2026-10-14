const axios = require('axios');

async function test() {
  const baseURL = 'http://localhost:5000/api/v1';

  console.log('--- 1. Login as Dr. Prajjwal Kumar ---');
  const loginRes = await axios.post(`${baseURL}/auth/login`, {
    email: 'dr.prajwal@lakshmiaabha.com',
    password: 'EyeCare@2026',
  });
  const token = loginRes.data.token;
  console.log('✓ Doctor login successful, doctor:', loginRes.data.user.fullName);

  const client = axios.create({
    baseURL,
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('\n--- 2. Register New Patient with Address (No Medical History / Chief Complaint) ---');
  const uniquePhone = '+91 99887 ' + Math.floor(10000 + Math.random() * 90000);
  const testAddress = 'B-14/105, Ravindrapuri Colony, Varanasi, UP - 221005';

  const createRes = await client.post('/patients', {
    firstName: 'Devendra',
    lastName: 'Mishra',
    dob: '1975-06-15',
    gender: 'MALE',
    phone: uniquePhone,
    address: testAddress,
  });

  const newPatient = createRes.data.patient;
  console.log('✓ Patient created:');
  console.log('   ID:', newPatient.id);
  console.log('   MRN:', newPatient.mrn);
  console.log('   Name:', `${newPatient.firstName} ${newPatient.lastName}`);
  console.log('   Phone:', newPatient.phone);
  console.log('   Address:', newPatient.address);
  console.log('   Systemic History:', JSON.stringify(newPatient.systemicHistory));

  if (newPatient.address !== testAddress) {
    throw new Error('Address was not saved correctly!');
  }

  console.log('\n--- 3. Check-in Patient into Live Queue ---');
  const checkInRes = await client.post('/encounters/checkin', {
    patientId: newPatient.id,
    chiefComplaint: 'Outpatient Consultation',
  });
  console.log('✓ Encounter created in queue with token:', checkInRes.data.encounter.tokenNumber);

  console.log('\n--- 4. Test Search Capabilities ---');

  // A. Search by Name
  console.log('\nA. Search by Name ("Devendra Mishra")...');
  const searchNameRes = await client.get('/patients', { params: { search: 'Devendra Mishra' } });
  const foundByName = searchNameRes.data.patients.find(p => p.id === newPatient.id);
  if (!foundByName) throw new Error('Failed to find patient by full name!');
  console.log(`✓ Found ${searchNameRes.data.patients.length} result(s). Match: ${foundByName.firstName} ${foundByName.lastName}`);

  // B. Search by Phone Number
  const digits = uniquePhone.replace(/\D/g, '').slice(-6);
  console.log(`\nB. Search by Phone digits ("${digits}")...`);
  const searchPhoneRes = await client.get('/patients', { params: { search: digits } });
  const foundByPhone = searchPhoneRes.data.patients.find(p => p.id === newPatient.id);
  if (!foundByPhone) throw new Error('Failed to find patient by phone number!');
  console.log(`✓ Found ${searchPhoneRes.data.patients.length} result(s). Match: ${foundByPhone.phone} (${foundByPhone.mrn})`);

  // C. Search by MRN ID
  console.log(`\nC. Search by MRN ID ("${newPatient.mrn}")...`);
  const searchMRNRes = await client.get('/patients', { params: { search: newPatient.mrn } });
  const foundByMRN = searchMRNRes.data.patients.find(p => p.id === newPatient.id);
  if (!foundByMRN) throw new Error('Failed to find patient by MRN ID!');
  console.log(`✓ Found ${searchMRNRes.data.patients.length} result(s). Match: ${foundByMRN.mrn} - ${foundByMRN.firstName} ${foundByMRN.lastName}`);

  // D. Search by Address
  console.log('\nD. Search by Address ("Ravindrapuri")...');
  const searchAddrRes = await client.get('/patients', { params: { search: 'Ravindrapuri' } });
  const foundByAddr = searchAddrRes.data.patients.find(p => p.id === newPatient.id);
  if (!foundByAddr) throw new Error('Failed to find patient by Address!');
  console.log(`✓ Found ${searchAddrRes.data.patients.length} result(s). Match address: ${foundByAddr.address}`);

  console.log('\n=============================================');
  console.log('🎉 ALL VALIDATIONS PASSED SUCCESSFULLY!');
  console.log('=============================================');
}

test().catch(err => {
  console.error('❌ Test failed:', err.response?.data || err.message);
  process.exit(1);
});
