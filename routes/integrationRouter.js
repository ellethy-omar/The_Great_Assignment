const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/requireAuth');

const authRoutes = require('./authRoutes');
// This requires JWT token to be passed in the header

const friendRoutes = require('./friendRoutes');
const messageRoutes = require('./messageRoutes');

router.get("/", (req, res)=> {
    res.status(200).json(result = {
        statusbar: false,
        failure: "Task failed Succuessfiily! this is an invalid route"
    })
})

router.use('/auth', authRoutes);
router.use(requireAuth);
router.use('/friend', friendRoutes);
router.use('/message', messageRoutes);


module.exports = router;