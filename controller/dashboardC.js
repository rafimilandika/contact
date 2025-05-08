fs = require('fs').promises;
const path = require('path');

require('../koneksi/db') //koneksinya
const Kontak = require('../model/kontak')//MODEL-nya

const loadKontak = async () =>{
    const kontak = await Kontak.find()
    return kontak
}
const loadKontakExcel = async () =>{
  try {
    const kontak = await Kontak.find().lean().select('nama nohp email -_id');
    return kontak;
} catch (error) {
    console.error('Gagal memuat kontak:', error);
    throw error; // Penting untuk melempar error agar ditangani di route handler
}
}

const simpanData = async (data) => {
    const dataBaru = {
      nama: data.body.nama,
      nohp: data.body.nohp,
      email: data.body.email,
    };
  
    if (data.file && data.file.filename) { // Periksa apakah data.file ada DAN memiliki filename
      dataBaru.gambar = data.file.filename;
    } else {
      dataBaru.gambar = 'user.png';
    }
  
    Kontak.insertOne(dataBaru); // Langsung masukkan objek dataBaru
  };

const cariData = async (data) => {
    const hasil = await Kontak.find({
        _id : data
    })
    return hasil
}
const hapusData = async (data) => {
  const hasil = await Kontak.find({
    _id : data
})
let gambarnya = ''
hasil.forEach(hsl => {
  gambarnya = hsl.gambar
});
if(gambarnya !== 'user.png')
{
  const oldImagePath = path.join('public/gambar/uploads', gambarnya);
  await fs.unlink(oldImagePath);
}
const hasilnya = await Kontak.deleteOne({
    _id : data
})
    return hasilnya
}
const Searchnya = async (data) => {
    const hasil = await Kontak.find({
        nama : { $regex: data, $options: 'i' }
    })
    return hasil
}
const updateData = async (data) => {
    const updateSet = {
      nama: data.body.nama,
      nohp: data.body.nohp,
      email: data.body.email,
    };
    
    let newFilename;
    if (data.file && data.file.filename) { // Periksa apakah data.file ada DAN memiliki filename
      newFilename = data.file.filename;
      updateSet.gambar = newFilename;
    } else {
      updateSet.gambar = data.body.gambarLama;
    }
  
    try {
    const result = await Kontak.updateOne(
      { _id: data.body.id },
      { $set: updateSet }
    );

    if (newFilename && data.body.gambarLama) {
        const oldImagePath = path.join('public/gambar/uploads', data.body.gambarLama);
        // Pastikan path gambar lama tidak sama dengan path gambar baru (untuk menghindari penghapusan yang salah)
        if(data.body.gambarLama !== 'user.png')
        {   
        if (oldImagePath !== path.join('public/gambar/uploads', newFilename)) {
          try {
            await fs.unlink(oldImagePath);
            console.log(`Gambar lama ${data.body.gambarLama} berhasil dihapus.`);
          } catch (error) {
            console.error(`Gagal menghapus gambar lama ${data.body.gambarLama}:`, error);
            // Jangan melempar error di sini agar update data tetap berhasil
          }
        }
      }
      }
  
      return result; // Atau kirim respons sukses dari sini jika kamu memanggil fungsi ini dari route handler
    } catch (error) {
        console.error('Gagal mengupdate data:', error);
        throw error; // Lempar error agar ditangani di route handler
      }
  };

module.exports = {simpanData, loadKontak, cariData, hapusData, Searchnya, updateData, loadKontakExcel}