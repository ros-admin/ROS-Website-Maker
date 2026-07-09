// আপনার একদম নতুন Google Web App URL 
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwkvIfjTQVM69qurRZvF90w_1pq1PaBYDPB8Gv0PCLR3DOyF4Ud8AVzp119agoB8NefpA/exec"; 

// ১. কাস্টম ড্যাশড স্পিনার, মোবাইল রেসপন্সিভ মডাল ফিক্স এবং টাইমার স্টাইল ইনজেকশন
const styleNode = document.createElement('style');
styleNode.innerHTML = `
  /* ফুল স্ক্রিন ওভারলে লোডার */
  .ros-global-loader {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(3, 10, 22, 0.9); display: none;
    flex-direction: column; align-items: center; justify-content: center; z-index: 99999;
    font-family: 'Poppins', 'Hind Siliguri', sans-serif;
  }
  .ros-spinner-container {
    position: relative; width: 110px; height: 110px;
    display: flex; align-items: center; justify-content: center;
  }
  /* কাটা কাটা (Dashed) থিম স্পিনার - নীল এবং হলুদ রং */
  .ros-dashed-spinner {
    position: absolute; width: 100%; height: 100%;
    border: 4px dashed #00b4d8; border-top-color: #ffd700; border-bottom-color: #ffd700;
    border-radius: 50%; animation: ros-spin 1.5s linear infinite;
  }
  .ros-spinner-logo {
    width: 65px; height: 65px; background: #ffffff;
    border-radius: 50%; padding: 3px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    object-fit: cover; z-index: 2;
  }
  .ros-loader-text {
    color: #ffd700; font-size: 16px; font-weight: 500; margin-top: 20px;
    letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }
  @keyframes ros-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  /* টাইমার এবং রিসেন্ড টেক্সট স্টাইল */
  .otp-timer-container {
    margin: 15px 0 5px 0; font-size: 14px; color: #ffd700; font-weight: 500; text-align: center;
  }
  .resend-otp-btn {
    background: none; border: none; color: #52667d; font-weight: 600;
    cursor: not-allowed; text-decoration: underline; font-size: 13px; margin-top: 5px; transition: 0.3s;
  }
  .resend-otp-btn.active {
    color: #00a4cc; cursor: pointer;
  }
  .spam-notice-box {
    background: rgba(255, 215, 0, 0.06); border: 1px dashed #ffd700;
    border-radius: 6px; padding: 10px; font-size: 12px; color: #f1f5f9;
    margin: 12px 0; text-align: center; line-height: 1.5;
  }

  /* মোবাইল সাকসেস/এরর পপআপ কেটে যাওয়া রোধ করার ফিক্স */
  #otpModal {
    overflow-y: auto !important;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px 10px !important;
    box-sizing: border-box;
  }
  #otpModal.active {
    display: flex !important;
  }
  #otpModal .modal-content {
    max-height: 92vh !important;
    overflow-y: auto !important;
    position: relative !important;
    top: unset !important;
    left: unset !important;
    transform: unset !important;
    margin: auto !important;
    width: 100% !important;
    box-sizing: border-box;
    -webkit-overflow-scrolling: touch;
  }
  /* সাকসেস পেজের বাটন সিএসএস */
  .btn-go-reg-again, .btn-go-home {
    display: block !important;
    width: 100% !important;
    padding: 12px !important;
    border-radius: 6px !important;
    font-weight: 600 !important;
    text-decoration: none !important;
    font-size: 15px !important;
    text-align: center !important;
    box-sizing: border-box !important;
    transition: 0.3s ease !important;
    font-family: 'Poppins', 'Hind Siliguri', sans-serif !important;
  }
  .btn-go-reg-again {
    background: #00b4d8 !important;
    color: #fff !important;
    box-shadow: 0 4px 15px rgba(0, 180, 216, 0.3) !important;
    margin-bottom: 12px !important;
    border: none;
    cursor: pointer;
  }
  .btn-go-reg-again:hover {
    background: #0096b4 !important;
    box-shadow: 0 6px 20px rgba(0, 180, 216, 0.5) !important;
  }
  .btn-go-home {
    background: rgba(255, 255, 255, 0.05) !important;
    color: #f1f5f9 !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
  .btn-go-home:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    color: #fff !important;
  }
`;
document.head.appendChild(styleNode);

