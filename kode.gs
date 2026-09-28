// ============================================================
// DASHBOARD MONITORING GTK
// DINAS PENDIDIKAN PROVINSI SUMATERA UTARA
// CABDIS I - XIV
// ============================================================

const CONFIG = {

  SPREADSHEET_ID:
    '16MtBC3nyvQaZViBv5ABNVc8U9rgVYfLi7fK6M9auiBg',

  SHEET_NAME:
    'PEMUTAKHIRAN_GURU',

  SESSION_SECONDS:
    21600,

  USERS: {

    // ==============================
    // DINAS
    // ==============================

    dinas: {
      password: '@Disdik123',
      role: 'DINAS',
      cabdis: 'SEMUA'
    },

    // ==============================
    // CABDIS I - XIV
    // ==============================

    cabdis01: {
      password: '@Disdik1212',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH I'
    },

    cabdis02: {
      password: '@Disdik022',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH II'
    },

    cabdis03: {
      password: '@Disdik003',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH III'
    },

    cabdis04: {
      password: '@Disdik024',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH IV'
    },

    cabdis05: {
      password: '@Disdik105',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH V'
    },

    cabdis06: {
      password: '@Disdik506',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH VI'
    },

    cabdis07: {
      password: '@Disdik067',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH VII'
    },

    cabdis08: {
      password: '@Disdik328',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH VIII'
    },

    cabdis09: {
      password: '@Disdik139',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH IX'
    },

    cabdis10: {
      password: '@Disdik810',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH X'
    },

    cabdis11: {
      password: '@Disdik911',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH XI'
    },

    cabdis12: {
      password: '@Disdik412',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH XII'
    },

    cabdis13: {
      password: '@Disdik013',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH XIII'
    },

    cabdis14: {
      password: '@Disdik1014',
      role: 'CABDIS',
      cabdis: 'CABANG DINAS WILAYAH XIV'
    }
  }
};

// ============================================================
// WEB APP
// ============================================================

function doGet() {

  return HtmlService
    .createTemplateFromFile('index')
    .evaluate()
    .setTitle(
      'Dashboard Monitoring GTK Sumatera Utara'
    )
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );

}


// ============================================================
// LOGIN
// ============================================================

function login(username, password) {

  username =
    String(username || '')
      .trim()
      .toLowerCase();

  password =
    String(password || '');

  const user =
    CONFIG.USERS[username];

  if (!user) {

    return {
      success: false,
      message: 'Username tidak ditemukan.'
    };

  }

  if (user.password !== password) {

    return {
      success: false,
      message: 'Password salah.'
    };

  }

  const token =
    Utilities.getUuid();

  const session = {

    username: username,

    role: user.role,

    cabdis: user.cabdis,

    loginTime:
      new Date().toISOString()

  };

  CacheService
    .getScriptCache()
    .put(
      'SESSION_' + token,
      JSON.stringify(session),
      CONFIG.SESSION_SECONDS
    );

  return {

    success: true,

    token: token,

    username: username,

    role: user.role,

    cabdis: user.cabdis

  };

}


// ============================================================
// LOGOUT
// ============================================================

function logout(token) {

  if (token) {

    CacheService
      .getScriptCache()
      .remove(
        'SESSION_' + token
      );

  }

  return true;

}


// ============================================================
// SESSION
// ============================================================

function getSession_(token) {

  if (!token) {

    throw new Error(
      'Sesi tidak ditemukan.'
    );

  }

  const raw =
    CacheService
      .getScriptCache()
      .get(
        'SESSION_' + token
      );

  if (!raw) {

    throw new Error(
      'Sesi telah berakhir. Silakan login kembali.'
    );

  }

  return JSON.parse(raw);

}


// ============================================================
// AMBIL DATA GOOGLE SHEET
// ============================================================

function getRawData_() {

  const ss =
    SpreadsheetApp.openById(
      CONFIG.SPREADSHEET_ID
    );

  const sh =
    ss.getSheetByName(
      CONFIG.SHEET_NAME
    );

  if (!sh) {

    throw new Error(
      'Sheet "' +
      CONFIG.SHEET_NAME +
      '" tidak ditemukan.'
    );

  }

  const values =
    sh.getDataRange()
      .getValues();

  if (values.length < 2) {

    return [];

  }

  const headers =
    values[0].map(function(h) {

      return String(h)
        .trim()
        .toUpperCase();

    });

  return values
    .slice(1)
    .map(function(row) {

      const obj = {};

      headers.forEach(
        function(header, i) {

          obj[header] =
            row[i];

        }
      );

      return obj;

    });

}


// ============================================================
// NORMALISASI
// ============================================================

function norm_(value) {

  return String(value || '')
    .trim()
    .toUpperCase();

}


// ============================================================
// TAHUN
// ============================================================

function getYear_(row) {

  let value =
    row['TAHUN SK PERTAMA'];

  if (value instanceof Date) {

    return String(
      value.getFullYear()
    );

  }

  value =
    String(value || '');

  const match =
    value.match(
      /\b(2024|2025|2026)\b/
    );

  return match
    ? match[1]
    : value.trim();

}


// ============================================================
// JENIS
// ============================================================

function isGuru_(value) {

  return norm_(value) === 'GURU';

}


