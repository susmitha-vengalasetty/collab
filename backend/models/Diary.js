const mongoose = require("mongoose");

const diarySchema = new mongoose.Schema(
{
user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

text:{
type:String,
required:true
},

analysis:{
type:String
},

date:{
type:String
},

day:{
type:String
}

},
{timestamps:true}
);

module.exports = mongoose.model("Diary",diarySchema);