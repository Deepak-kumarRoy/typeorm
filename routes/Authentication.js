require('dotenv').config();
const express = require('express');
const router = express.Router();
var typeorm = require('typeorm');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const connection = require('../server')
router.use(bodyParser.json())
const login_table = "user";

router.get('/login', async (req, res) => {
    const connection = typeorm.getConnection();

    var result = await connection.getRepository(login_table)
        .createQueryBuilder().getMany();
    res.status(200).json({
        "Message": "Working",
        result
    })
})

router.post('/post', async (req, res) => {
    const connection = typeorm.getConnection();
    var { email, password } = req.body;
    password = await bcrypt.hash(password, 10);

    var result = await connection.getRepository(login_table)
    let userLogin = await result.findOne({ email: req.body.email });

    if (userLogin === undefined) {

        await connection.getRepository(login_table)
            .createQueryBuilder()
            .insert()
            .values({ email, password }).execute();

            res.send({
                "Message": "user registered successfully"
            })

    } else {
        res.send({
            "Message": "user already exist"
        })
    }

});

router.post('/user', async (req, res) => {
    const connection = typeorm.getConnection()

    var result = await connection.getRepository(login_table)

    const accessToken = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, async (err, token) => {

        let userLogin = await result.findOne({ email: req.body.email });

        var pass = await bcrypt.compare(req.body.password, userLogin.password)
        console.log(pass)

        if (userLogin === undefined || pass === false) {
            res.send({
                "Message": "user Not found"
            })
        } else {

            res.status(200).json({
                userLogin,
                accessToken: token
            })
        }
    });
})

module.exports = router;