function isTeknis_(value) {

  const v =
    norm_(value);

  return (

    v === 'TEKNIS' ||

    v === 'TENDIK' ||

    v === 'TEKNIS/TENDIK' ||

    v === 'TEKNIS / TENDIK'

  );

}


// ============================================================
// STATUS
// ============================================================

function isSudah_(value) {

  return norm_(value) === 'SUDAH';

}


function isBelum_(value) {

  const v =
    norm_(value);

  return (

    v === 'BELUM' ||

    v === 'BELUM DAPODIK' ||

    v === 'BELUM SERTIFIKASI'

  );

}


// ============================================================
// CEK FILTER
// ============================================================

function rowMatches_(row, filters) {

  const kabupaten =
    String(
      row['KABUPATEN / KOTA'] || ''
    ).trim();

  const jenjang =
    String(
      row['JENJANG'] || ''
    ).trim();

  const jenis =
    norm_(
      row['JENIS']
    );

  const dapodik =
    norm_(
      row['STATUS DAPODIK']
    );

  const sertifikasi =
    norm_(
      row['STATUS SERTIFIKASI']
    );

  const tahun =
    getYear_(row);


  // ----------------------------------------------------------
  // KABUPATEN / KOTA
  // ----------------------------------------------------------

  if (
    filters.kabupaten &&
    filters.kabupaten !== 'SEMUA' &&
    norm_(kabupaten) !==
    norm_(filters.kabupaten)
  ) {

    return false;

  }


  // ----------------------------------------------------------
  // JENJANG
  // ----------------------------------------------------------

  if (
    filters.jenjang &&
    filters.jenjang !== 'SEMUA' &&
    norm_(jenjang) !==
    norm_(filters.jenjang)
  ) {

    return false;

  }


  // ----------------------------------------------------------
  // TAHUN
  // ----------------------------------------------------------

  if (
    filters.tahun &&
    filters.tahun !== 'SEMUA' &&
    tahun !== filters.tahun
  ) {

    return false;

  }


  // ----------------------------------------------------------
  // JENIS
  // ----------------------------------------------------------

  if (
    filters.jenis &&
    filters.jenis !== 'SEMUA'
  ) {

    if (
      filters.jenis === 'GURU' &&
      !isGuru_(jenis)
    ) {

      return false;

    }

    if (
      filters.jenis === 'TEKNIS' &&
      !isTeknis_(jenis)
    ) {

      return false;

    }

  }


  // ----------------------------------------------------------
  // DAPODIK
  // ----------------------------------------------------------

  if (
    filters.dapodik &&
    filters.dapodik !== 'SEMUA'
  ) {

    if (
      filters.dapodik === 'SUDAH' &&
      !isSudah_(dapodik)
    ) {

      return false;

    }

    if (
      filters.dapodik === 'BELUM' &&
      !isBelum_(dapodik)
    ) {

      return false;

    }

  }


  // ----------------------------------------------------------
  // SERTIFIKASI
  // KHUSUS GURU
  // ----------------------------------------------------------

  if (
    isGuru_(jenis) &&
    filters.sertifikasi &&
    filters.sertifikasi !== 'SEMUA'
  ) {

    if (
      filters.sertifikasi === 'SUDAH' &&
      !isSudah_(sertifikasi)
    ) {

      return false;

    }

    if (
      filters.sertifikasi === 'BELUM' &&
      !isBelum_(sertifikasi)
    ) {

      return false;

    }

  }


  return true;

}


// ============================================================
// FILTER DATA SESUAI HAK AKSES
// ============================================================

function getAuthorizedRows_(session) {

  const rows =
    getRawData_();

  // DINAS = SEMUA DATA

  if (
    session.role === 'DINAS'
  ) {

    return rows;

  }


  // CABDIS = CABDIS SENDIRI

  return rows.filter(
    function(row) {

      return (

        norm_(
          row['CABANG DINAS']
        ) ===

        norm_(
          session.cabdis
        )

      );

    }
  );

}


// ============================================================
// HITUNG STATISTIK
// ============================================================

