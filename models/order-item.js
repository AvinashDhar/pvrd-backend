const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    productVariant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant'
    },
    status: {
        type: String,
        required: true
    },
    adminMessage: {
        type: String,
        required: true
    },
})

orderItemSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderItemSchema.set('toJSON', {
    virtuals: true,
});

exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);

