
const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const multer = require('multer');
const path = require('path')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const Swal = require('sweetalert2')
const {simpanData, loadKontak, cariData, hapusData, Searchnya, updateData,loadKontakExcel} = require('./controller/dashboardC')
const { body, validationResult } = require('express-validator')
const XLSX = require('xlsx');
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
        res.render('dashboard',{
            kontaks
        }) 
})
app.post('/tambahData', upload.single('pp'),[
  body('nohp').isMobilePhone('id-ID').withMessage('harus no hp indo'),
  body('email').isEmail().withMessage('Email tidak valid'),
], (req, res) => {
  const errors = validationResult(req);
  // console.log(errors)
  // console.log(req.body)
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        console.log(errorMessages) // Ambil hanya pesan error
        req.session.error = errorMessages; // Simpan pesan error di session
        return res.redirect('/'); // Redirect kembali ke form
    }
    simpanData(req)
    req.session.success = 'Data berhasil ditambahkan!';
    res.redirect('/')
  });

app.post('/editData',async (req, res) => {
  const hasil = await cariData(req.body.id)
  // console.log(hasil)
  res.json(hasil)
  });

  app.get('/hapusData/:id',(req, res) => {
    hapusData(req.params.id)
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
  ],  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      console.log(errorMessages) // Ambil hanya pesan error
      req.session.error = errorMessages; // Simpan pesan error di session
      return res.redirect('/'); // Redirect kembali ke form
  }
    updateData(req)
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








	app.listen(port, () => {
  		console.log(`Example app listening on port ${port}`)
	})
    app.set('view engine', 'ejs')


