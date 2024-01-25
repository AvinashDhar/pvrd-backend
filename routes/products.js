const {Product} = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const  {SubCategory} = require('../models/subcategory');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const { ProductVariant } = require('../models/productVariant');

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
    let filter = {};
    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category')
    .populate('subCategory').populate('productVariants').populate('colour');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})

router.get(`/:id`, async (req, res) =>{
    const product = await Product.findById(req.params.id).populate('category').populate('subCategory').poplulate('colour');

    if(!product) {
        res.status(500).json({success: false})
    } 
    res.send(product);
})

router.post(`/`, uploadOptions("pvrd-products").single('image'), async (req, res) =>{
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');

    if(req.body.subCategory){
        const subCategory = await SubCategory.findById(req.body.subCategory);
        if(!subCategory) return res.status(400).send('Invalid subCategory');
    }
    const existingProduct = await Product.find({name:req.body.name, brand:req.body.brand});
    if(existingProduct.length !== 0){
        return res.status(500).send({error: "Product Name or Brand Name is not unique!"})
    }
    const file = req.file;

    //product variants creation:
    const productVariantIds = Promise.all(JSON.parse(req.body.productVariants)?.map(async (productVariant) =>{
        let newProductVariant = new ProductVariant({
            size: productVariant.size,
            uom: productVariant.uom,
            colour: productVariant.colour,
            price: productVariant.price,
            packingUnit: productVariant.packingUnit,
            rewardPoint: productVariant.rewardPoint,
            countInStock: productVariant.countInStock,
            isFeatured: productVariant.isFeatured,
        })

        try {
            newProductVariant = await newProductVariant.save();
            return newProductVariant._id;
        } catch (error) {
            return res.status(500).send({message:"error while creating product variants",error: error.message})
        }
        
    }))
    
    const productVariantIdsResolved =  await productVariantIds;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        size: req.body.size,
        uom:req.body.uom,
        colour: req.body.colour,
        price: req.body.price,
        packingUnit: req.body.packingUnit,
        rewardPoint: req.body.rewardPoint,
        countInStock: req.body.countInStock,
        richDescription: req.body.richDescription,
        image: req.file?.location,
        brand: req.body.brand,
        category: req.body.category,
        subCategory: req.body.subCategory,
        productVariants: productVariantIdsResolved,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })
    try {
        product = await product.save();
    } catch (error) {
        return res.status(500).send({message:"error while creating product",error: error.message})
    }

    if(!product) {
        return res.status(500).send('The product cannot be created')
    }
    

    res.send(product);
})

router.put('/:productId', uploadOptions("pvrd-products").single('image'), async (req, res)=> {
    if(!mongoose.isValidObjectId(req.params.productId)) {
        return res.status(400).send('Invalid Product Id')
     }
    if(req.body?.removeImage) {
        const product = await Product.findByIdAndUpdate(
            req.params.productId,
            {
                image: ''
            },
            { new: true}
        );
        return res.send(product);

    }
    if(req.body?.removeImages) {
        const product = await Product.findByIdAndUpdate(
            req.params.productId,
            {
                images: []
            },
            { new: true}
        );
        return res.send(product);

    }
    
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');

    if(req.body.subCategory){
        const subCategory = await SubCategory.findById(req.body.subCategory);
        if(!subCategory) return res.status(400).send('Invalid subCategory');
    }
    let productVariantIdsResolved = [];
    if(req.body.productVariants){
        const productVariantIds = Promise.all(JSON.parse(req.body.productVariants)?.map(async (productVariant) =>{    
            try {
                const productVariantInDb = await ProductVariant.findById(productVariant.id);
                if(!productVariantInDb) {
                    let newProductVariant = new ProductVariant({
                        size: productVariant.size,
                        uom: productVariant.uom,
                        colour: productVariant.colour,
                        price: productVariant.price,
                        packingUnit: productVariant.packingUnit,
                        rewardPoint: productVariant.rewardPoint,
                        countInStock: productVariant.countInStock,
                        isFeatured: productVariant.isFeatured,
                    });
                    newProductVariant = await newProductVariant.save();
                    return newProductVariant._id;
                }

                let updatedProductVariant = await ProductVariant.findByIdAndUpdate(
                    productVariant.id,
                    {
                        size: productVariant.size,
                        uom: productVariant.uom,
                        colour: productVariant.colour,
                        price: productVariant.price,
                        packingUnit: productVariant.packingUnit,
                        rewardPoint: productVariant.rewardPoint,
                        countInStock: productVariant.countInStock,
                        isFeatured: productVariant.isFeatured,
                    },
                    { new: true}
                )
                return updatedProductVariant?._id;

            } catch (error) {
                return res.status(500).send({error: error.message})
            }
            
        }));
        productVariantIdsResolved =  await productVariantIds;
    }

    const product = await Product.findByIdAndUpdate(
        req.params.productId,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            size: req.body.size,
            uom:req.body.uom,
            colour: req.body.colour,
            price: req.body.price,
            packingUnit: req.body.packingUnit,
            rewardPoint: req.body.rewardPoint,
            countInStock: req.body.countInStock,
            image: req.file?.location,
            brand: req.body.brand,
            category: req.body.category,
            subCategory: req.body.subCategory,
            productVariants: productVariantIdsResolved,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true}
    )

    if(!product)
    return res.status(500).send('the product cannot be updated!')

    res.send(product);
})

router.put('/productVariants/:productVariantId',async (req, res)=> {
    if(!mongoose.isValidObjectId(req.params.productVariantId)) {
       return res.status(400).send('Invalid ProductVariant Id')
    }
    //product variants update:

        const updatedProductVariant = await ProductVariant.findByIdAndUpdate(
            req.params.productVariantId,
            {
                size: req.body.size,
                uom: req.body.uom,
                colour: req.body.colour,
                price: req.body.price,
                packingUnit: req.body.packingUnit,
                rewardPoint: req.body.rewardPoint,
                countInStock: req.body.countInStock,
                isFeatured: req.body.isFeatured,
            },
            { new: true}
        )
        if(!updatedProductVariant)
            return res.status(500).send('the productVariant cannot be updated!')

    res.send(updatedProductVariant);
})

router.delete('/:id', (req, res)=>{
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product) {
            return res.status(200).json({success: true, message: 'the product is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "product not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.put(
    '/gallery-images/:id', 
    uploadOptions("pvrd-products").array('images', 10), 
    async (req, res)=> {
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
         }
         const files = req.files
         let imagesPaths = [];
         //const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

         if(files) {
            files.map(file =>{
                //imagesPaths.push(`${basePath}${file.filename}`);
                imagesPaths.push(file.location)
            })
         }

         const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            { new: true}
        )

        if(!product)
            return res.status(500).send('the gallery cannot be updated!')

        res.send(product);
    }
)

module.exports =router;





// router.get(`/get/count`, async (req, res) =>{
//     const productCount = await Product.countDocuments((count) => count)

//     if(!productCount) {
//         res.status(500).json({success: false})
//     } 
//     res.send({
//         productCount: productCount
//     });
// })

// router.get(`/get/featured/:count`, async (req, res) =>{
//     const count = req.params.count ? req.params.count : 0
//     const products = await Product.find({isFeatured: true}).limit(+count);

//     if(!products) {
//         res.status(500).json({success: false})
//     } 
//     res.send(products);
// })