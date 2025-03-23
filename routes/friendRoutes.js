const router = require('express').Router();
const {   
    sendFriendRequest,
    sendFriendRequestByUsername,
    acceptFriendRequest,
    declineFriendRequest,
    getPendingFriendRequests,
    getFriendsList ,
    getAllFriendRequests
} = require('../controllers/friendController');

router.post('/send-request', sendFriendRequest);
router.post('/send-request-user', sendFriendRequestByUsername);
router.put('/accept-request/:requestId', acceptFriendRequest);
router.put('/decline-request/:requestId', declineFriendRequest);
router.get('/pending-requests/:userId', getPendingFriendRequests);
router.get('/friends-list/:userId', getFriendsList);
router.get('/all-requests', getAllFriendRequests);

module.exports = router;