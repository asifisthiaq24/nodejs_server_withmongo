const mongoose = require('mongoose');

const MaoSchema = mongoose.Schema({
    mid : {
        type : String,
        require : true
    },
    oid : {
        type : String,
        require : true
    },
    username : {
        type : String,
        require : true
    },
    schedule : {
        type : String,
        require : true
    },
    activatedDate : {
        type : Date,
        require : true
    }
});

module.exports = mongoose.model('mao',MaoSchema);