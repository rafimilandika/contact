const mongoose = require('mongoose')
//membuat Modal (collection / tabel baru)
const kelompok = mongoose.model('kelompok',{
    nama: {
        type: String,
        required: true
    }
})

module.exports = kelompok