// HTML-এ গ্লোবাল লোডার ডাইনামিকালি তৈরি করে বডিতে পুশ করা
const globalLoaderDiv = document.createElement('div');
globalLoaderDiv.id = "rosGlobalLoader";
globalLoaderDiv.className = "ros-global-loader";
globalLoaderDiv.innerHTML = `
  <div class="ros-spinner-container">
    <div class="ros-dashed-spinner"></div>
    <img src="https://rosociety.vercel.app/ros%20logo.png" class="ros-spinner-logo" alt="ROS">
  </div>
  <div class="ros-loader-text" id="rosLoaderText">otp পাঠানো হচ্ছে...</div>
`;
document.body.appendChild(globalLoaderDiv);

// ফর্ম অবজেক্ট রেফারেন্স
const sameAddressCheck = document.getElementById('sameAddressCheck');
const presentAddress = document.getElementById('presentAddress');
const permanentAddress = document.getElementById('permanentAddress');
const registrationForm = document.getElementById('registrationForm');
const otpModal = document.getElementById('otpModal');
const closeModalBtn = document.getElementById('closeModalBtn');

// ক্লোজ বাটন অ্যাকশন
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    otpModal.classList.remove('active');
  });
}
window.addEventListener('click', (e) => {
  if (e.target === otpModal) otpModal.classList.remove('active');
});

// কাস্টম ড্রপডাউন (Blood Group) ইন্টিগ্রেশন
const wrapper = document.getElementById('bloodGroupWrapper');
const trigger = wrapper ? wrapper.querySelector('.custom-select-trigger') : null;
const searchBox = wrapper ? wrapper.querySelector('.search-box') : null;
const options = wrapper ? wrapper.querySelectorAll('.custom-option') : [];
const hiddenInput = document.getElementById('bloodGroup');

if (trigger) {
  trigger.addEventListener('click', (e) => {
    wrapper.classList.toggle('open');
    e.stopPropagation();
  });
}
if (searchBox) {
  searchBox.addEventListener('click', (e) => e.stopPropagation());
  searchBox.addEventListener('input', (e) => {
    const filter = e.target.value.toUpperCase();
    options.forEach(option => {
      const txtValue = option.textContent || option.innerText;
      option.style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
    });
  });
}
options.forEach(option => {
  option.addEventListener('click', (e) => {
    const val = option.getAttribute('data-value');
    trigger.querySelector('span').innerText = option.innerText;
    hiddenInput.value = val;
    wrapper.classList.remove('open');
    e.stopPropagation();
  });
});
window.addEventListener('click', () => {
  if (wrapper) wrapper.classList.remove('open');
});

// Address কপি লজিক
if (sameAddressCheck) {
  sameAddressCheck.addEventListener('change', () => {
    if (sameAddressCheck.checked) {
      permanentAddress.value = presentAddress.value;
      permanentAddress.readOnly = true;
    } else {
      permanentAddress.value = "";
      permanentAddress.readOnly = false;
    }
  });
  presentAddress.addEventListener('input', () => {
    if (sameAddressCheck.checked) permanentAddress.value = presentAddress.value;
  });
}

// Cloudinary ইমেজ আপলোড
async function uploadToCloudinary(file) {
  const cloudName = "dcmu3hius"; 
  const unsignedUploadPreset = "ros_uploads"; 
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", unsignedUploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) throw new Error("Cloudinary ইমেজ আপলোড ব্যর্থ হয়েছে!");
  const data = await res.json();
  return data.secure_url; 
}

// OTP ইনপুট অটো-ফোকাস
const otpFields = document.querySelectorAll('.otp-field');
otpFields.forEach((field, index) => {
  field.addEventListener('input', (e) => {
    if (e.target.value.length === 1 && index < otpFields.length - 1) {
      otpFields[index + 1].focus();
    }
  });
  field.addEventListener('keydown', (e) => {
    if (e.key === "Backspace" && field.value.length === 0 && index > 0) {
      otpFields[index - 1].focus();
    }
  });
});

let savedFormPayload = {}; 
let countdownInterval = null;
let resendCount = 0; 

