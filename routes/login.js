const express = require('express');
const router = express.Router();
const User = require('../models/User')
const Machine = require('../models/Machine')
const Mao = require('../models/Mao')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//-------------------------
router.post('/addmao', async (req, res) => {
    //for inserting s
    const mao_ = new Mao({
        mid: req.body.mid,
        oid: req.body.oid,
        username: req.body.username,
        schedule: req.body.schedule,
        activatedDate: new Date(req.body.activatedDate)
    })
    try {
        const macUpdate = await Machine.updateOne(
            { _id: req.body.mid },
            { $set: { assigned: 'yes' } })
        res.json(macUpdate)
    }
    catch (err) {
        //res.json({ message: err })
        console.log(err)
    }
    mao_.save()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.json({ message: err })
        })
    //for inserting e
})
router.get('/mao', async (req, res) => {
    try {
        const maos = await Mao.find({ __v: 0 }, { _id: 1, mid: 1, oid: 1, username: 1, schedule: 1, activatedDate: 1 }).sort({ _id: -1 })
        res.json(maos)
    }
    catch (err) {
        res.json(err)
    }
})
router.get('/mao/:username', async (req, res) => {
    try {
        const maos = await Mao.find({ __v: 0, oid: req.params.username }, { _id: 1, mid: 1, oid: 1, username: 1, schedule: 1, activatedDate: 1 }).sort({ _id: -1 })
        res.json(maos)
    }
    catch (err) {
        res.json(err)
    }
})
router.post('/getmachineoption', async (req, res) => {
    try {
        console.log(req.body.schedule)
        console.log(req.body.activatedDate)
        const maos = await Mao.find({ schedule: req.body.schedule, activatedDate: new Date(req.body.activatedDate.toString()) }, { oid: 1, mid: 1, _id: 0 })
        console.log(maos)
        let macArray = [];
        let opArray = [];
        for (let i = 0; i < maos.length; i++) {
            macArray.push(maos[i].mid);
            opArray.push(maos[i].oid);
        }
        const macs = await Machine.find({ __v: 0, _id: { $nin: macArray } }, { name: 1, _id: 1 })
        console.log(macs)

        const users = await User.find({ role: 'operator', _id: { $nin: opArray } }, { username: 1, _id: 1 })
        console.log(users)
        res.json({ ms: macs, us: users })
    }
    catch (err) {
        res.json(err)
    }
})
//------------------------
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
// router.get('/', authenticateToken, (req, res) => {
//     res.json(posts)
//     //res.json(posts.filter(post => post.username === req.user.username))
// })
router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({ __v: 0, role: 'admin' }, { username: 1, email: 1, role: 1, _id: 1 }).sort({ _id: -1 })
        res.json(users)
    }
    catch (err) {
        res.json(err)
    }
})
router.get('/operator', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({ __v: 0, role: 'operator' }, { username: 1, email: 1, role: 1, _id: 1 }).sort({ _id: -1 })
        res.json(users)
    }
    catch (err) {
        res.json(err)
    }
})
router.post('/getuser', async (req, res) => {
    try {
        const users = await User.find({ _id: req.body.id, role: req.body.role }, { username: 1, email: 1, role: 1, _id: 1 })
        res.json(users)
    }
    catch (err) {
        res.json(err)
    }
})
router.get('/machine', async (req, res) => {
    try {
        const macs = await Machine.find({ __v: 0 }, { name: 1, assigned: 1 }).sort({ _id: -1 })
        res.json(macs)
    }
    catch (err) {
        res.json(err)
    }
})
router.post('/getmachine', async (req, res) => {
    try {
        const macs = await Machine.find({ _id: req.body.id }, { name: 1, _id: 1 })
        res.json(macs)
    }
    catch (err) {
        res.json(err)
    }
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

router.post('/addmachine', (req, res) => {
    //for inserting s
    const mac = new Machine({
        name: req.body.name,
        assigned: 'no'
    })
    mac.save()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.json({ message: err })
        })
    //for inserting e
})
router.post('/insert', async (req, res) => {
    //for inserting s
    const hashPass = await bcrypt.hash(req.body.password, 10);
    console.log(hashPass);
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPass,
        role: req.body.role
    })
    user.save()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.json({ message: err })
        })
    //for inserting e
})
router.post('/emailvalidation', async (req, res) => {
    try {
        const users = await User.find({ __v: 0, email: req.body.email }, { username: 1, email: 1, role: 1, _id: 1 })
        let xx = { found: false }
        if (users.length > 0) xx.found = true
        res.json(xx)
    }
    catch (err) {
        res.json(err)
    }
})
router.get('/getrole/:userId', async (req, res) => {
    try {
        const users = await User.find({ _id: req.params.userId }, { role: 1, _id: 1 })
        res.json({ role: users[0].role })
    }
    catch (err) {
        res.json({ message: err })
    }
})
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
                    const users = await User.find({ username: req.body.username }, { username: 1, email: 1, role: 1, _id: 1 })
                    res.json({ message: 'Login successful.', accessToken: accessToken, refreshToken: refreshToken, id: users[0]._id });
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
router.patch('/updateuser/:userId', async (req, res) => {
    try {
        if (req.body.password == 'empty') {
            const userUpdate = await User.updateOne(
                { _id: req.params.userId },
                { $set: { username: req.body.username, email: req.body.email, role: req.body.role } })
            res.json(userUpdate)
        }
        else {
            const hashPass = await bcrypt.hash(req.body.password, 10);
            const userUpdate = await User.updateOne(
                { _id: req.params.userId },
                { $set: { username: req.body.username, email: req.body.email, role: req.body.role, password: hashPass } })
            res.json(userUpdate)
        }
    }
    catch (err) {
        res.json({ message: err })
    }
})
router.patch('/updatemachine/:macId', async (req, res) => {
    try {
        const machineUpdate = await Machine.updateOne(
            { _id: req.params.macId },
            { $set: { name: req.body.name } })
        res.json(machineUpdate)
    }
    catch (err) {
        res.json({ message: err })
    }
})
router.delete('/deleteuser/:userId', async (req, res) => {
    try {
        const userRemove = await User.remove({ _id: req.params.userId })
        res.json(userRemove)
    }
    catch (err) {
        res.json({ message: err })
    }
})
router.delete('/deletemachine/:macId', async (req, res) => {
    try {
        const machineRemove = await Machine.remove({ _id: req.params.macId })
        res.json(machineRemove)
    }
    catch (err) {
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
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' }) //15s
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