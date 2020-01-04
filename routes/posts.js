const express = require('express');
const router = express.Router();
const Post = require('../models/Post')
const jwt = require('jsonwebtoken')

// router.get('/posts', (req,res)=>{
//     res.send('Hello posts');
// })

// router.get('/', async (req,res)=>{
//     try{
//         const posts = await Post.find()
//         res.json(posts)
//     }
//     catch(err){
//         res.json(err)
//     }
// })
router.get('/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
        res.json(post)
    }
    catch (err) {
        res.json({ message: err })
    }
})
router.delete('/:postId', async (req, res) => {
    try {
        const postRemove = await Post.remove({ _id: req.params.postId })
        res.json(postRemove)
    }
    catch (err) {
        res.json({ message: err })
    }
})
router.patch('/:postId', async (req, res) => {
    try {
        const postUpdate = await Post.updateOne(
            { _id: req.params.postId },
            { $set: { title: req.body.title } })
        res.json(postUpdate)
    }
    catch (err) {
        res.json({ message: err })
    }
})
router.get('/1', (req, res) => {
    res.send('Hello posts 1');
})
router.post('/', (req, res) => {
    console.log(req.body)
    const post = new Post({
        title: req.body.title,
        description: req.body.description
    })
    post.save()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.json({ message: err })
        })
})
//jwt
//tokes
const posts = [
    {
        username: 'Kyle',
        title: 'Post 1'
    },
    {
        username: 'Jim',
        title: 'Post 2'
    }
]
router.get('/', authenticateToken, (req, res) => {
    //res.json(posts)
    res.json(posts.filter(post => post.username === req.user.username))
})
router.post('/jwt', (req, res) => {
    let actUser = { username: req.body.username }
    const accessToken = jwt.sign(actUser, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken })
})
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log(err)
        if (err) return res.sendStatus(403)
        console.log(user)
        req.user = user
        next()
    })
}
//refresh tokens
let refreshTokens = [];
router.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ username: user.username })
        res.json({ accessToken: accessToken })
    })
})

router.delete('/logout/:token', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.params.token)
    // res.sendStatus(204)
    res.json({message:'Refresh token deleted'})
})

router.post('/jwtlogin', (req, res) => {
    // Authenticate User
    const username = req.body.username
    const user = { username: username }

    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' }) //15s
}
module.exports = router;