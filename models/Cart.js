const {Schema, model, } = require("mongoose")

const Tovar = new Schema({
    imageSrc: {type: String, required: true},
    imageAlt: {type: String},
    id: {type: String, required: true},
    sale: {type: Boolean, required: true},
    rating: {type: Number, default:0, required: false},
    name: {type: String, required:false},
    brand: {type:String, required: true},
    title: {type: String, required: true}, 
    price: {type: Number, required: true}, 
    gender: {type: String, required: false}, 
    reviews: {type:Array, required: false},
    description: {type: String, required: true}
})

module.exports = model("Tovar", Tovar);