const router = require('express').Router(); // require express and use the Router method to create a router object
const {
    createChat,
    getChatById,
    addMessageToChat,
    getChatsByUser
} = require('../controllers/chatController'); // require the sendMessage function from the messageController module

router.post('/addMessageToChat/:chatId ', addMessageToChat);
router.get('/getChatsByUser/:userId', getChatsByUser);
router.get('/getChatById/:chatId', getChatById);
router.post('/createChat', createChat);
module.exports  = router;