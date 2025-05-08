const mongoose = require('mongoose')
//membuat Modal (collection / tabel baru)
const kontak = mongoose.model('kontak',{
    nama: {
        type: String,
        required: true
    },
    nohp: {
        type: String,
        required: true
    },
    email:{
        type: String
    },
    gambar:{
        type: String
    }
})

module.exports = kontak