function calculateStats_(
  rows,
  filters
) {

  const stats = {

    total: 0,

    guru: 0,

    teknis: 0,

    guruDapodik: 0,

    guruBelumDapodik: 0,

    guruSertifikasi: 0,

    guruBelumSertifikasi: 0,

    teknisDapodik: 0,

    teknisBelumDapodik: 0,

    kabupaten: {}

  };


  rows.forEach(
    function(row) {

      if (
        !rowMatches_(
          row,
          filters
        )
      ) {

        return;

      }


      stats.total++;


      const jenis =
        norm_(
          row['JENIS']
        );

      const dapodik =
        norm_(
          row['STATUS DAPODIK']
        );

      const sertifikasi =
        norm_(
          row['STATUS SERTIFIKASI']
        );

      const kab =
        String(
          row['KABUPATEN / KOTA'] || ''
        ).trim();


      // ======================================================
      // GURU
      // ======================================================

      if (isGuru_(jenis)) {

        stats.guru++;


        if (
          isSudah_(dapodik)
        ) {

          stats.guruDapodik++;

        }


        if (
          isBelum_(dapodik)
        ) {

          stats.guruBelumDapodik++;

        }


        if (
          isSudah_(sertifikasi)
        ) {

          stats.guruSertifikasi++;

        }


        if (
          isBelum_(sertifikasi)
        ) {

          stats.guruBelumSertifikasi++;

        }

      }


      // ======================================================
      // TEKNIS / TENDIK
      // ======================================================

      if (isTeknis_(jenis)) {

        stats.teknis++;


        if (
          isSudah_(dapodik)
        ) {

          stats.teknisDapodik++;

        }


        if (
          isBelum_(dapodik)
        ) {

          stats.teknisBelumDapodik++;

        }

      }


      // ======================================================
      // REKAP KABUPATEN
      // ======================================================

      if (kab) {

        if (
          !stats.kabupaten[kab]
        ) {

          stats.kabupaten[kab] = {

            kabupaten: kab,

            total: 0,

            guru: 0,

            teknis: 0,

            guruDapodik: 0,

            guruBelumDapodik: 0,

            guruSertifikasi: 0,

            guruBelumSertifikasi: 0,

            teknisDapodik: 0,

            teknisBelumDapodik: 0

          };

        }


        const k =
          stats.kabupaten[kab];


        k.total++;


        if (isGuru_(jenis)) {

          k.guru++;


          if (
            isSudah_(dapodik)
          ) {

            k.guruDapodik++;

          }


          if (
            isBelum_(dapodik)
          ) {

            k.guruBelumDapodik++;

          }


          if (
            isSudah_(sertifikasi)
          ) {

            k.guruSertifikasi++;

          }


          if (
            isBelum_(sertifikasi)
          ) {

            k.guruBelumSertifikasi++;

          }

        }


        if (isTeknis_(jenis)) {

          k.teknis++;


          if (
            isSudah_(dapodik)
          ) {

            k.teknisDapodik++;

          }


          if (
            isBelum_(dapodik)
          ) {

            k.teknisBelumDapodik++;

          }

        }

      }

    }
  );


  return stats;

}


// ============================================================
// DASHBOARD
// ============================================================

function getDashboard(
  token,
  filters
) {

  const session =
    getSession_(token);


  const rows =
    getAuthorizedRows_(
      session
    );


  filters =
    filters || {};


  const stats =
    calculateStats_(
      rows,
      filters
    );


  // ----------------------------------------------------------
  // DAFTAR KABUPATEN
  // ----------------------------------------------------------

  const kabSet = {};

  rows.forEach(
    function(row) {

      const kab =
        String(
          row['KABUPATEN / KOTA'] || ''
        ).trim();

      if (kab) {

        kabSet[kab] = true;

      }

    }
  );


  // ----------------------------------------------------------
  // DAFTAR JENJANG
  // ----------------------------------------------------------

  const jenjangSet = {};

  rows.forEach(
    function(row) {

      const jenjang =
        String(
          row['JENJANG'] || ''
        ).trim();

      if (jenjang) {

        jenjangSet[jenjang] = true;

      }

    }
  );


  // ----------------------------------------------------------
  // REKAP CABDIS UNTUK DINAS
  // ----------------------------------------------------------

  const cabdisRekap = [];

  if (
    session.role === 'DINAS'
  ) {

    for (
      let i = 1;
      i <= 14;
      i++
    ) {

      const roman =
        [
          '',
          'I',
          'II',
          'III',
          'IV',
          'V',
          'VI',
          'VII',
          'VIII',
          'IX',
          'X',
          'XI',
          'XII',
          'XIII',
          'XIV'
        ][i];

      const cabdisName =
        'CABANG DINAS WILAYAH ' +
        roman;


      const cabRows =
        rows.filter(
          function(row) {

            return (

              norm_(
                row['CABANG DINAS']
              ) ===
              norm_(
                cabdisName
              )

            );

          }
        );


      const cabStats =
        calculateStats_(
          cabRows,
          filters
        );


      cabdisRekap.push({

        cabdis:
          cabdisName,

        total:
          cabStats.total,

        guru:
          cabStats.guru,

        teknis:
          cabStats.teknis,

        guruDapodik:
          cabStats.guruDapodik,

        guruBelumDapodik:
          cabStats.guruBelumDapodik,

        guruSertifikasi:
          cabStats.guruSertifikasi,

        guruBelumSertifikasi:
          cabStats.guruBelumSertifikasi,

        teknisDapodik:
          cabStats.teknisDapodik,

        teknisBelumDapodik:
          cabStats.teknisBelumDapodik

      });

    }

  }


  return {

    success: true,

    username:
      session.username,

    role:
      session.role,

    cabdis:
      session.cabdis,

    isDinas:
      session.role === 'DINAS',

    updateTime:
      new Date().toISOString(),

    stats:
      stats,

    cabdisRekap:
      cabdisRekap,

    kabupatenList:
      Object.keys(kabSet)
        .sort(),

    jenjangList:
      Object.keys(jenjangSet)
        .sort()

  };

}



