const mongoose = require('mongoose');

const MachineSchema = mongoose.Schema({
    name : {
        type : String,
        require : true
    },
    assigned : {
        type : String,
        require : true
    }
});

module.exports = mongoose.model('machines',MachineSchema);