const axios = require('axios');
(async () => {
  try {
    const clientId = "dd69c6ae-bf35-426e-8040-edfdb781eac7";
    const clientSecret = "HAuXTFuMvhHpGbXr";
    
    console.log("Authing with exactly register payload fields PLUS clientId and clientSecret...");
    try {
      await axios.post('http://20.207.122.201/evaluation-service/auth', {
        clientId: clientId,
        clientSecret: clientSecret,
        email: "test-auth2@example.com",
        name: "TestUser",
        mobileNo: "9998887776",
        githubUsername: "testuser1",
        rollNo: "RA231199998888",
        accessCode: "QkbpxH"
      });
      console.log("SUCCESS with register fields + clientId");
    } catch (e) {
      console.log("FAILED:", JSON.stringify(e.response.data));
    }
  } catch (e) {
    console.error("Fatal:", e.message);
  }
})();