// ============================================================
// DATA GTK CABDIS - LIHAT DATA + EDIT DATA
// ============================================================
// Hak akses:
// - DINAS  : dapat melihat seluruh data, TIDAK dapat mengedit.
// - CABDIS : hanya dapat melihat dan mengedit data CABDIS sendiri.
//
// Kolom yang dapat diedit:
// KABUPATEN / KOTA, JENJANG, SEKOLAH, NPSN,
// PENGANGKATAN, STATUS DAPODIK, STATUS SERTIFIKASI,
// JENIS, NAMA, NOMOR SK PERTAMA, TANGGAL SK PERTAMA,
// TAHUN SK PERTAMA.
//
// TIMESTAMP, CABANG DINAS dan NIK dikunci.
// ============================================================

function getGtkRecords(token, filters, search, page, pageSize) {

  const session = getSession_(token);

  filters = filters || {};
  search = String(search || '').trim().toUpperCase();

  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(100, Math.max(10, parseInt(pageSize, 10) || 50));

  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sh) {
    throw new Error('Sheet "' + CONFIG.SHEET_NAME + '" tidak ditemukan.');
  }

  const range = sh.getDataRange();
  const values = range.getValues();
  const display = range.getDisplayValues();

  if (values.length < 2) {
    return {
      success: true,
      role: session.role,
      cabdis: session.cabdis,
      page: 1,
      pageSize: pageSize,
      total: 0,
      totalPages: 0,
      records: []
    };
  }

  const headers = display[0].map(function(h) {
    return String(h || '').trim().toUpperCase().replace(/\s+/g, ' ');
  });

  const idx = {};
  headers.forEach(function(h, i) {
    idx[h] = i;
  });

  const searchFields = [
    'NAMA',
    'NIK',
    'SEKOLAH',
    'NPSN',
    'KABUPATEN / KOTA',
    'JENJANG'
  ];

  const matched = [];

  for (let r = 1; r < values.length; r++) {

    const row = values[r];
    const shown = display[r];

    // Hak akses server-side.
    if (
      session.role !== 'DINAS' &&
      norm_(shown[idx['CABANG DINAS']]) !== norm_(session.cabdis)
    ) {
      continue;
    }

    const obj = {};
    headers.forEach(function(header, c) {
      obj[header] = shown[c];
    });

    if (!rowMatches_(obj, filters)) {
      continue;
    }

    if (search) {
      let foundSearch = false;

      for (let i = 0; i < searchFields.length; i++) {
        const field = searchFields[i];
        const value = String(obj[field] == null ? '' : obj[field])
          .trim()
          .toUpperCase();

        if (value.indexOf(search) >= 0) {
          foundSearch = true;
          break;
        }
      }

      if (!foundSearch) {
        continue;
      }
    }

    matched.push({
      rowNumber: r + 1,
      TIMESTAMP: String(shown[idx['TIMESTAMP']] || ''),
      'CABANG DINAS': String(shown[idx['CABANG DINAS']] || ''),
      'KABUPATEN / KOTA': String(shown[idx['KABUPATEN / KOTA']] || ''),
      'JENJANG': String(shown[idx['JENJANG']] || ''),
      'SEKOLAH': String(shown[idx['SEKOLAH']] || ''),
      'NPSN': String(shown[idx['NPSN']] || ''),
      'PENGANGKATAN': String(shown[idx['PENGANGKATAN']] || ''),
      'STATUS DAPODIK': String(shown[idx['STATUS DAPODIK']] || ''),
      'STATUS SERTIFIKASI': String(shown[idx['STATUS SERTIFIKASI']] || ''),
      'JENIS': String(shown[idx['JENIS']] || ''),
      'NAMA': String(shown[idx['NAMA']] || ''),
      'NIK': String(shown[idx['NIK']] || ''),
      'NOMOR SK PERTAMA': String(shown[idx['NOMOR SK PERTAMA']] || ''),
      'TANGGAL SK PERTAMA': String(shown[idx['TANGGAL SK PERTAMA']] || ''),
      'TAHUN SK PERTAMA': String(shown[idx['TAHUN SK PERTAMA']] || '')
    });
  }

  const total = matched.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  const start = (page - 1) * pageSize;
  const records = matched.slice(start, start + pageSize);

  return {
    success: true,
    role: session.role,
    cabdis: session.cabdis,
    page: page,
    pageSize: pageSize,
    total: total,
    totalPages: totalPages,
    records: records,
    updateTime: new Date().toISOString()
  };
}


