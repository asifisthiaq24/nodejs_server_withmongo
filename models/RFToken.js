const mongoose = require('mongoose');

const RFTokenSchema = mongoose.Schema({
    refreshToken : {
        type : String,
        require : true
    }
});

module.exports = mongoose.model('rftokens',RFTokenSchema);