var express = require('express');
var router = express.Router();
var database = require('../../config/database');
var mongo = require('mongodb');
var controller = require('./controller');

router.get('/',controller.adminIndex);

router.get('/categoryadd', controller.admin);

router.post('/categoryadd',(req,res)=>{
    let params={
        Category: req.body.name,
        Description: req.body.desc,
        Image: req.files.file.name

    }
    console.log(params)
    database.then((data)=>{
        data.collection('ecommerce').insertOne(params).then((result)=>{
            let fileup = req.files.file;
            fileup.mv('public/images/' +params.Image).then((imgRes)=>{
                console.log(imgRes);
                res.redirect('/admin')
            })
        })
    })
})
            //delete (category)
router.get('/admincategory/delete/:id',(req,res)=>{
    let delid = req.params.id;
    console.log(delid);
    database.then((resDb)=>{
        resDb.collection('ecommerce').deleteOne({_id: new mongo.ObjectId(delid)}).then((result)=>{
            console.log(result);
        })
    })
    res.redirect('/admin');

})

        //Edit (category)
        router.get('/categoryedit/:id',controller.adminEdit);
        // router.get('/admin/edit1/:id',controller.adminEdit);
        router.post('/edit/:id',(req,res)=>{
            let upId = req.params.id;
            let params={
                Category: req.body.name,
                Description: req.body.desc,
                Image: req.files?.file?.name
            }
            let upDate = ''
            if(req.files?.file){
                upDate ={
                    Category: params.Category,
                    Description: params.Description,
                    Image: params.Image
                }
                let fileup=req.files.file;
                fileup.mv('public/images/' +params.Image)
            }
            else{
                upDate ={
                    Category: params.Category,
                    Description: params.Description,
                }
            }
                    database.then((data)=>{
                        data.collection('ecommerce').updateOne({_id:new mongo.ObjectId(upId)},{$set:upDate}).then((result)=>{
                            console.log(result);
                        })
                    })
           res.redirect('/admin')     
            
        })
        
    //subcategory
    router.get('/adminsubcat',controller.adminSubcat)   

    router.get('/subcatadd',controller.admin1)
    router.post('/subcatadd',(req,res)=>{
        let params={
            Category1 : req.body.category,
            Subcategory : req.body.subcat
        }
        database.then((data)=>{
            data.collection('sub_category').insertOne(params).then((result)=>{
                console.log(result);
            })
        })
        res.redirect('/admin/subcatadd')
    })

//edit (subcategory)
    router.get('/edit1/:id',controller.adminEdit1);
    router.post('/subcatadd/:id',(req,res)=>{
        let upId = req.params.id;
        let params = {
            Category1 : req.body.category,
            Subcategory : req.body.subcat
        }
        database.then((data)=>{
            data.collection('sub_category').updateOne({_id:new mongo.ObjectId(upId)},{$set:params}).then((result)=>{
                console.log(result);
            })
        })
        res.redirect('/admin/subcatadd')
    })

//delete (subcategory)
    router.get('/subcatadd/delete/:id',(req,res)=>{
        let delid = req.params.id;
        console.log(delid);
        database.then((resDb)=>{
            resDb.collection('sub_category').deleteOne({_id:new mongo.ObjectId(delid)}).then((result2)=>{
                console.log(result2);
            })
        })
        res.redirect('/admin/subcatadd')
    })

    //products
    router.get('/adminproduct',controller.adminProduct);

    router.get('/productadd',controller.adminAdd);
    router.post('/productadd',(req,res)=>{
        let params ={
            Category2 : req.body.category,
            Subcategory1 : req.body.subcategory,
            ProductName : req.body.productname,
            ProductDescription : req.body.productdescription,
            ProductPrice : req.body.productprice,
            ProductImage : req.files.file.name
        }
        console.log(params);
        database.then((data)=>{
            data.collection('product').insertOne(params).then((result)=>{
                let fileup = req.files.file;
                fileup.mv('public/images/' +params.ProductImage).then((imgRes)=>{
                    console.log(imgRes);
                    res.redirect('/admin/adminproduct')
                })
            })
        })
    })

    router.get('/adminproduct/delete/:id',(req,res)=>{
        let delid = req.params.id;
        console.log(delid);
        database.then((resDb)=>{
            resDb.collection('product').deleteOne({_id: new mongo.ObjectId(delid)}).then((result)=>{
                console.log(result);
            })
        })
        res.redirect('/admin/adminproduct');
    
    })


            
        router.get('/edit2/:id',controller.adminEdit2);
        router.post('/edit2/:id',(req,res)=>{
            let upId = req.params.id;
            let params={
                Category2 : req.body.category,
                Subcategory1 : req.body.subcategory,
                ProductName : req.body.productname,
                ProductDescription : req.body.productdescription,
                ProductPrice : req.body.productprice,
                ProductImage: req.files?.file?.name
            }
            let upDate = ''
            if(req.files?.file){
                upDate ={
                    Category2 : params.Category2,
                    Subcategory1 : params.Subcategory1,
                    ProductName : params.ProductName,
                    ProductDescription: params.ProductDescription,
                    ProductPrice : params.ProductPrice,
                    ProductImage: params.ProductImage
                }
                let fileup=req.files.file;
                fileup.mv('public/images/' +params.ProductImage)
            }
            else{
                upDate ={
                    Category2: params.Category2,
                    Subcategory1 : params.Subcategory1,
                    ProductName : params.ProductName,
                    ProductDescription: params.ProductDescription,
                    ProductPrice : params.ProductPrice
                }
            }
                    database.then((data)=>{
                        data.collection('product').updateOne({_id:new mongo.ObjectId(upId)},{$set:upDate}).then((result)=>{
                            console.log(result);
                        })
                    })
           res.redirect('/admin/adminproduct')     
            
        })

        router.get('/logout',(req,res)=>{
            req.session.destroy()
            res.redirect('/login')
        })

        router.get('/userlist',controller.userList);
        router.get('/user/orders/:userId',controller.viewlist);

module.exports = router;