// ============================================================
// EDIT DATA GTK - CABDIS SAJA
// ============================================================
function updateGtkRecord(token, rowNumber, data) {

  const session = getSession_(token);

  if (session.role !== 'CABDIS') {
    throw new Error('Akun DINAS hanya dapat melihat data. Edit dilakukan oleh akun Cabang Dinas.');
  }

  rowNumber = parseInt(rowNumber, 10);

  if (!rowNumber || rowNumber < 2) {
    throw new Error('Baris data tidak valid.');
  }

  data = data || {};

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sh = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (!sh) {
      throw new Error('Sheet "' + CONFIG.SHEET_NAME + '" tidak ditemukan.');
    }

    if (rowNumber > sh.getLastRow()) {
      throw new Error('Baris data tidak ditemukan.');
    }

    const lastCol = sh.getLastColumn();
    const headers = sh.getRange(1, 1, 1, lastCol)
      .getDisplayValues()[0]
      .map(function(h) {
        return String(h || '').trim().toUpperCase().replace(/\s+/g, ' ');
      });

    const currentDisplay = sh.getRange(rowNumber, 1, 1, lastCol)
      .getDisplayValues()[0];

    const col = {};
    headers.forEach(function(h, i) {
      col[h] = i + 1;
    });

    const currentCabdis = String(
      currentDisplay[(col['CABANG DINAS'] || 1) - 1] || ''
    ).trim();

    // PENGAMAN UTAMA:
    // CABDIS tidak boleh mengedit data milik CABDIS lain.
    if (norm_(currentCabdis) !== norm_(session.cabdis)) {
      throw new Error('Akses ditolak. Data tersebut bukan milik Cabang Dinas Anda.');
    }

    const editable = {
      'KABUPATEN / KOTA': true,
      'JENJANG': true,
      'SEKOLAH': true,
      'NPSN': true,
      'PENGANGKATAN': true,
      'STATUS DAPODIK': true,
      'STATUS SERTIFIKASI': true,
      'JENIS': true,
      'NAMA': true,
      'NOMOR SK PERTAMA': true,
      'TANGGAL SK PERTAMA': true,
      'TAHUN SK PERTAMA': true
    };

    const updatedFields = [];

    Object.keys(editable).forEach(function(field) {

      if (!Object.prototype.hasOwnProperty.call(data, field)) {
        return;
      }

      if (!col[field]) {
        return;
      }

      let value = data[field];

      if (value === null || value === undefined) {
        value = '';
      }

      value = String(value).trim();

      // Validasi NPSN jika diisi.
      if (field === 'NPSN' && value && !/^\d{8}$/.test(value.replace(/\D/g, ''))) {
        throw new Error('NPSN harus 8 digit angka.');
      }

      if (field === 'NPSN') {
        value = value.replace(/\D/g, '');
      }

      // Tanggal dari input HTML: YYYY-MM-DD.
      if (field === 'TANGGAL SK PERTAMA') {
        if (value) {
          const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

          if (m) {
            value = new Date(
              Number(m[1]),
              Number(m[2]) - 1,
              Number(m[3])
            );
          } else {
            const d = parseDisplayDate_(value);
            if (!d) {
              throw new Error('Tanggal SK PERTAMA tidak valid.');
            }
            value = d;
          }
        }
      }

      sh.getRange(rowNumber, col[field]).setValue(value);

      if (field === 'TANGGAL SK PERTAMA' && value instanceof Date) {
        sh.getRange(rowNumber, col[field]).setNumberFormat('dd/MM/yyyy');
      }

      updatedFields.push(field);
    });

    // NIK, CABANG DINAS, TIMESTAMP sengaja tidak masuk editable.
    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Data berhasil diperbarui ke Spreadsheet.',
      rowNumber: rowNumber,
      updatedFields: updatedFields,
      updateTime: new Date().toISOString()
    };

  } finally {
    lock.releaseLock();
  }
}


// ============================================================
// PARSE TANGGAL DD/MM/YYYY ATAU DD-MM-YYYY
// ============================================================
function parseDisplayDate_(value) {
  const s = String(value || '').trim();
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);

  if (!m) {
    return null;
  }

  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);

  const d = new Date(year, month - 1, day);

  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }

  return d;
}


// Kompatibilitas versi lama
// ============================================================
// DOWNLOAD EXCEL CABDIS - CEPAT
// ============================================================
// Tidak membuat Spreadsheet sementara dan tidak memanggil
// endpoint export Google Sheets. XLSX dibuat langsung di memory.
// ============================================================
function downloadExcel(token, filters) {

  const session = getSession_(token);

  if (session.role === 'DINAS') {
    throw new Error('Download Excel hanya tersedia untuk akun Cabang Dinas.');
  }

  const rows = getAuthorizedRows_(session);
  filters = filters || {};

  const filtered = rows.filter(function(row) {
    return rowMatches_(row, filters);
  });

  if (filtered.length === 0) {
    throw new Error('Tidak ada data sesuai filter.');
  }

  const headers = [
    'TIMESTAMP',
    'CABANG DINAS',
    'KABUPATEN / KOTA',
    'JENJANG',
    'SEKOLAH',
    'NPSN',
    'PENGANGKATAN',
    'STATUS DAPODIK',
    'STATUS SERTIFIKASI',
    'JENIS',
    'NAMA',
    'NIK',
    'NOMOR SK PERTAMA',
    'TANGGAL SK PERTAMA',
    'TAHUN SK PERTAMA'
  ];

  const data = [headers];

  filtered.forEach(function(row) {
    data.push(headers.map(function(header) {
      let value = row[header];
      if (value instanceof Date) {
        return Utilities.formatDate(
          value,
          Session.getScriptTimeZone(),
          'yyyy-MM-dd'
        );
      }
      return value == null ? '' : value;
    }));
  });

  const year =
    filters.tahun && filters.tahun !== 'SEMUA'
      ? filters.tahun
      : 'SEMUA';

  const safeName = String(session.cabdis || 'CABDIS')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const fileName =
    'REKAP_' + safeName + '_' + year + '_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    ) + '.xlsx';

  const xlsx = makeXlsxBlob_(data, fileName);

  return {
    success: true,
    filename: fileName,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    data: Utilities.base64Encode(xlsx.getBytes()),
    jumlahData: filtered.length
  };
}

