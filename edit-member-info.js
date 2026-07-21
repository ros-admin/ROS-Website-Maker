/**
 * edit-member-info.js
 * Instant Search and Edit Member Information Logic
 */

function renderEditMemberInfoSection(container) {
  container.innerHTML = `
    <section id="edit-member-section" class="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <!-- Section Header -->
      <div class="border-b border-slate-800 pb-4">
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-user-pen text-amber-400"></i> Edit Member Information
        </h2>
        <p class="text-xs text-slate-400 mt-1">রেজিস্ট্রেশন নাম্বার, নাম, মোবাইল বা ইমেইল দিয়ে লাইভ সার্চ করে মেম্বারের তথ্য আপডেট করুন।</p>
      </div>

      <!-- Live Search Box Section -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <label class="block text-xs font-bold text-slate-300">
          <i class="fa-solid fa-magnifying-glass text-[#00b4d8] mr-1"></i> সদস্য খুঁজুন (রেজিঃ/নাম/মোবাইল/ইমেইল টাইপ করুন):
        </label>
        <div class="relative">
          <input type="text" id="editLiveSearchInput" oninput="handleEditMemberLiveSearch()" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 shadow-inner" placeholder="টাইপ করুন... e.g. ROS-2024-0001, Rahim, 01700000000">
        </div>

        <!-- Live Search Results Table -->
        <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50 mt-3">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                <th class="py-2.5 px-3 text-center w-12">SL</th>
                <th class="py-2.5 px-3">Registration Number</th>
                <th class="py-2.5 px-3">Member Name</th>
                <th class="py-2.5 px-[#00b4d8] text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody id="editSearchTableBody" class="divide-y divide-slate-900 text-xs text-slate-300">
              <tr>
                <td colspan="4" class="py-6 text-center text-slate-500">মেম্বার খুঁজতে সার্চ বক্সে তথ্য টাইপ করুন...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Member Dynamic Edit Form Container -->
      <div id="dynamicEditFormWrapper" class="hidden bg-slate-900/60 border border-amber-500/30 rounded-2xl p-6 space-y-6">
        <div class="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 class="text-sm font-bold text-amber-400 flex items-center gap-2">
            <i class="fa-solid fa-user-gear"></i> তথ্য আপডেট ফর্ম (<span id="displayEditingRegId" class="font-mono text-white"></span>)
          </h3>
          <button onclick="hideEditFormWrapper()" class="text-xs text-slate-400 hover:text-rose-400 font-bold flex items-center gap-1 cursor-pointer">
            <i class="fa-solid fa-xmark"></i> ফর্ম বন্ধ করুন
          </button>
        </div>

        <form id="activeEditMemberForm" onsubmit="handleActiveMemberUpdateSubmit(event)" class="space-y-6">
          <input type="hidden" id="edit_memberId">
          <input type="hidden" id="edit_photoUrl" value="">

          <!-- Personal Information -->
          <div>
            <h4 class="text-xs font-bold text-[#00b4d8] uppercase tracking-wider mb-3">ব্যক্তিগত তথ্য</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label class="block text-slate-400 mb-1 font-bold">নাম (বাংলা)</label>
                <input type="text" id="edit_banglaName" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-bold">Name (English)</label>
                <input type="text" id="edit_englishName" required class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-bold">Father's Name</label>
                <input type="text" id="edit_fatherName" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-bold">Mother's Name</label>
                <input type="text" id="edit_motherName" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-bold">Date of Birth</label>
                <input type="text" id="edit_dob" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white" placeholder="YYYY-MM-DD">
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-bold">Gender</label>
                <select id="edit_gender" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-bold">Blood Group</label>
                <select id="edit_bloodGroup" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
                  <option value="">Select</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-slate-400 mb-1 font-bold">NID / Birth Registration No</label>
                <input type="text" id="edit_nid" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
            </div>
          </div>

          <hr class="border-slate-800/80">

          <!-- Contact Information -->
          <div>
            <h4 class="text-xs font-bold text-[#ec4899] uppercase tracking-wider mb-3">যোগাযোগের তথ্য</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label class="block text-slate-400 mb-1 font-bold">Mobile Number</label>
                <input type="text" id="edit_mobile" required class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-bold">Email Address</label>
                <input type="email" id="edit_email" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-bold">WhatsApp Number</label>
                <input type="text" id="edit_whatsapp" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
              <div class="sm:col-span-3">
                <label class="block text-slate-400 mb-1 font-bold">Facebook Profile Link</label>
                <input type="text" id="edit_fbLink" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
              <div class="sm:col-span-3 md:col-span-1">
                <label class="block text-slate-400 mb-1 font-bold">Present Address</label>
                <input type="text" id="edit_presentAddress" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
              <div class="sm:col-span-3 md:col-span-2">
                <label class="block text-slate-400 mb-1 font-bold">Permanent Address</label>
                <input type="text" id="edit_permanentAddress" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
            </div>
          </div>

          <hr class="border-slate-800/80">

          <!-- Academic & Career -->
          <div>
            <h4 class="text-xs font-bold text-[#ffd700] uppercase tracking-wider mb-3">শিক্ষা ও পেশা</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block text-slate-400 mb-1 font-bold">Education Level</label>
                <input type="text" id="edit_education" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-bold">Academic Session / Year</label>
                <input type="text" id="edit_academicYear" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-bold">Profession</label>
                <input type="text" id="edit_profession" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-bold">Institution</label>
                <input type="text" id="edit_institution" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white">
              </div>
            </div>
          </div>

          <hr class="border-slate-800/80">

          <!-- Profile Photo Change -->
          <div>
            <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">ছবি পরিবর্তন করুন (ঐচ্ছিক)</h4>
            <div class="text-xs space-y-2">
              <input type="file" id="edit_photoFile" accept="image/*" onchange="uploadEditPhotoCloudinary(this)" class="w-full text-slate-400 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer">
              <span id="edit_photo_status" class="text-[11px] text-amber-400 block font-semibold"></span>
            </div>
          </div>

          <!-- Submit Controls -->
          <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onclick="hideEditFormWrapper()" class="px-5 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700 transition-all cursor-pointer">বাতিল করুন</button>
            <button type="submit" class="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer">
              <i class="fa-solid fa-floppy-disk mr-1"></i> Update Info
            </button>
          </div>
        </form>
      </div>
    </section>
  `;
}

