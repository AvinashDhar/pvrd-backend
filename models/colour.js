const mongoose = require('mongoose');

const colourSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: ''
    }
})


colourSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

colourSchema.set('toJSON', {
    virtuals: true,
});

exports.Colour = mongoose.model('Colour', colourSchema);