// টাইমার এবং রিসেন্ড বাটন হ্যান্ডলার ফাংশন
function startOtpEngine() {
  if (countdownInterval) clearInterval(countdownInterval);
  
  const timerDisplay = document.getElementById('otpCountdownTimer');
  const resendBtn = document.getElementById('resendOtpBtn');
  
  let totalSeconds = 5 * 60; 
  resendBtn.disabled = true;
  resendBtn.classList.remove('active');
  
  if(resendCount >= 1) {
    resendBtn.innerText = "Resend OTP (Limit reached)";
  } else {
    resendBtn.innerText = "Resend OTP (Available in 03:00)";
  }

  countdownInterval = setInterval(() => {
    totalSeconds--;
    
    if (totalSeconds <= 0) {
      clearInterval(countdownInterval);
      timerDisplay.innerText = "Time Expired!";
      resendBtn.disabled = true;
      resendBtn.classList.remove('active');
      alert("ওটিপির ৫ মিনিট মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার ট্রাই করুন।");
      return;
    }

    const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    if (timerDisplay) timerDisplay.innerText = `${mins}:${secs}`;

    if (totalSeconds <= 120 && resendCount < 1) {
      resendBtn.disabled = false;
      resendBtn.classList.add('active');
      resendBtn.innerText = "Resend OTP";
    } else if (resendCount < 1) {
      const waitTime = totalSeconds - 120;
      const waitMins = String(Math.floor(waitTime / 60)).padStart(2, '0');
      const waitSecs = String(waitTime % 60).padStart(2, '0');
      resendBtn.innerText = `Resend OTP (Available in ${waitMins}:${waitSecs})`;
    }
  }, 1000);
}

// ওটিপি মডালের ভেতর ডাইনামিক এলিমেন্ট সেটাআপ
function setupOtpModalUi() {
  const otpSection = document.getElementById('otpSection');
  
  if (!document.getElementById('otpCountdownTimer')) {
    const spamBox = document.createElement('div');
    spamBox.className = "spam-notice-box";
    spamBox.innerHTML = `⚠️ যেকোনো কারণে ওটিপি খুঁজে না পেলে অনুগ্রহ করে আপনার ইমেইলের <strong>Spam (স্প্যাম)</strong> বক্সটি চেক করুন।`;
    otpSection.insertBefore(spamBox, otpSection.querySelector('.otp-input-wrapper') || otpSection.querySelector('.btn-submit'));

    const timerWrapper = document.createElement('div');
    timerWrapper.innerHTML = `
      <div class="otp-timer-container">
        ⏱ ওটিপির মেয়াদ বাকি: <span id="otpCountdownTimer" style="font-weight:700; font-family:monospace; font-size:16px;">05:00</span> মিনিট
      </div>
      <div style="text-align:center; margin-bottom:10px;">
        <button id="resendOtpBtn" class="resend-otp-btn" type="button" disabled>Resend OTP</button>
      </div>
    `;
    otpSection.appendChild(timerWrapper);

    document.getElementById('resendOtpBtn').addEventListener('click', async () => {
      if (resendCount >= 1) return;
      
      document.getElementById('rosGlobalLoader').style.display = "flex";
      document.getElementById('rosLoaderText').innerText = "ওটিপি পুনরায় পাঠানো হচ্ছে...";
      
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({ action: "sendOtp", email: savedFormPayload.email, englishName: savedFormPayload.englishName })
        });
        const resData = await response.json();
        
        if (resData.success) {
          resendCount++;
          alert("ওটিপি সফলভাবে পুনরায় পাঠানো হয়েছে!");
          startOtpEngine(); 
        } else {
          alert("ওটিপি পুনরায় পাঠাতে ব্যর্থ হয়েছে: " + resData.error);
        }
      } catch (err) {
        alert("নেটওয়ার্ক ত্রুটি: " + err.message);
      } finally {
        document.getElementById('rosGlobalLoader').style.display = "none";
      }
    });
  }
}