// Live Search Processing
function handleEditMemberLiveSearch() {
  const query = document.getElementById('editLiveSearchInput') ? document.getElementById('editLiveSearchInput').value.toLowerCase().trim() : '';
  const tbody = document.getElementById('editSearchTableBody');

  if (!tbody) return;

  if (!query) {
    tbody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-slate-500">মেম্বার খুঁজতে সার্চ বক্সে তথ্য টাইপ করুন...</td></tr>`;
    return;
  }

  const matches = (window.allUsersData || []).filter(u => {
    return String(u.memberId || '').toLowerCase().includes(query) ||
           String(u.englishName || '').toLowerCase().includes(query) ||
           String(u.mobile || '').toLowerCase().includes(query) ||
           String(u.email || '').toLowerCase().includes(query);
  });

  if (matches.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-rose-400 font-medium">কোনো সদস্যের তথ্য খুঁজে পাওয়া যায়নি!</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  matches.forEach((user, index) => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-900/60 transition-colors border-b border-slate-900";
    tr.innerHTML = `
      <td class="py-2.5 px-3 text-center font-mono text-slate-500">${index + 1}</td>
      <td class="py-2.5 px-3 font-mono font-bold text-[#00b4d8]">${user.memberId || 'N/A'}</td>
      <td class="py-2.5 px-3 font-semibold text-white">${user.englishName || 'N/A'}</td>
      <td class="py-2.5 px-3 text-center">
        <button onclick="populateMemberDataToEditForm('${user.memberId}')" class="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/40 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer">
          <i class="fa-solid fa-pen-to-square"></i> Edit Info
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Populate User Data into Edit Form
function populateMemberDataToEditForm(memberId) {
  const user = (window.allUsersData || []).find(u => u.memberId === memberId);
  if (!user) return;

  document.getElementById('edit_memberId').value = user.memberId || '';
  document.getElementById('displayEditingRegId').innerText = user.memberId || '';

  document.getElementById('edit_banglaName').value = user.banglaName || '';
  document.getElementById('edit_englishName').value = user.englishName || '';
  document.getElementById('edit_fatherName').value = user.fatherName || '';
  document.getElementById('edit_motherName').value = user.motherName || '';
  document.getElementById('edit_dob').value = user.dob || '';
  document.getElementById('edit_gender').value = user.gender || 'Male';
  document.getElementById('edit_bloodGroup').value = user.bloodGroup || '';
  document.getElementById('edit_nid').value = user.nidOrBrn || '';

  document.getElementById('edit_mobile').value = user.mobile || '';
  document.getElementById('edit_email').value = user.email || '';
  document.getElementById('edit_whatsapp').value = user.whatsappNumber || '';
  document.getElementById('edit_fbLink').value = user.facebookLink || '';
  document.getElementById('edit_presentAddress').value = user.presentAddress || '';
  document.getElementById('edit_permanentAddress').value = user.permanentAddress || '';

  document.getElementById('edit_education').value = user.education || '';
  document.getElementById('edit_academicYear').value = user.academicYear || '';
  document.getElementById('edit_profession').value = user.profession || '';
  document.getElementById('edit_institution').value = user.institution || '';

  document.getElementById('edit_photoUrl').value = user.photoUrl || '';
  document.getElementById('edit_photo_status').innerText = '';

  const wrapper = document.getElementById('dynamicEditFormWrapper');
  wrapper.classList.remove('hidden');
  wrapper.scrollIntoView({ behavior: 'smooth' });
}

function hideEditFormWrapper() {
  document.getElementById('dynamicEditFormWrapper').classList.add('hidden');
}

// Edit Photo Cloudinary Upload
async function uploadEditPhotoCloudinary(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  if (file.size > 1024 * 1024) {
    alert("ছবি ১ মেগাবাইটের (1 MB) নিচে হতে হবে!");
    fileInput.value = "";
    return;
  }

  const statusEl = document.getElementById('edit_photo_status');
  if (statusEl) statusEl.innerText = "⏳ ক্লাউডে নতুন ছবি আপলোড হচ্ছে...";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    if (data.secure_url) {
      document.getElementById('edit_photoUrl').value = data.secure_url;
      if (statusEl) statusEl.innerText = "✓ নতুন ছবি আপলোড সম্পন্ন হয়েছে!";
    } else {
      if (statusEl) statusEl.innerText = "✖ ক্লাউড আপলোড ব্যর্থ।";
    }
  } catch (err) {
    console.error(err);
    if (statusEl) statusEl.innerText = "✖ নেটওয়ার্ক ত্রুটি।";
  }
}

// Submit Updated Data
async function handleActiveMemberUpdateSubmit(e) {
  e.preventDefault();

  const payload = {
    action: "adminUpdateMember",
    memberId: document.getElementById('edit_memberId').value,
    banglaName: document.getElementById('edit_banglaName').value,
    englishName: document.getElementById('edit_englishName').value,
    fatherName: document.getElementById('edit_fatherName').value,
    motherName: document.getElementById('edit_motherName').value,
    dob: document.getElementById('edit_dob').value,
    gender: document.getElementById('edit_gender').value,
    bloodGroup: document.getElementById('edit_bloodGroup').value,
    nidOrBrn: document.getElementById('edit_nid').value,
    mobile: document.getElementById('edit_mobile').value,
    email: document.getElementById('edit_email').value,
    whatsappNumber: document.getElementById('edit_whatsapp').value,
    facebookLink: document.getElementById('edit_fbLink').value,
    presentAddress: document.getElementById('edit_presentAddress').value,
    permanentAddress: document.getElementById('edit_permanentAddress').value,
    education: document.getElementById('edit_education').value,
    academicYear: document.getElementById('edit_academicYear').value,
    profession: document.getElementById('edit_profession').value,
    institution: document.getElementById('edit_institution').value,
    photoUrl: document.getElementById('edit_photoUrl').value
  };

  if (typeof showLoader === 'function') showLoader(true, "মেম্বারের তথ্য আপডেট করা হচ্ছে...");

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (typeof showLoader === 'function') showLoader(false);

    if (result.success) {
      alert("✅ সদস্যের তথ্য সফলভাবে আপডেট করা হয়েছে!");
      hideEditFormWrapper();

      // Local state sync
      const idx = window.allUsersData.findIndex(u => u.memberId === payload.memberId);
      if (idx !== -1) {
        window.allUsersData[idx] = { ...window.allUsersData[idx], ...payload };
      }
      handleEditMemberLiveSearch();
    } else {
      alert(result.error || "আপডেট করা সম্ভব হয়নি।");
    }
  } catch (err) {
    if (typeof showLoader === 'function') showLoader(false);
    console.error(err);
    alert("সার্ভার ত্রুটি ঘটেছে।");
  }
}

// Global scope bindings
window.renderEditMemberInfoSection = renderEditMemberInfoSection;
window.handleEditMemberLiveSearch = handleEditMemberLiveSearch;
window.populateMemberDataToEditForm = populateMemberDataToEditForm;
window.hideEditFormWrapper = hideEditFormWrapper;
window.uploadEditPhotoCloudinary = uploadEditPhotoCloudinary;
window.handleActiveMemberUpdateSubmit = handleActiveMemberUpdateSubmit;
    
