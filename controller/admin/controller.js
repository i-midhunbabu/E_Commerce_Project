var database = require('../../config/database');
var mongo = require('mongodb');

exports.adminIndex = (req,res)=>{
    // res.render('admin/test',{admin:true});
    database.then((resDb)=>{
        resDb.collection('ecommerce').find().toArray().then((result)=>{
            res.render('admin/admincategory',{admin:true, result})
        })
    })

}
exports.admin =(req,res)=>{  
            res.render('admin/categoryadd',{admin:true})
}

exports.adminEdit=(req,res)=>{
    let editId = req.params.id;
    database.then((resDb)=>{
        resDb.collection('ecommerce').findOne({_id: new mongo.ObjectId(editId)}).then((result)=>{
            res.render('admin/categoryedit',{admin:true, result})
        })
    })
}

// Subcategory
exports.adminSubcat = (req,res)=>{
    database.then((resDb)=>{
        resDb.collection('sub_category').find().toArray().then((result2)=>{
            console.log(result2);
            
            res.render('admin/adminsubcat',{admin:true, result2})
        })
    })
}

exports.admin1 = (req, res) => {
    database.then(async (resDb) => {
        const result = await resDb.collection('ecommerce').find().toArray();
        const result2 = await resDb.collection('sub_category').aggregate([
            { 
                '$addFields': { 
                    'userid': { '$toObjectId': '$Category1' } //Convert Category1 ObjectId
                } 
            },
            {
                $lookup: {
                    from: 'ecommerce',
                    localField: 'userid',
                    foreignField: '_id',
                    as: 'newForm'
                }
            },
            { $unwind: '$newForm' }
        ]).toArray();
        
        console.log(result2);
        res.render('admin/subcatadd', { admin: true, result, result2 });
    });
};
//edit (subcategory)
exports.adminEdit1 = (req,res)=>{
    let editId = req.params.id;
    database.then(async(resDb)=>{
        const result = await resDb.collection('ecommerce').find().toArray();
        const result2 = await resDb.collection('sub_category').findOne({_id: new mongo.ObjectId(editId)}).then((result2)=>{
            res.render('admin/edit1',{admin:true, result,result2})
        })
    })
}

//products
exports.adminProduct = (req,res)=>{
    database.then(async(resDb)=>{
       let result2= await resDb.collection('product').aggregate([
        {'$addFields' : {'userid' : {'$toObjectId' : '$Category2'}}},
        {
            $lookup : {
                from : 'ecommerce',
                localField : 'userid',
                foreignField : '_id',
                as : 'catdet'
            }
        },
        {'$addFields' : {'userid' : {'$toObjectId' : '$Subcategory1'}}},
        {
            $lookup : {
                from :'sub_category',
                localField : 'userid',
                foreignField : '_id',
                as : 'subcatdet'
            }
        },
        {$unwind : '$catdet'},
        {$unwind : '$subcatdet'}
       ]).toArray()
            res.render('admin/adminproduct',{admin:true, result2})
        })
    }

exports.adminAdd =(req,res)=>{  
    database.then(async(resDb) => {
        let result = await resDb.collection('ecommerce').find().toArray()
        let result2 = await resDb.collection('sub_category').find().toArray()
        res.render('admin/productadd',{admin:true,result,result2})
        
    })
    
}
exports.adminEdit2 = (req,res)=>{
    let editId = req.params.id;
    database.then(async(resDb)=>{
        const result = await resDb.collection('ecommerce').find().toArray();
        const result2 = await resDb.collection('sub_category').find().toArray();
        const result1 = await resDb.collection('product').findOne({_id: new mongo.ObjectId(editId)})
            res.render('admin/edit2',{result1, result, result2, admin:true })
        
    })
}

exports.userList =(req,res)=>{
    database.then(async(resDb)=>{
        const users= await resDb.collection('siteReg').find({status:1}).toArray();
        res.render('admin/userlist',{users,admin:true})
    })
}
exports.viewlist =(req,res)=>{
    const userId= req.params.userId;
    database.then(async(resDb)=>{
        const orders= await resDb.collection('orders').find({userId:userId}).toArray()

        const orderDetails =[]
        for(let order of orders){
            const product= await resDb.collection('product').findOne({_id: new mongo.ObjectId(order.productId)})
            if(product){
                orderDetails.push({
                    productDetails:{
                        ProductName: product.ProductName,
                        ProductDescription: product.ProductDescription,
                        ProductPrice: product.ProductPrice,
                        ProductImage: product.ProductImage
                    }
                })
            }
        }

        res.render('admin/viewList',{orders:orderDetails,admin:true})
    })
}

