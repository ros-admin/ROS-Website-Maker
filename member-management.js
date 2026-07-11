/**
 * ==========================================
 * ROS Admin Dashboard - Member Management Module
 * ==========================================
 */

let currentFilteredList = [];
let activePopupUser = null;

// মেম্বার ম্যানেজমেন্টের লেআউট ডিজাইন ইনজেকশন
function initMemberManagementHTML() {
  const container = document.getElementById('member_management-section');
  if (!container) return;

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-users text-[#00b4d8]"></i> Member Management
        </h2>
        <p class="text-xs text-slate-400 mt-1">মেম্বার তথ্য খোঁজা, মাল্টি-ফিল্টারিং এবং কাস্টম রিপোর্ট এক্সপোর্ট করার প্যানেল</p>
      </div>
    </div>

    <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div class="flex flex-col md:flex-row gap-3 items-center">
        <div class="relative flex-1 w-full">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-500 text-xs"></i>
          <input type="text" id="memberSearchInput" oninput="filterAndRenderMembersTable()" class="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00b4d8]" placeholder="নাম (ইংরেজি), মোবাইল নাম্বার, ইমেইল বা রেজিস্ট্রেশন নাম্বার লিখে সার্চ দিন...">
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <button onclick="exportToExcel()" class="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center">
            <i class="fa-solid fa-file-excel"></i> Excel ডাউনলোড
          </button>
          <button onclick="exportToPDF()" class="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center">
            <i class="fa-solid fa-file-pdf"></i> PDF ডাউনলোড
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">স্ট্যাটাস ফিল্টার</label>
          <select id="filterStatus" onchange="filterAndRenderMembersTable()" class="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-[#00b4d8] cursor-pointer">
            <option value="all">সব স্ট্যাটাস</option>
            <option value="pending">Pending</option>
            <option value="active">Approved (Active)</option>
            <option value="inactive">Inactive</option>
            <option value="suspend">Suspend</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">রক্তের গ্রুপ ফিল্টার</label>
          <select id="filterBlood" onchange="filterAndRenderMembersTable()" class="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-[#00b4d8] cursor-pointer">
            <option value="all">সব গ্রুপ</option>
            <option value="A+">A+</option><option value="A-">A-</option>
            <option value="B+">B+</option><option value="B-">B-</option>
            <option value="O+">O+</option><option value="O-">O-</option>
            <option value="AB+">AB+</option><option value="AB-">AB-</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender ফিল্টার</label>
          <select id="filterGender" onchange="filterAndRenderMembersTable()" class="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-[#00b4d8] cursor-pointer">
            <option value="all">সব জেন্ডার</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">রেজিস্ট্রেশনের তারিখ</label>
          <select id="filterDate" onchange="filterAndRenderMembersTable()" class="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-[#00b4d8] cursor-pointer">
            <option value="all">সব তারিখ</option>
          </select>
        </div>
      </div>
      <div class="text-right text-[11px] text-slate-400">
        ফিল্টারড মেম্বার সংখ্যা: <span id="filtered-count" class="text-[#00b4d8] font-bold">0</span> জন
      </div>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <th class="py-4 px-4 text-center w-12">সিরিয়াল নাম্বার</th>
              <th class="py-4 px-4">রেজিস্ট্রেশন নাম্বার</th>
              <th class="py-4 px-4">নাম (English)</th>
              <th class="py-4 px-4">মোবাইল নাম্বার</th>
              <th class="py-4 px-4">ইমেইল এড্রেস</th>
              <th class="py-4 px-4 text-center">রক্তের গ্রুপ</th>
              <th class="py-4 px-4">রেজিস্ট্রেশনের তারিখ</th>
              <th class="py-4 px-4">স্ট্যাটাস</th>
              <th class="py-4 px-4 text-center">স্ট্যাটাস পরিবর্তন অপশন</th>
              <th class="py-4 px-4 text-center w-16">বিস্তারিত</th>
            </tr>
          </thead>
          <tbody id="memberTableBody" class="divide-y divide-slate-800/60 text-xs text-slate-300"></tbody>
        </table>
      </div>
      <div id="noMemberFallback" class="hidden py-12 text-center text-slate-500 text-xs">
        <i class="fa-regular fa-folder-open text-3xl mb-3 block text-slate-600"></i>
        কোনো মেম্বার ডাটা খুঁজে পাওয়া যায়নি!
      </div>
    </div>
  `;
}

// শিটের ডাটা থেকে তারিখ নিয়ে ড্রপডাউন জেনারেট
function setupRegistrationDateFilter(users) {
  const dateSelect = document.getElementById('filterDate');
  if (!dateSelect) return;

  const uniqueDates = [];
  users.forEach(user => {
    // row[22] = Created at
    const dateVal = user[22] || user.registrationDate;
    if (dateVal) {
      const datePart = String(dateVal).split(' ')[0];
      if (!uniqueDates.includes(datePart)) uniqueDates.push(datePart);
    }
  });

  uniqueDates.sort((a, b) => new Date(b) - new Date(a));
  dateSelect.innerHTML = '<option value="all">সব তারিখ</option>';
  uniqueDates.forEach(date => {
    const reversedDate = date.split('-').reverse().join('/');
    const option = document.createElement('option');
    option.value = date;
    option.innerText = reversedDate;
    dateSelect.appendChild(option);
  });
}

// মাল্টি-ফিল্টার ও অটো সিরিয়াল মেকানিজমসহ রেন্ডার
function filterAndRenderMembersTable() {
  const searchQuery = document.getElementById('memberSearchInput')?.value.toLowerCase().trim() || '';
  const statusFilter = document.getElementById('filterStatus')?.value.toLowerCase() || 'all';
  const bloodFilter = document.getElementById('filterBlood')?.value || 'all';
  const genderFilter = document.getElementById('filterGender')?.value || 'all';
  const dateFilter = document.getElementById('filterDate')?.value || 'all';

  const tbody = document.getElementById('memberTableBody');
  const fallback = document.getElementById('noMemberFallback');
  if (!tbody || !fallback) return;

  tbody.innerHTML = '';

  const dataToFilter = allUsersData && allUsersData.length > 0 ? allUsersData : (window.allUsersData || []);

  currentFilteredList = dataToFilter.filter(row => {
    if (!row) return false;

    // কলাম ইনডেক্স ম্যাপিং
    const id = String(row[0] || '').toLowerCase();
    const nameEng = String(row[2] || '').toLowerCase();
    const mobile = String(row[5] || '').toLowerCase();
    const email = String(row[6] || '').toLowerCase();
    const blood = String(row[7] || 'all').trim();
    const gender = String(row[8] || 'all').trim();
    const currentStatus = String(row[20] || 'pending').toLowerCase().trim();
    const createdAt = String(row[22] || '');

    const searchMatch = !searchQuery || 
                        nameEng.includes(searchQuery) || 
                        id.includes(searchQuery) || 
                        email.includes(searchQuery) || 
                        mobile.includes(searchQuery);

    let statusMatch = (statusFilter === 'all');
    if (!statusMatch) {
      if (statusFilter === 'active' || statusFilter === 'approved') {
        statusMatch = (currentStatus === 'active' || currentStatus === 'approved');
      } else {
        statusMatch = (currentStatus === statusFilter);
      }
    }

    const bloodMatch = (bloodFilter === 'all') || (blood === bloodFilter);
    const genderMatch = (genderFilter === 'all') || (gender === genderFilter);
    const userDatePart = createdAt ? createdAt.split(' ')[0] : '';
    const dateMatch = (dateFilter === 'all') || (userDatePart === dateFilter);

    return searchMatch && statusMatch && bloodMatch && genderMatch && dateMatch;
  });

  const countEl = document.getElementById('filtered-count');
  if (countEl) countEl.innerText = currentFilteredList.length;

  if (currentFilteredList.length === 0) {
    fallback.classList.remove('hidden');
    return;
  }
  fallback.classList.add('hidden');

  currentFilteredList.forEach((row, index) => {
    const tableRow = document.createElement('tr');
    tableRow.className = "hover:bg-slate-800/30 transition-colors border-b border-slate-800/60 font-medium";

    const mId = row[0] || 'N/A';
    const mName = row[2] || row[1] || 'Unknown'; // ইংলিশ না থাকলে বাংলা নাম ব্যাকআপ
    const mMobile = row[5] || 'N/A';
    const mEmail = row[6] || 'N/A';
    const mBlood = row[7] || 'N/A';
    const mStatus = String(row[20] || 'pending').toLowerCase().trim();
    const mCreatedAt = row[22] || 'N/A';

    let statusBadge = '';
    if (mStatus === 'pending') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>`;
    } else if (mStatus === 'approved' || mStatus === 'active') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Approved</span>`;
    } else if (mStatus === 'inactive') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/30 text-slate-400 border border-slate-700/50">Inactive</span>`;
    } else if (mStatus === 'suspend') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Suspended</span>`;
    }

    const formattedRegDate = mCreatedAt !== 'N/A' ? mCreatedAt.split(' ')[0].split('-').reverse().join('/') : 'N/A';

    tableRow.innerHTML = `
      <td class="py-3 px-4 text-center font-bold text-slate-400">${index + 1}</td>
      <td class="py-3 px-4 font-mono font-bold text-[#00b4d8]">${mId}</td>
      <td class="py-3 px-4 font-semibold text-white">${mName}</td>
      <td class="py-3 px-4 font-mono">${mMobile}</td>
      <td class="py-3 px-4 text-slate-400 font-mono">${mEmail}</td>
      <td class="py-3 px-4 text-center font-bold text-rose-400">${mBlood}</td>
      <td class="py-3 px-4 font-mono text-slate-400">${formattedRegDate}</td>
      <td class="py-3 px-4">${statusBadge}</td>
      <td class="py-3 px-4 text-center">
        <select onchange="updateMemberStatus('${mId}', this.value)" class="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#00b4d8] cursor-pointer">
          <option value="" disabled selected>পরিবর্তন</option>
          <option value="active">Approve করুন</option>
          <option value="inactive">Inactive করুন</option>
          <option value="suspend">Suspend করুন</option>
        </select>
      </td>
      <td class="py-3 px-4 text-center">
        <button onclick="openDetailsModal('${mId}')" class="w-7 h-7 bg-slate-800 hover:bg-[#00b4d8]/20 hover:text-[#00b4d8] text-slate-400 rounded-lg flex items-center justify-center transition-all cursor-pointer">
          <i class="fa-solid fa-eye text-xs"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tableRow);
  });
}

