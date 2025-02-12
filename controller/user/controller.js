var database = require('../../config/database');
var mongo = require('mongodb');


exports.userIndex = (req, res) => {
    res.render('user/test');
}


exports.userHome = (req, res) => {
    database.then(async(resDb) => {
        const productinfo = await resDb.collection('product').find().toArray();
        const categoryinfo = await resDb.collection('ecommerce').find().toArray();

        let cartCount=0;
        let orderCount =0;
        if(req.session.user)
        {
            const cartItems= await resDb.collection('cart').find({sessionId:req.session.user._id}).toArray();
            cartCount=cartItems.length;
            const orderItems= await resDb.collection('orders').find({userId:req.session.user._id,userstatus:1}).toArray();
            orderCount=orderItems.length;
        }

        res.render('user/home',{productinfo, categoryinfo, user:req.session.user,cartCount,orderCount, currentPage: 'home'})
    })

}


exports.productList = (req, res) => {
    let reqid = req.params.id;
    database.then(async(resDb) => {
        let cartCount=0;
        let orderCount=0;
        if(req.session.user)
            {
                const cartItems= await resDb.collection('cart').find({sessionId:req.session.user._id}).toArray();
                cartCount=cartItems.length;
                const orderItems= await resDb.collection('orders').find({userId:req.session.user._id,userstatus:1}).toArray();
                orderCount=orderItems.length;
            }
        resDb.collection('product').findOne({ _id: new mongo.ObjectId(reqid) }).then((result) => {
            res.render('user/userproduct', { result, user:req.session.user,orderCount,cartCount })

        })
    })
}


exports.categoryList =(req,res) =>{
    let reqid = req.params.id;
    database.then(async(resDb) => {
        let cartCount=0;
        let orderCount=0;
        if(req.session.user)
            {
                const cartItems= await resDb.collection('cart').find({sessionId:req.session.user._id}).toArray();
                cartCount=cartItems.length;
                const orderItems= await resDb.collection('orders').find({userId:req.session.user._id,userstatus:1}).toArray();
                orderCount=orderItems.length;
            }
        const categoryinfo = await resDb.collection('ecommerce').findOne({_id:new mongo.ObjectId(reqid)})
        const productinfo = await resDb.collection('product').aggregate([
            {
                $match:{Category2:reqid}
            },
            {
                "$addFields":{"categoryid":{"$toObjectId":"$Category2"}}
            },
            {
                $lookup:{
                    from: "ecommerce",
                    localField: "categoryid",
                    foreignField: "_id",
                    as:"categorydetails"
                }
            },
            {$unwind: "$categorydetails"},
        ])
        .toArray();
        res.render('user/usercategory',{cartCount,orderCount,categoryinfo, productinfo, user:req.session.user})
        })
    }

exports.userReg =(req,res)=>{
    database.then((resDb)=>{
        resDb.collection('siteReg').find().toArray().then((result1)=>{
            res.render('user/register',{result1})
        })
    })
}

exports.userLogin =(req,res)=>{
    res.render('user/login')
}

exports.userCart =(req,res)=>{
    database.then(async(resDb)=>{
        let userId=req.session.user._id;
        let cartItems= await resDb.collection('cart').find({sessionId:userId, userstatus:0}).toArray()
        let orderCount=0;
        if(req.session.user)
            {
                const orderItems= await resDb.collection('orders').find({userId:req.session.user._id,userstatus:1}).toArray();
                orderCount=orderItems.length;
            }

        let productDetails=await resDb.collection('product').aggregate([
            {
                $match:{_id:{$in: cartItems.map(item=>new mongo.ObjectId(item.productId))}}
            }
        ]).toArray()
        let cartCount = cartItems.length;
        let totalPrice = productDetails.reduce((acc,product)=> acc + Number(product.ProductPrice),0)
        console.log(totalPrice)
        res.render('user/cart',{user:req.session.user,productDetails,orderCount,cartCount,totalPrice})
    })
}

exports.userOrder = async (req, res) => {
    let userId = req.session.user._id;
    database.then(async (resDb) => {
        let orderItems = await resDb.collection('orders').find({ userId: userId, userstatus: 1 }).toArray();
        let orderCount =0;
        if(req.session.user)
            {
                const cartItems= await resDb.collection('cart').find({sessionId:req.session.user._id}).toArray();
                var cartCount=cartItems.length;
                const orderItems= await resDb.collection('orders').find({userId:req.session.user._id,userstatus:1}).toArray();
                orderCount=orderItems.length;
            }
    
        if (orderItems.length === 0) {
            console.log('No order items found.');
            res.render('user/order', { orderItems: [], user: req.session.user, cartCount: 0 });
            return;
        }

        const { ObjectId } = require('mongodb');

        const productsWithDetails = await resDb.collection('orders').aggregate([
            {
                $match: { userId: userId, userstatus: 1 }
            },
            {
                $lookup: {
                    from: 'product',
                    let: { productIdString: '$productId' }, 
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', { $toObjectId: '$$productIdString' }] }
                            }
                        }
                    ],
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' }
        ]).toArray();

        console.log(productsWithDetails);

        res.render('user/order', { orderItems: productsWithDetails, user: req.session.user, cartCount, orderCount });
    });
};
