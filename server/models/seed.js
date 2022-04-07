const mongoose = require("mongoose");

let seedInfoSchema = new mongoose.Schema(
  {
    Products: {
       "Potato" : {},
       "Paddy" : {},
       "Wheat" : {}

    },
    OtherProducts: {
       "SugarCane" : []
    },
    
  },
  { timestamps: true }
);

const SeedInfo = mongoose.model("seedInfo", seedInfoSchema);


module.exports = SeedInfo;