// গুগল স্ক্রিপ্ট API কানেকশন দিয়ে মেম্বার স্ট্যাটাস আপডেট লজিক
async function updateMemberStatus(memberId, newStatus) {
  if (!memberId) return;
  const confirmAction = confirm(`আপনি কি নিশ্চিতভাবে সদস্য আইডি ${memberId} এর স্ট্যাটাস আপডেট করতে চান?`);
  if (!confirmAction) { filterAndRenderMembersTable(); return; }

  const loader = document.getElementById('globalLoader');
  if (loader) loader.style.display = 'flex';

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "updateStatus", memberId: memberId, status: newStatus })
    });
    const result = await response.json();

    if (result.success) {
      alert("স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে! নির্ধারিত গুগল স্ক্রিপ্ট নোটিফিকেশন ইমেইল চলে গেছে।");
      if (typeof fetchDashboardData === 'function') await fetchDashboardData();
    } else {
      if (loader) loader.style.display = 'none';
      alert("ত্রুটি: " + result.error);
      filterAndRenderMembersTable();
    }
  } catch (error) {
    if (loader) loader.style.display = 'none';
    alert("সার্ভার কানেকশন ত্রুটি হয়েছে!");
    filterAndRenderMembersTable();
  }
}

// মডাল কন্ট্রোলার (২৩টি কলামের সব গুরুত্বপূর্ণ ডাটা সুন্দর করে দেখাবে)
function openDetailsModal(memberId) {
  activePopupUser = allUsersData.find(row => (row[0] || row.memberId) === memberId);
  if (!activePopupUser) return;
  
  // কলাম ইনডেক্স ডাটা ভ্যারিয়েবল অ্যাসাইনমেন্ট
  const regNo = activePopupUser[0] || 'N/A';
  const nameBn = activePopupUser[1] || 'N/A';
  const nameEn = activePopupUser[2] || 'N/A';
  const father = activePopupUser[3] || 'N/A';
  const mother = activePopupUser[4] || 'N/A';
  const mobile = activePopupUser[5] || 'N/A';
  const email = activePopupUser[6] || 'N/A';
  const blood = activePopupUser[7] || 'N/A';
  const gender = activePopupUser[8] || 'N/A';
  const dob = activePopupUser[9] || 'N/A';
  const present = activePopupUser[10] || 'N/A';
  const permanent = activePopupUser[11] || 'N/A';
  const edu = activePopupUser[12] || 'N/A';
  const passingYear = activePopupUser[13] || 'N/A';
  const profession = activePopupUser[14] || 'N/A';
  const acadYear = activePopupUser[15] || 'N/A';
  const avatarUrl = activePopupUser[16] || '';
  const whatsapp = activePopupUser[17] || 'N/A';
  const fbLink = activePopupUser[18] || 'N/A';
  const nid = activePopupUser[19] || 'N/A';
  const status = activePopupUser[20] || 'pending';
  const mType = activePopupUser[21] || 'N/A';

  document.getElementById('modalContentArea').innerHTML = `
    <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      ${avatarUrl ? `
      <div class="flex justify-center mb-2">
        <img src="${avatarUrl}" alt="Photo" class="w-24 h-24 object-cover rounded-xl border border-slate-700 shadow-md">
      </div>` : ''}
      
      <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 font-sans text-xs text-slate-300">
        <div class="grid grid-cols-3 gap-y-2 gap-x-1 border-b border-slate-800 pb-2">
          <span class="text-slate-500 font-bold col-span-1">Reg No:</span>
          <span class="text-[#00b4d8] font-mono font-bold col-span-2">${regNo}</span>
          <span class="text-slate-500 font-bold col-span-1">Status:</span>
          <span class="capitalize text-amber-400 font-bold col-span-2">${status}</span>
          <span class="text-slate-500 font-bold col-span-1">Type:</span>
          <span class="text-indigo-400 font-bold col-span-2">${mType}</span>
        </div>
        
        <div class="space-y-2 pt-1">
          <div><span class="text-slate-500 font-semibold block text-[10px] uppercase">Name (English)</span><span class="text-white font-medium">${nameEn}</span></div>
          <div><span class="text-slate-500 font-semibold block text-[10px] uppercase">নাম (বাংলা)</span><span class="text-slate-300">${nameBn}</span></div>
          <div class="grid grid-cols-2 gap-2">
            <div><span class="text-slate-500 block text-[10px] uppercase">Father's Name</span><span class="text-slate-300">${father}</span></div>
            <div><span class="text-slate-500 block text-[10px] uppercase">Mother's Name</span><span class="text-slate-300">${mother}</span></div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div><span class="text-slate-500 block text-[10px] uppercase">Mobile Number</span><span class="text-slate-200 font-mono">${mobile}</span></div>
            <div><span class="text-slate-500 block text-[10px] uppercase">WhatsApp</span><span class="text-slate-200 font-mono">${whatsapp}</span></div>
          </div>
          <div><span class="text-slate-500 block text-[10px] uppercase">Email Address</span><span class="text-slate-300 font-mono break-all">${email}</span></div>
          <div class="grid grid-cols-3 gap-1 text-center bg-slate-900 p-2 rounded-lg my-1">
            <div><span class="text-slate-500 block text-[9px] uppercase">Blood</span><span class="text-rose-400 font-bold">${blood}</span></div>
            <div><span class="text-slate-500 block text-[9px] uppercase">Gender</span><span class="text-slate-300">${gender}</span></div>
            <div><span class="text-slate-500 block text-[9px] uppercase">DOB</span><span class="text-slate-300 font-mono">${dob.split('T')[0]}</span></div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div><span class="text-slate-500 block text-[10px] uppercase">Education</span><span class="text-slate-300">${edu} (${passingYear})</span></div>
            <div><span class="text-slate-500 block text-[10px] uppercase">Profession / Acad Year</span><span class="text-slate-300">${profession} (${acadYear})</span></div>
          </div>
          <div><span class="text-slate-500 block text-[10px] uppercase">NID / Birth Cert</span><span class="text-slate-300 font-mono">${nid}</span></div>
          <div><span class="text-slate-500 block text-[10px] uppercase">Facebook Profile</span><a href="${fbLink}" target="_blank" class="text-[#00b4d8] hover:underline block truncate font-mono">${fbLink}</a></div>
          <div><span class="text-slate-500 block text-[10px] uppercase">Present Address</span><span class="text-slate-400 text-[11px]">${present}</span></div>
          <div><span class="text-slate-500 block text-[10px] uppercase">Permanent Address</span><span class="text-slate-400 text-[11px]">${permanent}</span></div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('detailsModal').style.display = 'flex';
}

function closeDetailsModal() { document.getElementById('detailsModal').style.display = 'none'; }

// এক্সেল রিপোর্ট জেনারেটর
function exportToExcel() {
  if (currentFilteredList.length === 0) { alert("এক্সপোর্ট করার জন্য কোনো ডাটা অবশিষ্ট নেই।"); return; }
  const excelDataRows = currentFilteredList.map((row, index) => ({
    "সিরিয়াল নাম্বার": index + 1,
    "রেজিস্ট্রেশন নাম্বার": row[0] || 'N/A',
    "নাম (বাংলা)": row[1] || 'N/A',
    "নাম (English)": row[2] || 'N/A',
    "পিতার নাম": row[3] || 'N/A',
    "মাতার নাম": row[4] || 'N/A',
    "মোবাইল নাম্বার": row[5] || 'N/A',
    "ইমেইল এড্রেস": row[6] || 'N/A',
    "রক্তের গ্রুপ": row[7] || 'N/A',
    "জেন্ডার (Gender)": row[8] || 'N/A',
    "জন্ম তারিখ": row[9] || 'N/A',
    "বর্তমান ঠিকানা": row[10] || 'N/A',
    "স্থায়ী ঠিকানা": row[11] || 'N/A',
    "শিক্ষা": row[12] || 'N/A',
    "পাসের বছর": row[13] || 'N/A',
    "পেশা": row[14] || 'N/A',
    "শিক্ষাবর্ষ": row[15] || 'N/A',
    "হোয়াটসঅ্যাপ নাম্বার": row[17] || 'N/A',
    "ফেসবুক লিংক": row[18] || 'N/A',
    "NID/জন্ম নিবন্ধন": row[19] || 'N/A',
    "স্ট্যাটাস": row[20] || 'N/A',
    "টাইপ": row[21] || 'N/A',
    "রেজিস্ট্রেশনের তারিখ": row[22] || 'N/A'
  }));
  const sheet = XLSX.utils.json_to_sheet(excelDataRows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Filtered Members");
  XLSX.writeFile(book, `ROS_Filtered_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// অফিসিয়াল পিডিএফ রিপোর্ট জেনারেটর
function exportToPDF() {
  if (currentFilteredList.length === 0) { alert("ডাউনলোড করার মত কোনো মেম্বার ডাটা নেই।"); return; }
  const { jsPDF } = window.jspdf;
  const pdfDoc = new jsPDF('p', 'mm', 'a4');

  const logoUrl = "https://rosociety.vercel.app/ros%20logo.png";
  pdfDoc.addImage(logoUrl, 'PNG', 92, 12, 25, 25);

  pdfDoc.setFont("Helvetica", "bold");
  pdfDoc.setFontSize(18);
  pdfDoc.text("Rajshahi Olympiad Society", 105, 44, { align: "center" });
  
  pdfDoc.setFont("Helvetica", "normal");
  pdfDoc.setFontSize(12);
  pdfDoc.text("Member Management System", 105, 51, { align: "center" });

  const reportTableRows = currentFilteredList.map((row, index) => [
    "[  ]", index + 1, row[0] || 'N/A', row[2] || row[1] || 'N/A', row[5] || 'N/A', row[6] || 'N/A', row[7] || 'N/A', ""
  ]);

  pdfDoc.autoTable({
    startY: 58,
    head: [['[ ]', 'SL', 'Reg No', 'Name (English)', 'Mobile', 'Email Address', 'Blood', 'Comment Box']],
    body: reportTableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 9, halign: 'center', fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, font: "Helvetica", textColor: [30, 41, 59] },
    columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 10, halign: 'center' }, 2: { cellWidth: 20 }, 6: { cellWidth: 15, halign: 'center' }, 7: { cellWidth: 25 } },
    margin: { left: 10, right: 10 }
  });

  const totalPagesCount = pdfDoc.internal.getNumberOfPages();
  const currentBangladeshTime = new Date().toLocaleString('en-US', { hour12: true });

  for (let pageNum = 1; pageNum <= totalPagesCount; pageNum++) {
    pdfDoc.setPage(pageNum);
    pdfDoc.setFontSize(8);
    pdfDoc.setTextColor(148, 163, 184);
    pdfDoc.text(`Download Date & Time: ${currentBangladeshTime}`, 10, 288);
    pdfDoc.text("Developed by: Utsab Sarkar", 200, 288, { align: "right" });
  }

  pdfDoc.save(`ROS_Official_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
