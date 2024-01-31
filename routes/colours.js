const multer = require('multer');
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const {Colour} = require('../models/colour');
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

const bucketStage = process.env.S3_BUCKET_STAGE;
const bucketName = `pvrd-${bucketStage}-colours`
const uploadOptions = (bucketName) => {
    console.log("=============bucketName=============",bucketName)
    return multer({
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
}


router.get(`/`, async (req, res) =>{
    const colourList = await Colour.find();

    if(!colourList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(colourList);
})

router.get('/:id', async(req,res)=>{
    const colour = await Colour.findById(req.params.id);

    if(!colour) {
        res.status(500).json({message: 'The colour with the given ID was not found.'})
    } 
    res.status(200).send(colour);
})

// router.get(`/:colourId/products`, async (req, res) =>{
//     const product = await Product.find({colour:req.params.colourId}).populate('colour').populate('productVariants');

//     if(!product) {
//         res.status(500).json({success: false})
//     } 
//     res.send(product);
// })


router.post('/', uploadOptions(bucketName).single('image'), async (req,res)=>{
    let colour = new Colour({
        name: req.body.name,
        image: req.file?.location,
    })
    try {
        colour = await colour.save(); 
    } catch (error) {
        return res.status(400).send(error) 
    }
    if(!colour)
        return res.status(400).send('the colour cannot be created!')
    res.send(colour);
})


router.put('/:id',async (req, res)=> {
    const colour = await Colour.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon || colour.icon,
            color: req.body.color,
        },
        { new: true}
    )

    if(!colour)
    return res.status(400).send('the colour cannot be created!')

    res.send(colour);
})

router.delete('/:id', (req, res)=>{
    Colour.findByIdAndRemove(req.params.id).then(colour =>{
        if(colour) {
            return res.status(200).json({success: true, message: 'the colour is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "colour not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;