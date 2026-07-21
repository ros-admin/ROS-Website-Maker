/**
 * add-new-member.js
 * Add New Member Feature Logic
 */

function renderAddNewMemberSection(container) {
  container.innerHTML = `
    <section id="add-member-section" class="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <!-- Section Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-user-plus text-[#00b4d8]"></i> Add New Member
          </h2>
          <p class="text-xs text-slate-400 mt-1">নতুন মেম্বারের বিস্তারিত তথ্য দিয়ে রেজিস্ট্রেশন সম্পন্ন করুন।</p>
        </div>
      </div>

      <!-- Registration Form -->
      <form id="addNewMemberForm" onsubmit="handleAddNewMemberSubmit(event)" class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        <input type="hidden" id="new_photoUrl" value="">
        
        <!-- Personal Information -->
        <div>
          <h3 class="text-xs font-bold text-[#00b4d8] uppercase tracking-wider mb-3 flex items-center gap-2">
            <i class="fa-solid fa-id-card"></i> ব্যক্তিগত তথ্য (Personal Information)
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label class="block text-slate-400 mb-1 font-bold">নাম (বাংলা)</label>
              <input type="text" id="new_banglaName" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="বাংলায় নাম লিখুন">
            </div>
            <div>
              <label class="block text-slate-400 mb-1 font-bold">Name (English) <span class="text-rose-500">*</span></label>
              <input type="text" id="new_englishName" required class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="English Name">
            </div>
            <div>
              <label class="block text-slate-400 mb-1 font-bold">Father's Name</label>
              <input type="text" id="new_fatherName" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="পিতার নাম">
            </div>
            <div>
              <label class="block text-slate-400 mb-1 font-bold">Mother's Name</label>
              <input type="text" id="new_motherName" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="মাতার নাম">
            </div>
            <div>
              <label class="block text-slate-400 mb-1 font-bold">Date of Birth</label>
              <input type="date" id="new_dob" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]">
            </div>
            <div>
              <label class="block text-slate-400 mb-1 font-bold">Gender <span class="text-rose-500">*</span></label>
              <select id="new_gender" required class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1 font-bold">Blood Group</label>
              <select id="new_bloodGroup" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]">
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-slate-400 mb-1 font-bold">NID / Birth Certificate No</label>
              <input type="text" id="new_nid" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="NID or Birth Reg Number">
            </div>
          </div>
        </div>

        <hr class="border-slate-800/80">

        <!-- Contact Information -->
        <div>
          <h3 class="text-xs font-bold text-[#ec4899] uppercase tracking-wider mb-3 flex items-center gap-2">
            <i class="fa-solid fa-phone"></i> যোগাযোগের তথ্য (Contact Details)
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label class="block text-slate-400 mb-1 font-bold">Mobile Number <span class="text-rose-500">*</span></label>
              <input type="text" id="new_mobile" required class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="017XXXXXXXX">
            </div>
            <div>
              <label class="block text-slate-400 mb-1 font-bold">Email Address</label>
              <input type="email" id="new_email" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="example@mail.com">
            </div>
            <div>
              <label class="block text-slate-400 mb-1 font-bold">WhatsApp Number</label>
              <input type="text" id="new_whatsapp" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="017XXXXXXXX">
            </div>
            <div class="sm:col-span-3">
              <label class="block text-slate-400 mb-1 font-bold">Facebook Profile Link</label>
              <input type="text" id="new_fbLink" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="https://facebook.com/username">
            </div>
            <div class="sm:col-span-3 md:col-span-1">
              <label class="block text-slate-400 mb-1 font-bold">Present Address</label>
              <input type="text" id="new_presentAddress" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="বর্তমান ঠিকানা">
            </div>
            <div class="sm:col-span-3 md:col-span-2">
              <label class="block text-slate-400 mb-1 font-bold">Permanent Address</label>
              <input type="text" id="new_permanentAddress" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="স্থায়ী ঠিকানা">
            </div>
          </div>
        </div>

        <hr class="border-slate-800/80">

        <!-- Education & Academic Details -->
        <div>
          <h3 class="text-xs font-bold text-[#ffd700] uppercase tracking-wider mb-3 flex items-center gap-2">
            <i class="fa-solid fa-graduation-cap"></i> শিক্ষা ও পেশাগত তথ্য (Education & Career)
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label class="block text-slate-400 mb-1 font-bold">Education Level</label>
              <input type="text" id="new_education" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="e.g. HSC / B.Sc in CSE">
            </div>
            <div>
              <label class="block text-slate-400 mb-1 font-bold">Academic Session / Year</label>
              <input type="text" id="new_academicYear" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="e.g. 2021-2022">
            </div>
            <div>
              <label class="block text-slate-400 mb-1 font-bold">Profession</label>
              <input type="text" id="new_profession" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="e.g. Student / Teacher / Engineer">
            </div>
            <div>
              <label class="block text-slate-400 mb-1 font-bold">Institution</label>
              <input type="text" id="new_institution" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00b4d8]" placeholder="প্রতিষ্ঠানের নাম">
            </div>
          </div>
        </div>

        <hr class="border-slate-800/80">

        <!-- Upload Photo -->
        <div>
          <h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <i class="fa-solid fa-image"></i> প্রোফাইল ছবি (Member Photo)
          </h3>
          <div class="text-xs space-y-2">
            <input type="file" id="new_photoFile" accept="image/*" onchange="uploadMemberPhotoCloudinary(this)" class="w-full text-slate-400 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#00b4d8]/10 file:text-[#00b4d8] hover:file:bg-[#00b4d8]/20 cursor-pointer">
            <span id="new_photo_status" class="text-[11px] text-emerald-400 block font-semibold"></span>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end pt-4 border-t border-slate-800">
          <button type="submit" class="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer">
            <i class="fa-solid fa-paper-plane"></i> Save & Register Member
          </button>
        </div>
      </form>
    </section>
  `;
}

