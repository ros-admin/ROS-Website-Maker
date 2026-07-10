/**
 * ==========================================
 * ROS Member Management System Module
 * Developer: Utsab Sarkar
 * ==========================================
 */

let currentFilteredList = []; // রেন্ডার হওয়া ফিল্টারড লিস্ট ট্র্যাক রাখার জন্য গ্লোবাল ভ্যারিয়েবল
let activePopupUser = null;   // মডালে থাকা একক ইউজারের ব্যাকআপ ভ্যারিয়েবল

// ১. শিটের ডাটা থেকে তারিখ নিয়ে অটোমেটিক ইউনিক ডেট ফিল্টার লোড করার ফাংশন
function setupRegistrationDateFilter(users) {
  const dateSelect = document.getElementById('filterDate');
  if (!dateSelect) return;

  const uniqueDates = [];
  users.forEach(user => {
    if (user.registrationDate) {
      const datePart = user.registrationDate.split(' ')[0]; // YYYY-MM-DD আলাদা করা
      if (!uniqueDates.includes(datePart)) {
        uniqueDates.push(datePart);
      }
    }
  });

  // নতুন থেকে পুরাতন তারিখ ক্রমানুসারে সর্ট করা
  uniqueDates.sort((a, b) => new Date(b) - new Date(a));

  dateSelect.innerHTML = '<option value="all">সব তারিখ</option>';
  uniqueDates.forEach(date => {
    // DD/MM/YYYY ফরম্যাটে কনভার্ট করে ড্রপডাউনে শো করানো
    const reversedDate = date.split('-').reverse().join('/');
    const option = document.createElement('option');
    option.value = date;
    option.innerText = reversedDate;
    dateSelect.appendChild(option);
  });
}

