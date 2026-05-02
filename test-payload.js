const axios = require('axios');
const payload = {
  email: "test-curl@example.com",
  name: "Test",
  mobileNo: "123",
  githubUsername: "git",
  rollNo: "roll123",
  accessCode: "acc123"
};
axios.post('http://20.207.122.201/evaluation-service/register', payload).then(r => console.log(r.data)).catch(e => console.error(e.response.data));
