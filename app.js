
const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const multer = require('multer');
const path = require('path')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const Swal = require('sweetalert2')
const {simpanData, loadKontak, cariData, hapusData, Searchnya, updateData,loadKontakExcel
  ,loadKelompok, duplikatKelompok, simpanKelompok,cariIdTerakhir,duplikatData
  ,simpanKontakKelompok, hapusKelompok, updateKelompok
} = require('./controller/dashboardC')
const { param,body, validationResult } = require('express-validator')
const XLSX = require('xlsx');
const kelompok = require('./model/kelompok');
// const swal = require('sweetalert')

app.use(express.static('public'))    
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser('secret'));
app.use(session({
  		secret: 'secret',
  		resave: false,
  		saveUninitialized: true,
  		cookie: { secure: false } // Set ke true jika menggunakan HTTPS
	}));
app.use((req, res, next) => {
    res.locals.success = req.session.success;
    res.locals.error = req.session.error;
    delete req.session.success;
    delete req.session.error;
    next();
  });



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, 'public/gambar/uploads')); // Tentukan direktori penyimpanan
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });


  const upload = multer({ storage: storage });

    app.get('/', async (req,res)=>{
        const kontaks = await loadKontak()
        const kelompoks = await loadKelompok()
        res.render('dashboard',{
            kontaks,
            kelompoks
        }) 
})
app.post('/tambahData', upload.single('pp'),[
  body('nohp').isMobilePhone('id-ID').withMessage('harus no hp indo'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('nohp').custom(async (value, {req})=>{
          const duplikat = await duplikatData(value)
          if(duplikat)
          {
            throw new Error('nohp sudah ada')
          }
          return true //harus pakai true
        })
], async (req, res) => {
  const errors = validationResult(req);
  // console.log(errors)
  // console.log(req.body)
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        // console.log(errorMessages) // Ambil hanya pesan error
        req.session.error = errorMessages; // Simpan pesan error di session
        return res.redirect('/'); // Redirect kembali ke form
    }
    await simpanData(req)
    if(req.body.kelompok){
      const idTerakhir = await cariIdTerakhir(req.body.nohp)
      req.body.kelompok.forEach(klm => {
        simpanKontakKelompok(idTerakhir,klm)
      });
    }
    req.session.success = 'Data berhasil ditambahkan!';
    res.redirect('/')
  });

app.post('/editData',async (req, res) => {
  const userDenganKelompok = await cariData(req.body.id)
  const semuaKelompok = await loadKelompok()

  const user = userDenganKelompok[0]
  const kelompokDimiliki = userDenganKelompok.map(item => item.kelompok)
  
  const kelompokUntukForm = semuaKelompok.map(kelompok => ({
    id: kelompok.id,
    nama: kelompok.nama,
    dimiliki: kelompokDimiliki.includes(kelompok.nama), // Cek apakah kelompok dimiliki user
  }));

  const userDataForEdit = {
      _id: user._id,
      nama: user.nama,
      nohp: user.nohp,
      email: user.email,
      gambar: user.gambar,
      kelompok: kelompokUntukForm, // Daftar semua kelompok dengan status dimiliki
    };
  // console.log(user)
  res.json(userDataForEdit)
  });

  app.get('/hapusData/:id',(req, res) => {
    hapusData(req.params.id)
    hapusKelompok(req.params.id)
    res.redirect('/')
    // console.log(req.params.id)
  });

  app.post('/cariData',async (req, res) => {
    const hasilSearch = await Searchnya (req.body.hasil)
    res.render('hasilSearch',{
      hasilSearch
    })
  });

  app.post('/updateData',upload.single('pp'),[
    body('nohp').isMobilePhone('id-ID').withMessage('harus no hp indo'),
    body('email').isEmail().withMessage('Email tidak valid'),
  ],  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      console.log(errorMessages) // Ambil hanya pesan error
      req.session.error = errorMessages; // Simpan pesan error di session
      return res.redirect('/'); // Redirect kembali ke form
  }
  // console.log(req.body)
    updateData(req)
    console.log(req.body.kelompok)
    const id = req.body.id
    // console.log(req.body.kelompok.length)
    await hapusKelompok(id)
    if(req.body.kelompok === undefined){
      req.session.success = 'Data berhasil diedit!';
      return res.redirect('/')
    }else if(req.body.kelompok && typeof req.body.kelompok.length === 'number'){
    if(req.body.kelompok.length == 24){
      
      simpanKontakKelompok(id,req.body.kelompok)
    }
    else{
      req.body.kelompok.forEach(klm => {
        simpanKontakKelompok(id,klm)
      });
    }
    }
    req.session.success = 'Data berhasil diedit!';
    res.redirect('/')
  });

  app.get('/export',async(req, res) => {
    console.log('export')
    try{
      const kontak = await loadKontakExcel()
      const kontakDenganNomor = kontak.map((item, index) => ({
        No: index + 1,
        Nama: item.nama,
        'No HP': item.nohp,
        Email: item.email,
    }));
      const heading = [['No','Nama','No HP','Email']]
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(kontakDenganNomor, { header: ['No','Nama','No HP','Email'] })
      XLSX.utils.sheet_add_aoa(worksheet, heading, { origin: 'A1' })
      XLSX.utils.book_append_sheet(workbook,worksheet, 'Data Kontak')
      const buffer = XLSX.write(workbook,{bookType : 'xlsx',type: 'buffer'})

      res.attachment('data_kontak.xlsx')
      return res.send(buffer)

    }catch(error){
      console.log(error)
      res.status(500).send('Gagal mengekspor data ke Excel.');
    }
  });

  app.get('/tambahKelompok/:nama',[
  param('nama').custom(async (value, {req})=>{
          const duplikat = await duplikatKelompok(value)
          if(value !== req.params.nama && duplikat)
          {
            throw new Error('kelompok sudah ada')
          }
          return true //harus pakai true
        })
], (req, res) => {
      const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        console.log(errorMessages) // Ambil hanya pesan error
        req.session.error = errorMessages; // Simpan pesan error di session
        return res.redirect('/'); // Redirect kembali ke form
    }
    simpanKelompok({ body: { namaKelompok: req.params.nama } })
    req.session.success = 'Kelompok berhasil ditambahkan!';
    res.redirect('/')
  });








	app.listen(port, () => {
  		console.log(`Example app listening on port ${port}`)
	})
    app.set('view engine', 'ejs')


