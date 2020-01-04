const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// router.get('/', async (req, res) => {
//     try {
//         const users = await User.find()
//         res.json(users)
//     }
//     catch (err) {
//         res.json({ message: err })
//     }
// })
const posts = [
    {
        username: 'admin',
        title: 'Post 1'
    },
    {
        username: 'Jim',
        title: 'Post 2'
    }
]
const refreshTokens = [];
router.get('/', authenticateToken, (req, res) => {
    res.json(posts)
    //res.json(posts.filter(post => post.username === req.user.username))
})
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log(err)
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}
router.post('/', async (req, res) => {
    try {
        //for inserting s
        // const hashPass = await bcrypt.hash(req.body.password,10);
        // console.log(hashPass);
        // const user = new User({
        //     username:req.body.username,
        //     password:hashPass
        // })
        // user.save()
        // .then((data)=>{
        //     res.json(data);
        // })
        // .catch((err)=>{
        //     res.json({message:err})
        // })
        //for inserting e
        try {
            const user = await User.find({ username: req.body.username })
            //console.log(user)
            if (user.length == 0) {
                res.json({ message: 'User not found.' });
            }
            else {
                if (await bcrypt.compare(req.body.password, user[0].password)) {
                    //require('crypto').randomBytes(64).toString('Hex')
                    //jwt s
                    const user = { username: req.body.username }
                    const accessToken = generateAccessToken(user)
                    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
                    refreshTokens.push(refreshToken)
                    //jwt e
                    res.json({ message: 'Login successful.', accessToken: accessToken, refreshToken: refreshToken });
                }
                else {
                    res.json({ message: 'The password that you\'ve entered is incorrect.' });
                }
            }
        }
        catch (err) {
            res.json({ message: err })
        }
    } catch (err) {
        res.json({ message: err })
    }
})
router.post('/token', (req, res) => {
    const refreshToken = req.body.token
    console.log('dhukse')
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ username: user.username })
        res.json({ accessToken: accessToken })
    })
})
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3m' }) //15s
}
router.delete('/:userId', async (req, res) => {
    try {
        const userRemove = await User.remove({ _id: req.params.userId })
        res.json(userRemove)
    }
    catch (err) {
        res.json({ message: err })
    }
})
module.exports = router;