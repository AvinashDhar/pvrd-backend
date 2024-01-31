const multer = require('multer');
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const { Category } = require('../models/category');
const { Product } = require('../models/product');
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

router.get(`/`, async (req, res) => {
    const categoryList = await Category.find().populate('subCategories');

    if (!categoryList) {
        res.status(500).json({ success: false })
    }
    res.status(200).send(categoryList);
})

router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(500).json({ message: 'The category with the given ID was not found.' })
    }
    res.status(200).send(category);
})

router.get(`/:categoryId/products`, async (req, res) => {
    const product = await Product.find({ category: req.params.categoryId }).populate('category').populate('productVariants');

    if (!product) {
        res.status(500).json({ success: false })
    }
    res.send(product);
})


router.post('/', uploadOptions(`pvrd-${bucketStage}-categories`).single('image'), async (req, res) => {
    let category = new Category({
        name: req.body.name,
        image: req.file?.location
    })
    try {
        category = await category.save();
    } catch (error) {
        return res.status(400).send(error)
    }
    if (!category)
        return res.status(400).send('the category cannot be created!')
    res.send(category);
})


router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon || category.icon,
            color: req.body.color,
        },
        { new: true }
    )

    if (!category)
        return res.status(400).send('the category cannot be created!')

    res.send(category);
})

router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: 'the category is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "category not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

module.exports = router;