// Cloudinary Image Upload Helper
async function uploadMemberPhotoCloudinary(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  if (file.size > 1024 * 1024) {
    alert("ছবি অবশ্যই ১ মেগাবাইটের (1 MB) নিচে হতে হবে!");
    fileInput.value = "";
    return;
  }

  const statusEl = document.getElementById('new_photo_status');
  if (statusEl) statusEl.innerText = "⏳ ছবি ক্লাউডে আপলোড হচ্ছে...";

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
      document.getElementById('new_photoUrl').value = data.secure_url;
      if (statusEl) statusEl.innerText = "✓ ছবি সফলভাবে আপলোড হয়েছে!";
    } else {
      if (statusEl) statusEl.innerText = "✖ ছবি আপলোড করতে ব্যর্থ হয়েছে।";
      alert("ছবি আপলোডে সমস্যা হয়েছে। Preset ও Cloud Name যাচাই করুন।");
    }
  } catch (err) {
    console.error(err);
    if (statusEl) statusEl.innerText = "✖ আপলোড ত্রুটি।";
  }
}

// Form Submit Handler
async function handleAddNewMemberSubmit(e) {
  e.preventDefault();

  const payload = {
    action: "adminAddMember",
    banglaName: document.getElementById('new_banglaName').value,
    englishName: document.getElementById('new_englishName').value,
    fatherName: document.getElementById('new_fatherName').value,
    motherName: document.getElementById('new_motherName').value,
    dob: document.getElementById('new_dob').value,
    gender: document.getElementById('new_gender').value,
    bloodGroup: document.getElementById('new_bloodGroup').value,
    nidOrBrn: document.getElementById('new_nid').value,
    mobileNumber: document.getElementById('new_mobile').value,
    email: document.getElementById('new_email').value,
    whatsappNumber: document.getElementById('new_whatsapp').value,
    facebookLink: document.getElementById('new_fbLink').value,
    presentAddress: document.getElementById('new_presentAddress').value,
    permanentAddress: document.getElementById('new_permanentAddress').value,
    education: document.getElementById('new_education').value,
    academicYear: document.getElementById('new_academicYear').value,
    profession: document.getElementById('new_profession').value,
    institution: document.getElementById('new_institution').value,
    photoUrl: document.getElementById('new_photoUrl').value
  };

  if (typeof showLoader === 'function') showLoader(true, "নতুন মেম্বার সংরক্ষণ করা হচ্ছে...");

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
      alert(`🎉 নতুন মেম্বার সফলভাবে যুক্ত করা হয়েছে! Member Registration ID: ${result.memberId}`);
      document.getElementById('addNewMemberForm').reset();
      document.getElementById('new_photoUrl').value = '';
      document.getElementById('new_photo_status').innerText = '';
    } else {
      alert(result.error || "সদস্য যোগ করতে ব্যর্থ হয়েছে।");
    }
  } catch (err) {
    if (typeof showLoader === 'function') showLoader(false);
    console.error(err);
    alert("সার্ভার কানেকশনে ত্রুটি ঘটেছে।");
  }
}

// Dynamic window bindings
window.renderAddNewMemberSection = renderAddNewMemberSection;
window.uploadMemberPhotoCloudinary = uploadMemberPhotoCloudinary;
window.handleAddNewMemberSubmit = handleAddNewMemberSubmit;