// ২. কাস্টম রিকোয়ারমেন্ট অনুযায়ী ৪টি ফিল্টার এবং সার্চ বক্স নিয়ে মেইন টেবিল রেন্ডার ইঞ্জিন
function filterAndRenderMembersTable() {
  const searchQuery = document.getElementById('memberSearchInput').value.toLowerCase().trim();
  const statusFilter = document.getElementById('filterStatus').value.toLowerCase();
  const bloodFilter = document.getElementById('filterBlood').value;
  const genderFilter = document.getElementById('filterGender').value;
  const dateFilter = document.getElementById('filterDate').value;

  const tbody = document.getElementById('memberTableBody');
  const fallback = document.getElementById('noMemberFallback');
  if (!tbody || !fallback) return;

  tbody.innerHTML = '';

  // কম্বাইন্ড সার্চ এবং মাল্টি-ফিল্টারিং লজিক
  currentFilteredList = allUsersData.filter(user => {
    // ক) সার্চ বক্স কন্ডিশন (নাম, মোবাইল, ইমেইল, মেম্বার আইডি)
    const name = (user.englishName || '').toLowerCase();
    const id = (user.memberId || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const mobile = (user.mobile || '').toLowerCase();
    const searchMatch = !searchQuery || name.includes(searchQuery) || id.includes(searchQuery) || email.includes(searchQuery) || mobile.includes(searchQuery);

    // খ) স্ট্যাটাস ফিল্টার কন্ডিশন
    const statusMatch = (statusFilter === 'all') || 
                        (statusFilter === 'approved' && (user.status === 'approved' || user.status === 'active')) ||
                        (user.status && user.status.toLowerCase() === statusFilter);

    // গ) রক্তের গ্রুপ ফিল্টার কন্ডিশন
    const bloodMatch = (bloodFilter === 'all') || (user.bloodGroup === bloodFilter);

    // ঘ) জেন্ডার ফিল্টার কন্ডিশন
    const genderMatch = (genderFilter === 'all') || (user.gender === genderFilter);

    // ঙ) রেজিস্ট্রেশন তারিখ ফিল্টার কন্ডিশন
    const userDatePart = user.registrationDate ? user.registrationDate.split(' ')[0] : '';
    const dateMatch = (dateFilter === 'all') || (userDatePart === dateFilter);

    return searchMatch && statusMatch && bloodMatch && genderMatch && dateMatch;
  });

  // রিয়েল-টাইম ফিল্টারড মেম্বার কাউন্টার আপডেট
  document.getElementById('filtered-count').innerText = currentFilteredList.length;

  if (currentFilteredList.length === 0) {
    fallback.classList.remove('hidden');
    return;
  }
  fallback.classList.add('hidden');

  // টেবিলে ডাইনামিক রো এবং অটোম্যাটিক ক্রমানুসারে সিরিয়াল জেনারেশন (SL)
  currentFilteredList.forEach((user, index) => {
    const row = document.createElement('tr');
    row.className = "hover:bg-slate-800/30 transition-colors border-b border-slate-800/60 font-medium";

    // স্ট্যাটাস অনুসারে কালার ব্যাজ সেটআপ
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

    // তারিখ ফরম্যাট পরিবর্তন (DD/MM/YYYY)
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

// ৩. গুগল অ্যাপ স্ক্রিপ্ট API এর সাথে কানেক্ট করে স্ট্যাটাস পরিবর্তন করার মেথড
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
      alert("স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে! " + (newStatus === 'active' ? "নির্ধারিত গুগল স্ক্রিপ্ট ইমেইল নোটিফিকেশন ইউজারের ঠিকানায় চলে গেছে।" : ""));
      
      // লোকাল গ্লোবাল ডাটা অ্যারে সিঙ্ক আপডেট
      const userIdx = allUsersData.findIndex(u => u.memberId === memberId);
      if (userIdx > -1) {
        allUsersData[userIdx].status = (newStatus === 'active') ? 'approved' : newStatus;
      }
      
      // মূল ড্যাশবোর্ডের গ্রাফ ও স্ট্যাটাস কাউন্টার অটো রিফ্রেশ করা
      if (typeof calculateStatsAndRenderCharts === 'function') calculateStatsAndRenderCharts(allUsersData);
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

// ৪. বিস্তারিত মডাল পপআপ লজিক
function openDetailsModal(memberId) {
  activePopupUser = allUsersData.find(u => u.memberId === memberId);
  if (!activePopupUser) return;
  
  // ডিজাইন এরিয়া স্ট্রাকচার (ডিজাইন পরবর্তীতে পরিবর্তনশীল)
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

function closeDetailsModal() { 
  document.getElementById('detailsModal').style.display = 'none'; 
}

function downloadSingleUserPDF() { 
  alert("একক ইউজারের নিবন্ধনের সকল তথ্য সমৃদ্ধ পিডিএফ ডিজাইন আপনি পরে দিবেন বলেছেন, তাই এটি আপাতত পেন্ডিং রাখা হলো।"); 
}

// ৫. ফিল্টার ট্র্যাকিং অনুযায়ী এক্সেল (Excel) এক্সপোর্ট ফাংশন
function exportToExcel() {
  if (currentFilteredList.length === 0) { alert("এক্সপোর্ট করার জন্য কোনো ডাটা অবশিষ্ট নেই।"); return; }
  
  // রিকোয়ারমেন্ট অনুযায়ী বাম সাইডে ক্রমানুসারে সিরিয়াল নাম্বার জেনারেশন
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

// ৬. অফিসিয়াল রিকোয়ারমেন্ট গাইডলাইন মেনে পিডিএফ (PDF) এক্সপোর্ট ফাংশন
function exportToPDF() {
  if (currentFilteredList.length === 0) { alert("ডাউনলোড করার মত কোনো মেম্বার ডাটা নেই।"); return; }

  const { jsPDF } = window.jspdf;
  const pdfDoc = new jsPDF('p', 'mm', 'a4');

  // ক) সবার উপরে মাঝখানে লোগো (ROS Logo) প্লেসমেন্ট
  const logoUrl = "https://rosociety.vercel.app/ros%20logo.png";
  pdfDoc.addImage(logoUrl, 'PNG', 92, 12, 25, 25);

  // খ) লোগোর নিচে Rajshahi Olympiad Society শিরোনাম
  pdfDoc.setFont("Helvetica", "bold");
  pdfDoc.setFontSize(18);
  pdfDoc.text("Rajshahi Olympiad Society", 105, 44, { align: "center" });
  
  // গ) এর নিচে মেম্বার ম্যানেজমেন্ট সিস্টেম সাব-হেডিং
  pdfDoc.setFont("Helvetica", "normal");
  pdfDoc.setFontSize(12);
  pdfDoc.text("Member Management System", 105, 51, { align: "center" });

  // ঘ) টেবিল ডাটা প্রিপারেশন (সর্ব বামে চেকবক্স স্পেস `[  ]` এবং ডাইনামিক সিরিয়াল সহ)
  const reportTableRows = currentFilteredList.map((user, index) => [
    "[  ]", // সর্ব বাম দিকের চেক বক্স স্পেস
    index + 1,
    user.memberId || 'N/A',
    user.englishName || 'N/A',
    user.mobile || 'N/A',
    user.email || 'N/A',
    user.bloodGroup || 'N/A',
    "" // কমেন্ট বক্স (ফাঁকা কলাম)
  ]);

  // ঙ) কাস্টম ডিজাইন টেবিল রেন্ডারিং
  pdfDoc.autoTable({
    startY: 58,
    head: [['[ ]', 'SL', 'Reg No', 'Name', 'Mobile', 'Email Address', 'Blood', 'Comment Box']],
    body: reportTableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 9, halign: 'center', fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, font: "Helvetica", textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // চেকবক্স উইডথ
      1: { cellWidth: 10, halign: 'center' }, // সিরিয়াল উইডথ
      2: { cellWidth: 20 },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 25 } // কমেন্ট বক্স সাইজ
    },
    margin: { left: 10, right: 10 }
  });

  // চ) ডাইনামিক ফুটার সিস্টেম (সকল পেজের জন্য)
  const totalPagesCount = pdfDoc.internal.getNumberOfPages();
  const currentBangladeshTime = new Date().toLocaleString('en-US', { hour12: true });

  for (let pageNum = 1; pageNum <= totalPagesCount; pageNum++) {
    pdfDoc.setPage(pageNum);
    pdfDoc.setFontSize(8);
    pdfDoc.setTextColor(148, 163, 184); // স্মুথ গ্রে কালার
    
    // ফুটারের বামদিকে ডাউনলোডের তারিখ এবং সময়
    pdfDoc.text(`Download Date & Time: ${currentBangladeshTime}`, 10, 288);
    
    // ফুটারের ডানদিকে ডেভেলপ বাই উৎসব সরকার ক্রেডিট
    pdfDoc.text("Developed by: Utsab Sarkar", 200, 288, { align: "right" });
  }

  // ডাউনলোড ফাইল নেম সেটআপ
  pdfDoc.save(`ROS_Official_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}