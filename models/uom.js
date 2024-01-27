const mongoose = require('mongoose');

const uomSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
})


uomSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

uomSchema.set('toJSON', {
    virtuals: true,
});

exports.UoM = mongoose.model('UoM', uomSchema);