// ============================================================
// PEMBUAT XLSX LANGSUNG DI MEMORY
// ============================================================
function xmlEscape_(value) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function excelColumnName_(number) {
  let name = '';
  while (number > 0) {
    const rem = (number - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    number = Math.floor((number - 1) / 26);
  }
  return name;
}

function makeXlsxBlob_(data, fileName) {
  const headers = data[0] || [];
  const lastCol = excelColumnName_(headers.length);
  const lastRow = data.length;

  const sheetRows = data.map(function(row, r) {
    return '<row r="' + (r + 1) + '">' +
      row.map(function(value, c) {
        const ref = excelColumnName_(c + 1) + (r + 1);
        const style = r === 0 ? '1' : '0';
        return '<c r="' + ref + '" s="' + style + '" t="inlineStr"><is><t xml:space="preserve">' +
          xmlEscape_(value) +
          '</t></is></c>';
      }).join('') +
      '</row>';
  }).join('');

  const sheetXml =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<dimension ref="A1:' + lastCol + lastRow + '"/>' +
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    '<sheetData>' + sheetRows + '</sheetData>' +
    '<autoFilter ref="A1:' + lastCol + lastRow + '"/>' +
    '</worksheet>';

  const workbookXml =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets></workbook>';

  const workbookRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>';

  const xlRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '</Relationships>';

  const rootRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>';

  const stylesXml =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<fonts count="2"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts>' +
    '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0B3B82"/><bgColor indexed="64"/></patternFill></fill></fills>' +
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="1" fillId="1" borderId="0" applyFont="1" applyFill="1"/></cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    '</styleSheet>';

  const contentTypes =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    '</Types>';

  return Utilities.zip([
    Utilities.newBlob(contentTypes, 'application/xml', '[Content_Types].xml'),
    Utilities.newBlob(rootRels, 'application/xml', '_rels/.rels'),
    Utilities.newBlob(workbookXml, 'application/xml', 'xl/workbook.xml'),
    Utilities.newBlob(xlRels, 'application/xml', 'xl/_rels/workbook.xml.rels'),
    Utilities.newBlob(sheetXml, 'application/xml', 'xl/worksheets/sheet1.xml'),
    Utilities.newBlob(stylesXml, 'application/xml', 'xl/styles.xml')
  ], fileName);
}

// ============================================================
// TEST DATABASE
// ============================================================

function testDatabase() {

  const rows =
    getRawData_();

  return {

    success: true,

    jumlahData:
      rows.length,

    sheet:
      CONFIG.SHEET_NAME

  };

}


// ============================================================
// AKSES SEKOLAH TANPA LOGIN - BERDASARKAN NPSN
// ============================================================
// FUNGSI TAMBAHAN.
// TIDAK MENGUBAH LOGIN DINAS/CABDIS.
// SEKOLAH HANYA MENERIMA REKAP UNTUK NPSN YANG DICARI.
// ============================================================

function normalizeNPSN_(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '');
}


// ============================================================
// CARI DATA SEKOLAH BERDASARKAN NPSN
// ============================================================

function getSchoolByNPSN(npsn) {

  npsn = normalizeNPSN_(npsn);

  if (!npsn) {
    return {
      success: false,
      message: 'Silakan masukkan NPSN sekolah.'
    };
  }

  if (!/^\d{8}$/.test(npsn)) {
    return {
      success: false,
      message: 'NPSN harus terdiri dari 8 digit angka.'
    };
  }

  // HANYA mencari pada kolom NPSN.
  // Tidak lagi membaca seluruh database 59 ribu+ baris.
  const schoolRows = getSchoolRowsByNPSN_(npsn);

  if (schoolRows.length === 0) {
    return {
      success: false,
      message: 'NPSN ' + npsn + ' tidak ditemukan dalam data.'
    };
  }

  const first = schoolRows[0];

  const school = {
    npsn: npsn,
    sekolah: String(first['SEKOLAH'] || '').trim(),
    kabupaten: String(first['KABUPATEN / KOTA'] || '').trim(),
    cabdis: String(first['CABANG DINAS'] || '').trim(),
    jenjang: String(first['JENJANG'] || '').trim()
  };

  const makeYearFilter = function(year) {
    return {
      kabupaten: 'SEMUA',
      jenjang: 'SEMUA',
      tahun: year,
      jenis: 'SEMUA',
      dapodik: 'SEMUA',
      sertifikasi: 'SEMUA'
    };
  };

  return {
    success: true,
    school: school,
    stats: {
      all: calculateStats_(schoolRows, {
        kabupaten: 'SEMUA',
        jenjang: 'SEMUA',
        tahun: 'SEMUA',
        jenis: 'SEMUA',
        dapodik: 'SEMUA',
        sertifikasi: 'SEMUA'
      }),
      tahun2020: calculateStats_(schoolRows, makeYearFilter('2020')),
      tahun2021: calculateStats_(schoolRows, makeYearFilter('2021')),
      tahun2022: calculateStats_(schoolRows, makeYearFilter('2022')),
      tahun2023: calculateStats_(schoolRows, makeYearFilter('2023')),
      tahun2024: calculateStats_(schoolRows, makeYearFilter('2024')),
      tahun2025: calculateStats_(schoolRows, makeYearFilter('2025')),
      tahun2026: calculateStats_(schoolRows, makeYearFilter('2026'))
    },
    updateTime: new Date().toISOString()
  };
}



