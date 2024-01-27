const mongoose = require('mongoose');

const sizeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
})


sizeSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

sizeSchema.set('toJSON', {
    virtuals: true,
});

exports.Size = mongoose.model('Size', sizeSchema);
