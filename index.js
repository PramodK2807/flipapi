
const express = require('express');
const app = express();
const cors = require('cors');
const JWT = require('jsonwebtoken');
const bodyParser = require('body-parser');

const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 3100

require('./db/config')

const UserModel = require('./models/UserModel');
const hashPassword = require('./helper/authHelper');
const { compare } = require('bcrypt');

const TodayDeal = require('./models/TodayDeal');
const Categories = require('./models/Categories');
const slugify = require('slugify');
const Products = require('./models/Products');

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send("Flipkart database")
})


// REGISTER

app.post('/register', async(req, res) => {
    let {name, email, password, cpassword, mobile} = req.body;
    if (!name || !email || !password || !cpassword || !mobile) {
        return res.status(500).send({
            success: false,
            message : "Please enter all details"
        })
    }

    try {
        // Check Existing User
        let existingUser = await UserModel.findOne({email, mobile})
        if(existingUser){
            return res.status(200).send({
                success: false,
                message : "Email already registered",
            })
        }

        let hashedPassword = await hashPassword(password)

        let user = await new UserModel({
            name, 
            email, 
            password:hashedPassword, 
            cpassword:hashedPassword, 
            mobile
        })

        await user.save()
        res.status(200).send({
            success: true,
            message: "User Registered Successfully",
            user
        })

    } 
    catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message : "Error while registration"
        })
    }
});


// LOGIN

app.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        
    
        const user = await UserModel.findOne({email})
        if(!user){
            return res.status(404).send({
                success: false,
                message:"User Not Registered"
            })
        }

        if(!email || !password) {
            return res.status(404).send({
                success: false,
                message:"Please enter your email and password"
            })
        }
    
        const matchPass = await compare(password, user.password)
        if(!matchPass){
            return res.status(404).send({
                success: false,
                message:"Email or password incorrect"
            })
    
        }
    
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    
        res.status(200).send({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                isAdmin: user.isAdmin
            },
            token
        })
    } catch (error) {
        res.status(400).send({
            success: false,
            message: "Invalid Credentials",
            error,
        })
    }
})


// DEAL OF THE DAY ROUTES

app.post('/deal', async(req, res) => {
    let {name, image, model_name, starting_price} = req.body
    // console.log(name, image);
    try {
        if(!image || !model_name || !starting_price || !name){
            return res.status(500).send({
                success: false,
                message: "Please Enter all Valid Details",
            })
        }

    const details = await new TodayDeal({
        image,
        model_name,
        starting_price,
        name
    })
    await details.save()
    res.status(201).send({
        success: true,
        message: "Details saved successfully",
        details
    })

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Something went wrong",
            error
        })
    }
})


app.get('/deal', async(req, res) => {
    try {
        let data = await TodayDeal.find()
        if(data){
        res.status(200).send({
            success: true,
            message: "All Deals fetched successfully.",
            data
        })
    }
    } 
    catch (error) {
        res.status(500).send({
            success: false,
            message:"Failed to get data"
        })
    }
})


app.post('/category/create', async (req, res) =>{
    try {
        const {name}= req.body
        console.log(name)
        const existingCategory = await Categories.findOne({name})
        
        if(existingCategory){
            return res.status(200).send({
                success: false,
                message: 'Category Already Exists'
            })
        }
        
        const category = await new Categories({
            name,
            slug:slugify(name)
        })
        await category.save();
        res.status(201).send({
            success: true,
            message: 'Category created successfully',
            category
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error
        })
        
    }
})

app.get('/category', async(req, res) => {
    try {
        let data = await Categories.find()
        if(data){
        res.status(200).send({
            success: true,
            message: "All Categories fetched successfully.",
            data
        })
    }
    } 
    catch (error) {
        res.status(500).send({
            success: false,
            message:"Failed to get data"
        })
    }
})

app.post('/create/product', async (req, res) => {
    let {name, price, offer, description, img,reviews, category, countInStock} = req.body
    try {
        const product = await new Products(
            {name, price, offer, description, img,reviews, category, countInStock}
            )
            await product.save()
            res.status(201).send({
                success: true,
                message: 'Product created successfully',
                product
            })

            console.log(product)

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error
        })
        
    }
})

app.get('/singleProduct/:id', async (req, res) => {
    try {
        let product = await Products.findById({_id:req.params.id})
        if(product){
        res.status(200).send({
            success: true,
            message: "All Categories fetched successfully.",
            product
        })
    }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error
        })
    }
})


app.get('/products/:id', async(req, res) => {
    try {
        
        const category = await Categories.findById({_id:req.params.id})
        console.log(category)
        if(category){
            const products = await Products.find({category}).populate("category")
            if(products.length > 0){
                res.status(200).send({
                    success: true,
                    message: "Products found successfully",
                    category,
                    products
                })
            }
            else{
                res.status(400).send({
                    success: false,
                    message: "No Products found"
                })
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error
        })
    }
})

app.get('/products', async (req, res) => {
    try {
        
        const product = await Products.findById({_id:req.params.id})
            if(product.length > 0){
                res.status(200).send({
                    success: true,
                    message: "Products found successfully",
                    product
                })
            }
            else{
                res.status(400).send({
                    success: false,
                    message: "No Products found"
                })
            }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error
        })
    }
})

app.get('/search/:key', async (req, res) => {
    let data = await Products.find({
        "$or": [
            { name: { $regex: req.params.key, $options: 'i' } },
            {description:{$regex:req.params.key, $options:'i'}},
            // {brand:{$regex:req.params.key, $options:'i'}}
        ]
    })
    res.send(data);
})



app.listen(PORT);