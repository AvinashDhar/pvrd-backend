const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ''
    },
    richDescription: {
        type: String,
        default: ''
    },
    size: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Size',
        default: ''
    },
    uom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UoM',
        default: ''
    },
    colour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colour',
        default: ''
    },
    price : {
        type: Number,
        default:0
    },
    packingUnit: {
        type: Number,
        default: 1
    },
    rewardPoint : {
        type: Number,
        default:0
    },
    countInStock: {
        type: Number,
        default:10,
        min: 0,
        max: 1000
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        default: '',
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required:false
    },
    productVariants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant'
    }],
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});


exports.Product = mongoose.model('Product', productSchema);
