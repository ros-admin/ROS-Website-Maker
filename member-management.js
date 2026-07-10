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
          <input type="text" id="memberSearchInput" oninput="filterAndRenderMembersTable()" class="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00b4d8]" placeholder="নাম, মোবাইল নাম্বার, ইমেইল এড্রেস বা রেজিস্ট্রেশন নাম্বার লিখে সার্চ দিন...">
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
            <option value="approved">Approved</option>
            <option value="inactive">Inactive</option>
            <option value="suspend">Suspend</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">রক্তের গ্রুপ ফিল্টার</label>
          <select id="filterBlood" onchange="filterAndRenderMembersTable()" class="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-[#00b4d8] cursor-pointer">
            <option value="all">সব গ্রুপ</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
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
              <th class="py-4 px-4">নাম</th>
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
    if (user.registrationDate) {
      const datePart = user.registrationDate.split(' ')[0];
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

  currentFilteredList = allUsersData.filter(user => {
    const name = (user.englishName || '').toLowerCase();
    const id = (user.memberId || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const mobile = (user.mobile || '').toLowerCase();
    const searchMatch = !searchQuery || name.includes(searchQuery) || id.includes(searchQuery) || email.includes(searchQuery) || mobile.includes(searchQuery);

    const statusMatch = (statusFilter === 'all') || 
                        (statusFilter === 'approved' && (user.status === 'approved' || user.status === 'active')) ||
                        (user.status && user.status.toLowerCase() === statusFilter);

    const bloodMatch = (bloodFilter === 'all') || (user.bloodGroup === bloodFilter);
    const genderMatch = (genderFilter === 'all') || (user.gender === genderFilter);
    const userDatePart = user.registrationDate ? user.registrationDate.split(' ')[0] : '';
    const dateMatch = (dateFilter === 'all') || (userDatePart === dateFilter);

    return searchMatch && statusMatch && bloodMatch && genderMatch && dateMatch;
  });

  const countEl = document.getElementById('filtered-count');
  if(countEl) countEl.innerText = currentFilteredList.length;

  if (currentFilteredList.length === 0) {
    fallback.classList.remove('hidden');
    return;
  }
  fallback.classList.add('hidden');

  currentFilteredList.forEach((user, index) => {
    const row = document.createElement('tr');
    row.className = "hover:bg-slate-800/30 transition-colors border-b border-slate-800/60 font-medium";

    let statusBadge = '';
    const currentStatus = (user.status || 'pending').toLowerCase();
    if (currentStatus === 'pending') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>`;
    } else if (currentStatus === 'approved' || currentStatus === 'active') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Approved</span>`;
    } else if (currentStatus === 'inactive') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/30 text-slate-400 border border-slate-700/50">Inactive</span>`;
    } else if (currentStatus === 'suspend') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Suspended</span>`;
    }

    const formattedRegDate = user.registrationDate ? user.registrationDate.split(' ')[0].split('-').reverse().join('/') : 'N/A';

    row.innerHTML = `
      <td class="py-3 px-4 text-center font-bold text-slate-400">${index + 1}</td>
      <td class="py-3 px-4 font-mono font-bold text-[#00b4d8]">${user.memberId || 'N/A'}</td>
      <td class="py-3 px-4 font-semibold text-white">${user.englishName || 'Unknown'}</td>
      <td class="py-3 px-4 font-mono">${user.mobile || 'N/A'}</td>
      <td class="py-3 px-4 text-slate-400 font-mono">${user.email || 'N/A'}</td>
      <td class="py-3 px-4 text-center font-bold text-rose-400">${user.bloodGroup || 'N/A'}</td>
      <td class="py-3 px-4 font-mono text-slate-400">${formattedRegDate}</td>
      <td class="py-3 px-4">${statusBadge}</td>
      <td class="py-3 px-4 text-center">
        <select onchange="updateMemberStatus('${user.memberId}', this.value)" class="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#00b4d8] cursor-pointer">
          <option value="" disabled selected>পরিবর্তন</option>
          <option value="active">Approve করুন</option>
          <option value="inactive">Inactive করুন</option>
          <option value="suspend">Suspend করুন</option>
        </select>
      </td>
      <td class="py-3 px-4 text-center">
        <button onclick="openDetailsModal('${user.memberId}')" class="w-7 h-7 bg-slate-800 hover:bg-[#00b4d8]/20 hover:text-[#00b4d8] text-slate-400 rounded-lg flex items-center justify-center transition-all cursor-pointer">
          <i class="fa-solid fa-eye text-xs"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
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
    if (loader) loader.style.display = 'none';

    if (result.success) {
      alert("স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে! নির্ধারিত গুগল স্ক্রিপ্ট নোটিফিকেশন ইমেইল চলে গেছে।");
      const userIdx = allUsersData.findIndex(u => u.memberId === memberId);
      if (userIdx > -1) allUsersData[userIdx].status = (newStatus === 'active') ? 'approved' : newStatus;
      
      if (typeof renderDashboardCharts === 'function') renderDashboardCharts(allUsersData);
      filterAndRenderMembersTable();
    } else {
      alert("ত্রুটি: " + result.error);
      filterAndRenderMembersTable();
    }
  } catch (error) {
    if (loader) loader.style.display = 'none';
    alert("সার্ভার কানেকশন ত্রুটি হয়েছে!");
    filterAndRenderMembersTable();
  }
}