// ============================================================
// HELPER: AMBIL BARIS SEKOLAH BERDASARKAN NPSN
// ============================================================
// Sangat penting untuk performa.
// Hanya kolom NPSN yang dicari, kemudian hanya baris yang cocok
// yang dibaca lengkap.
// ============================================================
function getSchoolRowsByNPSN_(npsn) {

  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sh) {
    throw new Error('Sheet "' + CONFIG.SHEET_NAME + '" tidak ditemukan.');
  }

  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();

  if (lastRow < 2 || lastCol < 1) {
    return [];
  }

  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0]
    .map(function(h) {
      return String(h || '').trim().toUpperCase().replace(/\s+/g, ' ');
    });

  const npsnCol = headers.indexOf('NPSN');

  if (npsnCol < 0) {
    throw new Error('Kolom NPSN tidak ditemukan.');
  }

  const finder = sh
    .getRange(2, npsnCol + 1, lastRow - 1, 1)
    .createTextFinder(npsn)
    .matchEntireCell(true)
    .useRegularExpression(false);

  const found = finder.findAll();

  if (!found || found.length === 0) {
    return [];
  }

  const result = [];

  found.forEach(function(cell) {

    const rowNumber = cell.getRow();

    const row = sh
      .getRange(rowNumber, 1, 1, lastCol)
      .getValues()[0];

    const obj = {};

    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });

    // Pengaman tambahan agar hasil benar-benar NPSN yang diminta.
    if (normalizeNPSN_(obj['NPSN']) === npsn) {
      result.push(obj);
    }
  });

  return result;
}



// ============================================================
// DOWNLOAD EXCEL SEKOLAH - TANPA LOGIN, BERDASARKAN NPSN
// ============================================================
// Hanya data dengan NPSN yang dimasukkan yang diekspor.
// NIK TIDAK DISERTAKAN pada download publik sekolah.
// ============================================================
// ============================================================
// DOWNLOAD EXCEL SEKOLAH - CEPAT, TANPA MEMBUAT SPREADSHEET
// ============================================================
// Membuat XLSX langsung di memory menggunakan OOXML.
// Tidak membuat Spreadsheet sementara dan tidak memanggil
// endpoint export Google Sheets, sehingga proses jauh lebih cepat.
// NIK tetap tidak disertakan pada akses publik sekolah.
// ============================================================
function downloadSchoolExcelByNPSN(npsn) {

  npsn = normalizeNPSN_(npsn);

  if (!/^\d{8}$/.test(npsn)) {
    throw new Error('NPSN harus terdiri dari 8 digit angka.');
  }

  // HANYA mengambil baris sekolah yang diminta.
  // Tidak membaca seluruh 59 ribu+ baris.
  const matched = getSchoolRowsByNPSN_(npsn);

  if (matched.length === 0) {
    throw new Error('NPSN ' + npsn + ' tidak ditemukan dalam data.');
  }

  const publicHeaders = [
    'TIMESTAMP',
    'CABANG DINAS',
    'KABUPATEN / KOTA',
    'JENJANG',
    'SEKOLAH',
    'NPSN',
    'PENGANGKATAN',
    'STATUS DAPODIK',
    'STATUS SERTIFIKASI',
    'JENIS',
    'NAMA',
    'NOMOR SK PERTAMA',
    'TANGGAL SK PERTAMA',
    'TAHUN SK PERTAMA'
  ];

  const data = [publicHeaders];

  matched.forEach(function(row) {

    data.push(publicHeaders.map(function(header) {

      let value = row[header];

      if (value instanceof Date) {
        return Utilities.formatDate(
          value,
          Session.getScriptTimeZone(),
          'yyyy-MM-dd'
        );
      }

      return value === null || value === undefined ? '' : String(value);
    }));

  });

  const schoolName = String(
    matched[0]['SEKOLAH'] || 'SEKOLAH'
  ).trim();

  const safe = schoolName
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'SEKOLAH';

  const fileName =
    'DATA_SEKOLAH_' + safe + '_' + npsn + '.xlsx';

  const xlsx = makeXlsxBlob_(data, fileName);

  return {
    success: true,
    filename: fileName,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    data: Utilities.base64Encode(xlsx.getBytes()),
    jumlahData: matched.length
  };
}

function checkNPSN(npsn) {

  npsn = normalizeNPSN_(npsn);

  if (!/^\d{8}$/.test(npsn)) {
    return {
      success: false,
      message: 'NPSN harus 8 digit angka.'
    };
  }

  const rows = getRawData_();

  const found = rows.find(function(row) {
    return normalizeNPSN_(row['NPSN']) === npsn;
  });

  if (!found) {
    return {
      success: false,
      message: 'NPSN tidak ditemukan.'
    };
  }

  return {
    success: true,

    npsn: npsn,

    sekolah:
      String(found['SEKOLAH'] || '').trim(),

    kabupaten:
      String(found['KABUPATEN / KOTA'] || '').trim(),

    cabdis:
      String(found['CABANG DINAS'] || '').trim(),

    jenjang:
      String(found['JENJANG'] || '').trim()
  };
}

