const multer = require('multer');
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const {Brand} = require('../models/brand');
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
    const brandList = await Brand.find();

    if(!brandList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(brandList);
})

router.get('/:id', async(req,res)=>{
    const brand = await Brand.findById(req.params.id);

    if(!brand) {
        res.status(500).json({message: 'The brand with the given ID was not found.'})
    } 
    res.status(200).send(brand);
})

// router.get(`/:brandId/products`, async (req, res) =>{
//     const product = await Product.find({brand:req.params.brandId}).populate('brand').populate('productVariants');

//     if(!product) {
//         res.status(500).json({success: false})
//     } 
//     res.send(product);
// })


router.post('/', uploadOptions("pvrd-products").single('image'), async (req,res)=>{
    let brand = new Brand({
        name: req.body.name,
        image: req.file?.location
    })
    //const file = req.file;
    //if(!file) return res.status(400).send('No image in the request');

    brand = await brand.save();

    if(!brand)
    return res.status(400).send('the brand cannot be created!')

    res.send(brand);
})


router.put('/:id',async (req, res)=> {
    const brand = await Brand.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
        },
        { new: true}
    )

    if(!brand)
    return res.status(400).send('the brand cannot be updated!')

    res.send(brand);
})

router.delete('/:id', (req, res)=>{
    Brand.findByIdAndRemove(req.params.id).then(brand =>{
        if(brand) {
            return res.status(200).json({success: true, message: 'the brand is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "brand not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;