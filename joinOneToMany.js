const Jurusan = require('./models/jurusan'); // Import model Jurusan
const MataKuliah = require('./models/mataKuliah'); // Import model MataKuliah
const JurusanMataKuliah = require('./models/jurusanMataKuliah'); // Import model penghubung

async function getMataKuliahByJurusan(namaJurusan) {
  try {
    const result = await Jurusan.aggregate([
      {
        $match: { nama: namaJurusan } // Filter berdasarkan nama jurusan yang diinginkan
      },
      {
        $lookup: {
          from: 'jurusanmatakuliahs', // Nama koleksi penghubung
          localField: 'id',
          foreignField: 'id_jurusan',
          as: 'jurusanMataKuliahInfo'
        }
      },
      {
        $unwind: '$jurusanMataKuliahInfo'
      },
      {
        $lookup: {
          from: 'matakuliahs', // Nama koleksi mata kuliah
          localField: 'jurusanMataKuliahInfo.id_mataKuliah',
          foreignField: 'id',
          as: 'mataKuliahInfo'
        }
      },
      {
        $unwind: '$mataKuliahInfo'
      },
      {
        $project: {
          _id: 0,
          namaJurusan: '$nama',
          namaMataKuliah: '$mataKuliahInfo.nama'
        }
      }
    ]);
    return result;
  } catch (error) {
    console.error('Gagal mendapatkan mata kuliah untuk jurusan:', error);
    throw error;
  }
}

// Contoh penggunaan untuk mendapatkan mata kuliah jurusan hukum:
getMataKuliahByJurusan('hukum')
  .then(mataKuliahs => {
    console.log(JSON.stringify(mataKuliahs, null, 2));
    // Output (contoh):
    // [
    //   {
    //     "namaJurusan": "hukum",
    //     "namaMataKuliah": "pidana"
    //   },
    //   {
    //     "namaJurusan": "hukum",
    //     "namaMataKuliah": "perdata"
    //   },
    //   {
    //     "namaJurusan": "hukum",
    //     "namaMataKuliah": "asasi"
    //   }
    // ]
  })
  .catch(err => console.error(err));