// মডাল কন্ট্রোলার
function openDetailsModal(memberId) {
  activePopupUser = allUsersData.find(u => u.memberId === memberId);
  if (!activePopupUser) return;
  
  document.getElementById('modalContentArea').innerHTML = `
    <div class="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-[11px] text-slate-300">
      <div class="grid grid-cols-2 gap-2">
        <div><span class="text-slate-500 font-bold">Registration No:</span></div>
        <div class="text-[#00b4d8] font-bold">${activePopupUser.memberId || 'N/A'}</div>
        <div><span class="text-slate-500 font-bold">Full Name:</span></div>
        <div class="text-white">${activePopupUser.englishName || 'N/A'}</div>
        <div><span class="text-slate-500 font-bold">Mobile Number:</span></div>
        <div>${activePopupUser.mobile || 'N/A'}</div>
        <div><span class="text-slate-500 font-bold">Email Address:</span></div>
        <div class="break-all">${activePopupUser.email || 'N/A'}</div>
        <div><span class="text-slate-500 font-bold">Blood Group:</span></div>
        <div class="text-rose-400 font-bold">${activePopupUser.bloodGroup || 'N/A'}</div>
        <div><span class="text-slate-500 font-bold">Gender Status:</span></div>
        <div>${activePopupUser.gender || 'N/A'}</div>
        <div><span class="text-slate-500 font-bold">Current Status:</span></div>
        <div class="capitalize text-amber-400">${activePopupUser.status || 'N/A'}</div>
      </div>
    </div>
  `;
  document.getElementById('detailsModal').style.display = 'flex';
}

function closeDetailsModal() { document.getElementById('detailsModal').style.display = 'none'; }
function downloadSingleUserPDF() { alert("একক ইউজারের তথ্যের পিডিএফ ডিজাইন পেন্ডিং রয়েছে।"); }

// এক্সেল রিপোর্ট জেনারেটর
function exportToExcel() {
  if (currentFilteredList.length === 0) { alert("এক্সপোর্ট করার জন্য কোনো ডাটা অবশিষ্ট নেই।"); return; }
  const excelDataRows = currentFilteredList.map((user, index) => ({
    "সিরিয়াল নাম্বার": index + 1,
    "রেজিস্ট্রেশন নাম্বার": user.memberId || 'N/A',
    "নাম": user.englishName || 'N/A',
    "মোবাইল নাম্বার": user.mobile || 'N/A',
    "ইমেইল এড্রেস": user.email || 'N/A',
    "রক্তের গ্রুপ": user.bloodGroup || 'N/A',
    "জেন্ডার (Gender)": user.gender || 'N/A',
    "রেজিস্ট্রেশনের তারিখ": user.registrationDate || 'N/A',
    "স্ট্যাটাস": user.status || 'N/A'
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

  const reportTableRows = currentFilteredList.map((user, index) => [
    "[  ]", index + 1, user.memberId || 'N/A', user.englishName || 'N/A', user.mobile || 'N/A', user.email || 'N/A', user.bloodGroup || 'N/A', ""
  ]);

  pdfDoc.autoTable({
    startY: 58,
    head: [['[ ]', 'SL', 'Reg No', 'Name', 'Mobile', 'Email Address', 'Blood', 'Comment Box']],
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