// প্রথম этап: ফর্ম সাবমিশন ও ওটিপি জেনারেশন
registrationForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const photoFile = document.getElementById('profilePhoto').files[0];
  if (photoFile && photoFile.size > 1024 * 1024) { 
    alert("ত্রুটি: প্রোফাইল ছবির সাইজ ১ এমবির বেশি হতে পারবে না!");
    return;
  }

  document.getElementById('rosGlobalLoader').style.display = "flex";
  document.getElementById('rosLoaderText').innerText = "otp পাঠানো হচ্ছে...";

  try {
    const email = document.getElementById('email').value.trim();
    
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "sendOtp", email: email, englishName: document.getElementById('englishName').value })
    });
    const resData = await response.json();

    // ইমেইল অলরেডি রেজিস্টার্ড থাকলে কাস্টম ইউজার-ফ্রেন্ডলি নোটিফিকেশন স্ক্রিন লোড
    if (!resData.success) {
      if (resData.error && (resData.error.includes("already") || resData.error.includes("registered"))) {
        
        document.getElementById('otpSection').style.display = "none";
        document.getElementById('successSection').innerHTML = `
          <div style="text-align: center; padding: 25px 15px; font-family: 'Poppins', 'Hind Siliguri', sans-serif;">
            <div style="font-size: 50px; color: #ff4d6d; margin-bottom: 15px;"><i class="fas fa-exclamation-circle"></i></div>
            <h2 style="color: #fff; font-size: 20px; margin-bottom: 12px; font-family:'Hind Siliguri';">দুঃখিত, নিবন্ধন করা যাচ্ছে না!</h2>
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 25px; line-height:1.6; font-family:'Hind Siliguri';">
              এই ই-মেইলটি দিয়ে আমাদের সিস্টেমে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে। অনুগ্রহ করে অন্য কোনো ইমেল দিয়ে চেষ্টা করুন।
            </p>
            
            <a href="../../Home/" class="btn-go-home" style="display:block; width:100%; padding:12px; margin-bottom: 12px; text-align: center;">
              <i class="fa-solid fa-house"></i> Go Back To Home
            </a>

            <button type="button" id="tryAnotherEmailBtn" style="display:block; width:100%; padding:12px; background: rgba(255,215,0,0.1); color:#ffd700; border: 1px solid #ffd700; border-radius:6px; font-weight:600; cursor:pointer; font-family:inherit; transition: 0.3s; box-sizing: border-box;">
              <i class="fa-solid fa-envelope-open"></i> Try with Another Email
            </button>
          </div>
        `;
        document.getElementById('closeModalBtn').style.display = "block";
        document.getElementById('successSection').style.display = "block";
        document.getElementById('otpModal').classList.add('active');
        
        document.querySelector('#otpModal .modal-content').scrollTop = 0;

        document.getElementById('tryAnotherEmailBtn').addEventListener('click', () => {
          document.getElementById('otpModal').classList.remove('active');
          const emailInput = document.getElementById('email');
          if (emailInput) {
            emailInput.focus();
            emailInput.select();
          }
        });
        
        return; 
      }
      throw new Error(resData.error || "OTP পাঠাতে ব্যর্থ হয়েছে।");
    }

    const uploadedPhotoUrl = photoFile ? await uploadToCloudinary(photoFile) : "";
    const bloodGroupValue = document.getElementById('bloodGroup').value || "";

    savedFormPayload = {
      banglaName: document.getElementById('banglaName').value,
      englishName: document.getElementById('englishName').value,
      fatherName: document.getElementById('fatherName').value,
      motherName: document.getElementById('motherName').value,
      mobileNumber: document.getElementById('mobileNumber').value.trim(),
      email: email,
      bloodGroup: bloodGroupValue,
      gender: document.getElementById('gender').value,
      dob: document.getElementById('dob').value,
      presentAddress: presentAddress.value,
      permanentAddress: permanentAddress.value,
      education: document.getElementById('education').value,
      academicYear: document.getElementById('academicYear').value,
      profession: document.getElementById('profession').value,
      institution: document.getElementById('institution').value,
      whatsappNumber: document.getElementById('whatsappNumber').value || "",
      facebookLink: document.getElementById('facebookLink').value || "",
      nidOrBrn: document.getElementById('nidOrBrn').value || "",
      photoUrl: uploadedPhotoUrl
    };

    setupOtpModalUi();
    resendCount = 0; 
    startOtpEngine(); 

    document.getElementById('otpSection').style.display = "block";
    document.getElementById('successSection').style.display = "none";
    document.getElementById('closeModalBtn').style.display = "block";
    document.getElementById('otpModal').classList.add('active');
    
    document.querySelector('#otpModal .modal-content').scrollTop = 0;
    
    otpFields.forEach(f => f.value = "");
    if (otpFields[0]) otpFields[0].focus();

  } catch (error) {
    alert("রেজিস্ট্রেশন ত্রুটি: " + error.message);
  } finally {
    document.getElementById('rosGlobalLoader').style.display = "none";
  }
});

