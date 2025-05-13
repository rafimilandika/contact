

$(function(){
    $.ajaxSetup({
        headers:{
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    })

// alert('hai')
const tambah = $('.bar button')
const bg_blur = $('.bg_blur')
const modal_tambah = $('.modal_tambah')
const modal_edit = $('.modal_edit')
const tutup = $('.tutup i')
const daftarKelompok = $('#daftar-kelompok');


tambah.on('click', function(){
  // alert('ini di klik')
  bg_blur.removeAttr('id');
  modal_tambah.removeAttr('id');
  // Swal.fire('Hello World!');
})
tutup.on('click',function(){
    bg_blur.attr('id', 'hide');
modal_tambah.attr('id', 'hide');
modal_edit.attr('id', 'hide');
daftarKelompok.empty();
})

//ganti preview gambar
const uploadGambar = document.getElementById('upload-gambar');
  const previewGambar = document.getElementById('preview-gambar');

  uploadGambar.addEventListener('change', function() {
    const file = this.files[0]; // Ambil file yang dipilih

    if (file) {
      const reader = new FileReader(); // Buat objek FileReader

      reader.onload = function(e) {
        previewGambar.src = e.target.result; // Set src gambar dengan data URL
      }

      reader.readAsDataURL(file); // Baca file sebagai data URL
    } else {
      // Jika tidak ada file yang dipilih, kembalikan ke gambar default (opsional)
      previewGambar.src = "/gambar/asset/pp/user.png";
    }
  });

  //edit data--------------------------------------------------------
const edit_button = $('.edit')
const editnama = $('.editnama input')
const editnohp = $('.editnohp input')
const editemail = $('.editemail input')
const editkelompok = $('.editkelompok label')
const editgambar = $('.foto_modal_edit img')

edit_button.on('click', function(){
    bg_blur.removeAttr('id');
    modal_edit.removeAttr('id');
    const id = $(this).data('id')
    $.ajax({
        url: '/editData',
        type: 'POST',
        data:{
            id: id
            },
            success: function(data){
                console.log(data.kelompok);
                if (data) {
                    editnama.val(data.nama);
                    editnohp.val(data.nohp);
                    editemail.val(data.email);
                    $('.idEdit').val(data._id);
                    editgambar.attr('src', '/gambar/uploads/' + data.gambar);
                    $('.gambarLama').val(data.gambar);

                    data.kelompok.forEach(kelompok => {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = kelompok.id;
                    checkbox.name = 'kelompok';
                    checkbox.checked = kelompok.dimiliki; // Atur agar tercentang jika dimiliki

                    const label = document.createElement('label');
                    label.textContent = kelompok.nama;

                    const div = document.createElement('div');
                    div.append(checkbox);
                    div.append(label);
                    daftarKelompok.append(div);
                });
                  } else {
                    console.log("Data tidak ditemukan.");
                  }
            },
            error: function(chr,status, error){
                console.error("Error:", error);
                }
        })
})

const cari = $('.cari')
const area = $('.area')
cari.on('keyup',function(){
    let hasil = cari.val()
    console.log(hasil)
    $.ajax({
        url: '/cariData',
        type: 'POST',
        data:{
            hasil:hasil
            },
            success: function(data){
                area.html(data);
            },
            error: function(chr,status, error){
                console.error("Error:", error);
                }
        })
})

//notifikasi hapus
const tombolHapus = document.querySelectorAll('a[href^="/hapusData/"]');

tombolHapus.forEach(tombol => {
  tombol.addEventListener('click', function(event) {
    event.preventDefault();
    const hapusUrl = this.getAttribute('href');

    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data ini tidak akan bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = hapusUrl;
      }
    });
  });
});

const linkSimpan = document.querySelector('a[href="/tambahKelompok"]');
const namaKelompokInput = document.querySelector('.namaKelompok');

if (linkSimpan && namaKelompokInput) {
  namaKelompokInput.addEventListener('keyup', function() {
    const hasil = namaKelompokInput.value;
    console.log(hasil)
    // linkSimpan.href = `/tambahKelompok/${encodeURIComponent(hasil)}`;
  });
}
const linkSimpan2 = document.querySelector('a[href="/tambahKelompok2"]');
const namaKelompokInput2 = document.querySelector('.namaKelompok2');

if (linkSimpan2 && namaKelompokInput2) {
  namaKelompokInput2.addEventListener('keyup', function() {
    const hasil = namaKelompokInput2.value;
    // console.log(hasil)
    linkSimpan2.href = `/tambahKelompok/${encodeURIComponent(hasil)}`;
  });
}

})