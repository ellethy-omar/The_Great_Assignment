const router = require('express').Router(); // require express and use the Router method to create a router object
const { sendMessage, getConversation } = require('../controllers/messageController'); // require the sendMessage function from the messageController module

router.post('/send-message', sendMessage); // create a POST route for the send-message endpoint that calls the sendMessage function
router.get('/conversation', getConversation); // create a GET route for the conversation endpoint that calls the getConversation function
module.exports  = router; // export the router object