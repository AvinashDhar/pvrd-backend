const mongoose = require('mongoose');

const productVariantSchema = mongoose.Schema({
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
        default: '',
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
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})

productVariantSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productVariantSchema.set('toJSON', {
    virtuals: true,
});


exports.ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
