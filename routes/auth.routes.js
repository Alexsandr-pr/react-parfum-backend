const Router = require("express");
const User = require("../models/User");
const Tovar = require('../models/Cart');
const router = new Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const {check, validationResult} = require("express-validator")
const config = require("config")
const authMiddleware = require("../middleware/auth.middleware")

router.post("/registration", 
    [
        check("email", "Uncorrect email").isEmail(),
        check("password", "Password must be longer than 3 and shorter than 12").isLength({min:3, max:12}),
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({message: "Uncorrect request", errors})
        }

        const {email, password} = req.body

        const candidate = await User.findOne({email})

        if(candidate ) {
            return res.status(400).json({message:  `User with email ${email} already exist`})
        }
        const hashPassword = await bcrypt.hash(password, 8)
        const user = new User({email, password: hashPassword})
        await user.save()
        return res.json({message: "User was created"})
    }catch(e) {
        
        res.send({message:"Server error"})
    }
})

router.post("/login", 
    async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user) {
            return res.status(404).json({message: "User not found"})
        }
        const isPassValid = bcrypt.compareSync(password, user.password)
        if(!isPassValid) {
            return res.status(400).json({message: "Invalid password"})
        }
        const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: '1h'})
        return res.json({
            token,
            user:{
                name: user.name,
                id:user.id,
                email: user.email,
                diskSpace: user.diskSpace,
                usedSpace: user.usedSpace,
                avatar: user.avatar
            }
        })
    }catch(e) {
        console.log(e)
        res.send({message:"Server error"})
    }
})

router.get("/auth", authMiddleware,

    async (req, res) => {
    try {
        const user = await User.findOne({_id: req.user.id})
        
        const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: '1h'})
        return res.json({
            token,
            user:{
                id:user.id,
                email: user.email,
                diskSpace: user.diskSpace, 
                usedSpace: user.usedSpace,
                avatar: user.avatar
            }
        })
    }catch(e) {
        console.log(e)
        res.send({message:"Server error"})
    }
})

router.get("/tovar", async (req, res) => {
    try {
        const tovars = await Tovar.find();
        res.json(tovars); 
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении товаров' }); 
    }
});
router.get(`/card/:id`, async (req, res) => {
    try {
        const id = req.params.id;
        const tovar = await Tovar.findOne({ id: id });
        if (!tovar) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json(tovar);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении товара' });
    }
});

router.get(`/card`, async (req, res) => {
    try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 15; // Проверяем параметр limit, если не указан, возвращаем 15 карточек
    const tovars = await Tovar.find().limit(limit); // Используем метод limit() для ограничения количества возвращаемых результатов
        res.json(tovars);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении товаров' });
    }
});


module.exports = router