const mongoose = require('mongoose');

const subCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: ''
    },
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
})


subCategorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

subCategorySchema.set('toJSON', {
    virtuals: true,
});

exports.SubCategory = mongoose.model('SubCategory', subCategorySchema);
