const Mahasiswa = require('./models/mahasiswa'); // Import model Mahasiswa
const Jurusan = require('./models/jurusan');   // Import model Jurusan

async function getMahasiswaWithJurusan() {
  try {
    const result = await Mahasiswa.aggregate([
      {
        $lookup: {
          from: 'jurusans', // Nama koleksi yang akan di-join (pastikan sesuai dengan nama di database)
          localField: 'jurusan', // Field di koleksi 'mahasiswa'
          foreignField: 'id',    // Field di koleksi 'jurusans'
          as: 'infoJurusan'      // Nama array baru yang berisi dokumen dari 'jurusans' yang cocok
        }
      },
      {
        $unwind: '$infoJurusan' // Deconstruct array 'infoJurusan' menjadi single document (jika hanya ada satu kecocokan)
      },
      {
        $project: {
          _id: 0,                 // Exclude field _id dari output
          id: '$id',
          nama: '$nama',
          NIM: '$NIM',
          jurusan: '$infoJurusan.nama' // Ambil nama jurusan dari dokumen yang di-join
        }
      }
    ]);
    return result;
  } catch (error) {
    console.error('Gagal mendapatkan data mahasiswa dengan jurusan:', error);
    throw error;
  }
}

// Contoh penggunaan:
getMahasiswaWithJurusan()
  .then(mahasiswas => {
    console.log(JSON.stringify(mahasiswas, null, 2));
    // Output (contoh):
    // [
    //   {
    //     "id": 1,
    //     "nama": "rafi",
    //     "NIM": "12345",
    //     "jurusan": "hukum"
    //   },
    //   {
    //     "id": 2,
    //     "nama": "budi",
    //     "NIM": "67890",
    //     "jurusan": "teknik"
    //   }
    // ]
  })
  .catch(err => console.error(err));

//  contoh manggil di app.js------------------------------------------
  app.get('/cariMataKuliah/:nama',async (req, res) => {
    const matkuls = await getMataKuliahByJurusan(req.params.nama)
    res.redirect('/hasil',[
      matkuls
    ])
  });


  //panggil di view
  // <% matkuls.forEach(matkul => { %>               
  //   <div class="item">
  //       <div class="data">
  //           <label for="nama"><%= matkul.namaMataKuliah %></label>
  //       </div>
  //   </div>
  //   <% }) %>
  