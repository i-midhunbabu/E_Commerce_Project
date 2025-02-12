var express = require('express');
var router = express.Router();
var database = require('../../config/database');
var mongo = require ('mongodb');
var controller = require('./controller');
var bcrypt = require ('bcrypt');

router.get('/',controller.userIndex);

router.get('/home',controller.userHome);

router.get('/userproduct/:id',controller.productList)
router.post('/cart/:id',(req,res)=>{
    let dbdata = {
        productId: req.params.id,
        sessionId: req.session.user._id,
        userstatus: 0
    }

    database.then((data)=>{
        data.collection('cart').insertOne(dbdata).then((result)=>{
            console.log(result)
            res.redirect('/home');
        })
    })
})

router.get('/usercategory/:id',controller.categoryList)


router.get('/register',controller.userReg)
router.post('/register',(req,res)=>{
    let params={
        Name: req.body.name,
        Email: req.body.email,
        Password: req.body.password,
        status: 1
    }
    database.then((data)=>{
        bcrypt.hash(req.body.password,10).then((bpass)=>{
            params.Password=bpass
            data.collection('siteReg').insertOne(params).then((result)=>{
                console.log(result)
        })
        })
    })
    res.redirect('user/register');
})


router.get('/login',controller.userLogin);
router.post('/login',(req,res)=>{
    let params={
        Email: req.body.email,
        Password: req.body.password
    }
    database.then((data)=>{
        data.collection('siteReg').findOne({Email:params.Email}).then((result)=>{
            console.log(result._id)
            if(result){
                bcrypt.compare(params.Password,result.Password).then((crypt)=>{
                    if(crypt){
                        if(result.status==0){
                            req.session.user=result
                            res.redirect('/admin')
                        }
                        else{
                            req.session.user=result
                            res.redirect('/home') 
                        }
                    }
                    else{
                        console.log('Invalid')
                        res.redirect('user/login')
                    }
                })
            }
            else{
                console.log('Invalid User')
                res.redirect('user/login')
            }
        })
    })
})

router.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect('/login')
})

router.get('/cart',controller.userCart)
router.post('/cart/delete/:id',(req,res)=>{
    let productId=req.params.id;
    let userId=req.session.user._id;

    database.then((data)=>{
        data.collection('cart').deleteOne({sessionId:userId,productId:productId}).then((result)=>{
            console.log(result)
            res.redirect('/cart')
        })
    })
})

router.post('/checkout', (req, res) => {
    let userId = req.session.user._id;

    database.then(async (data) => {
        let cartItems = await data.collection('cart').find({ sessionId: userId, userstatus: 0 }).toArray();

        if (cartItems.length === 0) {
            console.log("No items to checkout.");
            return res.redirect('/cart');
        }

        await data.collection('cart').updateMany({ sessionId: userId, userstatus: 0 }, { $set: { userstatus: 1 } });
        const orderData = cartItems.map(item => ({
            userId: userId,
            productId: item.productId,
            userstatus: 1,
            sessionId: userId
        }));

        await data.collection('orders').insertMany(orderData);

        await data.collection('cart').deleteMany({ sessionId: userId, userstatus: 1 });

        res.redirect('/order');
    });
});

router.get('/order',controller.userOrder)

module.exports = router;