// দ্বিতীয় этап: ওটিপি ভেরিফাই এবং চূড়ান্ত সাকসেস মেসেজ
document.getElementById('verifyOtpBtn').addEventListener('click', async () => {
  let otpCode = "";
  otpFields.forEach(field => otpCode += field.value);

  if (otpCode.length < 6) {
    alert("অনুগ্রহ করে ৬-ডিজিটের সম্পূর্ণ ওটিপি দিন।");
    return;
  }

  document.getElementById('rosGlobalLoader').style.display = "flex";
  document.getElementById('rosLoaderText').innerText = "নিবন্ধন সম্পন্ন হচ্ছে...";

  try {
    savedFormPayload.action = "register";
    savedFormPayload.otp = otpCode;

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(savedFormPayload)
    });

    const rawText = await response.text();
    let finalRes;
    try {
      finalRes = JSON.parse(rawText);
    } catch (jsonErr) {
      throw new Error("Server returned an invalid format, but the data might be processed.");
    }

    if (finalRes.success) {
      if (countdownInterval) clearInterval(countdownInterval); 
      
      const regNumber = finalRes.memberId || "ROS-2026-____";
      const userEnglishName = savedFormPayload.englishName || "(Name in English)";

      document.getElementById('successSection').innerHTML = `
        <div style="text-align: center; padding: 15px 5px; font-family: 'Poppins', sans-serif;">
          <div style="font-size: 45px; color: #4cc9f0; margin-bottom: 10px;"><i class="fas fa-check-circle"></i></div>
          <h2 style="color: #fff; font-size: 20px; margin-bottom: 5px;">Congratulations!</h2>
          <p style="color: #4cc9f0; font-size: 15px; margin-bottom: 10px;">Your registration was successful.</p>
          <p style="color: #ffd700; font-weight: bold; font-size: 16px; margin-bottom: 15px;">Registration Number: ${regNumber}</p>
          
          <div style="color: #a4b3c6; font-size: 13.5px; text-align: left; line-height: 1.6; background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px; box-sizing:border-box;">
            Dear <strong>${userEnglishName}</strong>,<br><br>
            Your registration with the Rajshahi Olympiad Society has been successfully completed. Thank you sincerely for joining us.<br><br>
            
            <div style="text-align: center; margin: 15px 0;">
              <div style="display: inline-block; background: rgba(243, 156, 18, 0.15); border: 1px solid #f39c12; color: #f39c12; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                <i class="fas fa-clock"></i> Account Status: Pending
              </div>
            </div>

            Your application is currently awaiting verification. Your account will be activated once the admin or president completes the verification process. You will be notified via email once your account is active.<br><br>
            
            May your journey with the Rajshahi Olympiad Registration Society be joyful and successful. Best wishes!<br><br>
            
            <span style="font-size: 13px; color: #fff;">With regard,<br><strong>Rajshahi Olympiad Society</strong></span>
          </div>
          
          <button type="button" class="btn-go-reg-again" id="regAnotherBtn">
            <i class="fa-solid fa-user-plus"></i> Register Another Member
          </button>
          
          <a href="../../Home/" class="btn-go-home" style="margin-top: 5px; margin-bottom: 15px;">
            <i class="fa-solid fa-house"></i> Go Back To Home
          </a>
        </div>
      `;

      document.getElementById('otpSection').style.display = "none";
      document.getElementById('closeModalBtn').style.display = "none"; 
      document.getElementById('successSection').style.display = "block";

      const modalContentBox = document.querySelector('#otpModal .modal-content');
      if (modalContentBox) modalContentBox.scrollTop = 0;

      // ফর্ম এবং কাস্টম ড্রপডাউন রিসেট লজিক
      registrationForm.reset();
      if (trigger) trigger.querySelector('span').innerText = "Select Blood Group";
      if (hiddenInput) hiddenInput.value = "";

      // "Register Another Member" বাটনের কাজ (মডাল বন্ধ করে নতুন ফর্ম এন্ট্রি করতে দেওয়া)
      document.getElementById('regAnotherBtn').addEventListener('click', () => {
        document.getElementById('otpModal').classList.remove('active');
        // সত্যপাঠ চেকবক্স আনচেক এবং সাবমিট বাটন পুনরায় ডিজেবল করা
        const truthCheckbox = document.getElementById("truthCheckbox");
        const submitBtn = document.getElementById("submitBtn");
        if(truthCheckbox) truthCheckbox.checked = false;
        if(submitBtn) submitBtn.disabled = true;
      });

    } else {
      throw new Error(finalRes.error || "ভেরিফিকেশন কোড ভুল হয়েছে।");
    }

  } catch (error) {
    alert("ভেরিফিকেশন ব্যর্থ: " + error.message);
  } finally {
    document.getElementById('rosGlobalLoader').style.display = "none";
  }
});
