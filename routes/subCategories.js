const multer = require('multer');
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const {Category} = require('../models/category');
const  {SubCategory} = require('../models/subcategory');
const {Product} = require('../models/product');
const express = require('express');
const router = express.Router();

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const s3 = new aws.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_BUCKET_REGION,
});

const uploadOptions = (bucketName) =>
    multer({
      storage: multerS3({
        s3,
        bucket: bucketName,
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          cb(null, `image-${Date.now()}.jpeg`);
        },
        filename: function (req, file, cb) {
            const fileName = file.originalname.split(' ').join('-');
            const extension = FILE_TYPE_MAP[file.mimetype];
            cb(null, `${fileName}-${Date.now()}.${extension}`)
          }
      }),
});

router.get(`/`, async (req, res) =>{
    const subCategoryList = await SubCategory.find();

    if(!subCategoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(subCategoryList);
})

router.get('/:id', async(req,res)=>{
    const subCategory = await SubCategory.findById(req.params.id);

    if(!subCategory) {
        res.status(500).json({message: 'The subCategory with the given ID was not found.'})
    } 
    res.status(200).send(subCategory);
})

router.get(`/:subCategoryId/products`, async (req, res) =>{
    const product = await Product.find({subCategory:req.params.subCategoryId}).populate('category').populate('subCategory').populate('productVariants');

    if(!product) {
        res.status(500).json({success: false})
    } 
    res.send(product);
})


router.post('/', uploadOptions("pvrd-products").single('image'), async (req,res)=>{
    const file = req.file;
    if(!file) return res.status(400).send('No image in the request');

    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');

    let subCategory = new SubCategory({
        name: req.body.name,
        image: req.file.location,
        Category:req.body.category
    })

    subCategory = await subCategory.save();

    if(subCategory._id){
         const updatedCategory = await Category.findByIdAndUpdate(
            req.body.category,
            {$push: {"subCategories": {_id: subCategory._id, name:subCategory.name}}},
            {upsert: true, new : true}
        )
    
        if(!updatedCategory)
        return res.status(400).send('Error while updating category after subcategory creation!')
        
        res.send(subCategory);
    }
    if(!subCategory)
    return res.status(400).send('Error while creating Subcategory!')

})


router.put('/:id',async (req, res)=> {
    const subCategory = await subCategory.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name
        },
        { new: true}
    )

    if(!subCategory)
    return res.status(400).send('the subCategory cannot be modified!')

    res.send(subCategory);
})

// router.delete('/:id', (req, res)=>{
//     Category.findByIdAndRemove(req.params.id).then(category =>{
//         if(category) {
//             return res.status(200).json({success: true, message: 'the category is deleted!'})
//         } else {
//             return res.status(404).json({success: false , message: "category not found!"})
//         }
//     }).catch(err=>{
//        return res.status(500).json({success: false, error: err}) 
//     })
// })

module.exports =router;