// ============================================================
// AKSES PUBLIK - CARI DATA BERDASARKAN NIK
// ============================================================
// HASIL PENCARIAN:
// - NAMA
// - SEKOLAH
// - NPSN
// - NOMOR SK PERTAMA
// - TANGGAL SK PERTAMA
//
// NIK hanya digunakan untuk pencarian.
// NIK TIDAK ditampilkan kembali.
// ============================================================

function normalizeNIK_(value) {
  return String(value == null ? '' : value)
    .trim()
    .replace(/\D/g, '');
}


// ============================================================
// CARI DATA HONORER BERDASARKAN NIK
// ============================================================

function getHonorDataByNIK(nik) {

  try {

    nik = normalizeNIK_(nik);

    if (!nik) {
      return {
        success: false,
        message: 'Silakan masukkan NIK.'
      };
    }

    if (!/^\d{16}$/.test(nik)) {
      return {
        success: false,
        message: 'NIK harus terdiri dari 16 digit angka.'
      };
    }

    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sh = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (!sh) {
      throw new Error(
        'Sheet "' + CONFIG.SHEET_NAME + '" tidak ditemukan.'
      );
    }

    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();

    if (lastRow < 2 || lastCol < 1) {
      return {
        success: false,
        message: 'Data pemutakhiran belum tersedia.'
      };
    }

    // Header
    const headers = sh
      .getRange(1, 1, 1, lastCol)
      .getDisplayValues()[0]
      .map(function(h) {
        return String(h || '')
          .trim()
          .toUpperCase()
          .replace(/\s+/g, ' ');
      });

    function findCol_(names) {
      for (let i = 0; i < names.length; i++) {
        const idx = headers.indexOf(names[i]);
        if (idx >= 0) return idx;
      }
      return -1;
    }

    const nikCol = findCol_([
      'NIK'
    ]);

    const namaCol = findCol_([
      'NAMA',
      'NAMA GURU',
      'NAMA GTK'
    ]);

    const sekolahCol = findCol_([
      'SEKOLAH',
      'NAMA SEKOLAH'
    ]);

    const npsnCol = findCol_([
      'NPSN'
    ]);

    const nomorSkCol = findCol_([
      'NOMOR SK PERTAMA',
      'NO SK PERTAMA',
      'NOMOR SK',
      'NO SK'
    ]);

    const tanggalSkCol = findCol_([
      'TANGGAL SK PERTAMA',
      'TGL SK PERTAMA',
      'TANGGAL SK PENGANGKATAN',
      'TGL SK PENGANGKATAN',
      'TANGGAL SK',
      'TGL SK',
      'TANGGAL PENGANGKATAN',
      'TGL PENGANGKATAN'
    ]);

    if (nikCol < 0) {
      throw new Error('Kolom NIK tidak ditemukan.');
    }

    if (namaCol < 0) {
      throw new Error('Kolom NAMA tidak ditemukan.');
    }

    if (sekolahCol < 0) {
      throw new Error('Kolom SEKOLAH tidak ditemukan.');
    }

    if (npsnCol < 0) {
      throw new Error('Kolom NPSN tidak ditemukan.');
    }

    if (nomorSkCol < 0) {
      throw new Error('Kolom NOMOR SK PERTAMA tidak ditemukan.');
    }

    if (tanggalSkCol < 0) {
      throw new Error('Kolom TANGGAL SK PERTAMA tidak ditemukan.');
    }

    // Gunakan DISPLAY VALUES untuk NIK agar 16 digit tetap terbaca
    // sebagai teks dan tidak kehilangan angka 0 di depan.
    const nikValues = sh
      .getRange(2, nikCol + 1, lastRow - 1, 1)
      .getDisplayValues()
      .flat();

    let foundRow = -1;

    for (let i = 0; i < nikValues.length; i++) {
      const existingNik = normalizeNIK_(nikValues[i]);

      if (existingNik === nik) {
        foundRow = i + 2;
        break;
      }
    }

    if (foundRow < 0) {
      return {
        success: false,
        message:
          'NIK belum ditemukan dalam Sistem Pemutakhiran Honorer.'
      };
    }

    // Ambil display values agar nomor SK/NPSN/tanggal tidak berubah format.
    const row = sh
      .getRange(foundRow, 1, 1, lastCol)
      .getDisplayValues()[0];

    let tanggalSk = String(
      row[tanggalSkCol] || ''
    ).trim();

    // Jika format tanggal masih YYYY-MM-DD, ubah ke DD/MM/YYYY.
    const iso = tanggalSk.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (iso) {
      tanggalSk =
        iso[3] + '/' +
        iso[2] + '/' +
        iso[1];
    }

    return {
      success: true,

      statusMessage:
        'ANDA SUDAH MENGISI DATA PEMUTAKHIRAN HONORER',

      nama:
        String(row[namaCol] || '').trim(),

      sekolah:
        String(row[sekolahCol] || '').trim(),

      npsn:
        String(row[npsnCol] || '').trim(),

      nomorSk:
        String(row[nomorSkCol] || '').trim(),

      tanggalSk:
        tanggalSk || '-'
    };

  } catch (error) {

    return {
      success: false,
      message:
        'Gagal memeriksa data: ' +
        error.message
    };

  }

}
