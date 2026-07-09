const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwkvIfjTQVM69qurRZvF90w_1pq1PaBYDPB8Gv0PCLR3DOyF4Ud8AVzp119agoB8NefpA/exec";

// ১. ড্যাশড স্পিনার লোডার স্টাইল এবং এলিমেন্ট ইনজেকশন
const styleNode = document.createElement('style');
styleNode.innerHTML = `
  .ros-global-loader {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(3, 10, 22, 0.9); display: none;
    flex-direction: column; align-items: center; justify-content: center; z-index: 99999;
  }
  .ros-spinner-container {
    position: relative; width: 110px; height: 110px;
    display: flex; align-items: center; justify-content: center;
  }
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
`;
document.head.appendChild(styleNode);

const globalLoaderDiv = document.createElement('div');
globalLoaderDiv.id = "rosGlobalLoader";
globalLoaderDiv.className = "ros-global-loader";
globalLoaderDiv.innerHTML = `
  <div class="ros-spinner-container">
    <div class="ros-dashed-spinner"></div>
    <img src="https://rosociety.vercel.app/ros%20logo.png" class="ros-spinner-logo" alt="ROS">
  </div>
  <div class="ros-loader-text" id="rosLoaderText">তথ্য যাচাই করা হচ্ছে...</div>
`;
document.body.appendChild(globalLoaderDiv);

// ২. সুন্দর কাস্টম পপআপ নোটিফিকেশন ফাংশন
function showCustomAlert(type, title, message, callback = null) {
  const modal = document.getElementById('rosAlertModal');
  const iconBox = document.getElementById('alertIcon');
  const titleBox = document.getElementById('alertTitle');
  const msgBox = document.getElementById('alertMessage');
  const actionBtn = document.getElementById('alertActionBtn');
  const closeBtn = document.getElementById('closeAlertBtn');

  if (type === 'success') {
    iconBox.innerHTML = '<i class="fas fa-check-circle"></i>';
    iconBox.style.color = '#4cc9f0';
    actionBtn.style.background = '#00a4cc';
  } else {
    iconBox.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    iconBox.style.color = '#ff4d6d';
    actionBtn.style.background = '#ff4d6d';
  }

  titleBox.innerText = title;
  msgBox.innerText = message;
  modal.style.display = 'flex';

  const closeAlert = () => {
    modal.style.display = 'none';
    if (callback) callback();
  };

  actionBtn.onclick = closeAlert;
  closeBtn.onclick = closeAlert;
}

// পাসওয়ার্ড ভিজিবিলিটি টগল
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
if (togglePassword && passwordInput) {
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
  });
}

// ৩. লগইন সাবমিশন ও রোল-ভিত্তিক রিডাইরেকশন লজিক
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = passwordInput.value;
  const loader = document.getElementById('rosGlobalLoader');

  loader.style.display = "flex"; // সুন্দর লোগোওয়ালা স্পিনার চালু

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "login", email: email, password: password })
    });
    const resData = await response.json();

    if (resData.success) {
      // সেশন ডাটা ব্রাউজারে সংরক্ষণ করা
      const storage = document.getElementById('rememberMe').checked ? localStorage : sessionStorage;
      storage.setItem('ros_user', JSON.stringify(resData.userData));

      loader.style.display = "none"; // লোডার বন্ধ

      // সুন্দর পপআপ নোটিফিকেশন প্রদর্শন
      showCustomAlert('success', 'লগইন সফল!', `স্বাগতম, ${resData.userData.banglaName}। আপনার ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...`, () => {
        
        // রোল (Role) অনুযায়ী ডাইনামিক ড্যাশবোর্ড রিডাইরেকশন
        const role = resData.userData.role.toLowerCase();
        
        if (role === 'admin') {
          window.location.href = "../AdminDashboard/";
        } else if (role === 'member') {
          window.location.href = "../MemberDashboard/";
        } else {
          // ম্যানেজমেন্টের অন্যান্য স্পেসিফিক রোলগুলোর জন্য জেনারেল এক্সিকিউটিভ ড্যাশবোর্ড
          window.location.href = "../Dashboard/Management/";
        }
      });
    } else {
      loader.style.display = "none";
      showCustomAlert('error', 'লগইন ব্যর্থ!', resData.error);
    }
  } catch (err) {
    loader.style.display = "none";
    showCustomAlert('error', 'নেটওয়ার্ক ত্রুটি!', 'ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।');
  }
});
