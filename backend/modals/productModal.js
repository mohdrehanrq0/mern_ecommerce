const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a Product Name"]
    },
    description: {
        type: String,
        required: [true, "Please enter a Product Description"]
    },
    price: {
        type:Number,
        required: [true, "Please enter a Product Price"],
        maxlength: [6,"Price cannot exceed 6 digit"]
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [{
        public_id: {
            type:String,
            required: true
        },
        url: {
            type:String,
            required: true
        }
    }],
    category: {
        type:String,
        required: [true, "Please enter a Product Category"]
    },
    stock: {
        type: Number,
        required: [true, "Please enter a Product Stock"],
        maxlength: [4,"Stock cannot exceed 4 character"],
        default: 1
    },
    numOfReview: {
        type:Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'user',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    createdAt: {
        type:Date,
        default: Date.now()        
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    }
});


module.exports = mongoose.model('Product', productSchema);