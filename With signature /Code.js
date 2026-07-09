// ==========================================
// ১. কন্টেন্ট রেসপন্স রিটার্ন করার কমন ফাংশন (গুগল অ্যাপস স্ক্রিপ্ট স্ট্যান্ডার্ড)
// ==========================================
function renderJsonResponse(responseObj) {
  return ContentService.createTextOutput(JSON.stringify(responseObj))
    .setMimeType(ContentService.MimeType.JSON);
}

// CORS Preflight Handler (ব্রাউজার সিকিউরিটি ম্যাচিং)
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

// ==========================================
// ২. গিটহাব থেকে এইচটিএমএল কন্টেন্ট তুলে আনার ফাংশন
// ==========================================
function fetchHtmlFromGitHub(url) {
  try {
    if (!url) throw new Error("ইউআরএল (URL) পাওয়া যায়নি।");
    const response = UrlFetchApp.fetch(url);
    return response.getContentText();
  } catch (error) {
    Logger.log("গিটহাব থেকে ফাইল লোড করতে ব্যর্থ: " + url + " | এরর: " + error.toString());
    throw new Error("টেমপ্লেট ফাইল লোড করা যায়নি।");
  }
}

// ==========================================
// ৩. মূল doPost Function (রিকোয়েস্ট রাউটার)
// ==========================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const SHEET_NAME = "Users";
    
    if (action === "sendOtp") {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEET_NAME);
      if (sheet) {
        const dataRange = sheet.getDataRange().getValues();
        const inputEmail = data.email.trim().toLowerCase();
        
        for (let i = 1; i < dataRange.length; i++) {
          if (dataRange[i][6]) { // ৭ম কলাম (Index 6) হচ্ছে ইমেইল
            const rowEmail = dataRange[i][6].toString().trim().toLowerCase();
            if (rowEmail === inputEmail) {
              return renderJsonResponse({ 
                success: false, 
                error: "এই ইমেইলটি দিয়ে ইতিমধ্যে নিবন্ধন করা হয়েছে! অনুগ্রহ করে লগইন করুন।" 
              });
            }
          }
        }
      }
      return sendOtpEmail(data.email, data.englishName || "Registrant");
    } else if (action === "register") {
      return handleRegistration(data);
    } else if (action === "login") {
      return handleLogin(data);
    } else if (action === "sendResetOtp") {
      return handleSendResetOtp(data.email);
    } else if (action === "resetPassword") {
      return handleResetPassword(data);
    } else if (action === "updateStatus") {
      return handleStatusUpdate(data);
    }
  } catch (err) {
    return renderJsonResponse({ success: false, error: err.toString() });
  }
}

// SHA-256 পাসওয়ার্ড হ্যাashing ইঞ্জিন
function hashPassword(password) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  let output = "";
  for (let i = 0; i < rawHash.length; i++) {
    let byteValue = rawHash[i];
    if (byteValue < 0) byteValue += 256;
    let byteString = byteValue.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    output += byteString;
  }
  return output;
}

// ==========================================
// ৪. মেম্বার রেজিস্ট্রেশন, লগইন ও স্ট্যাটাস আপডেট
// ==========================================
function handleRegistration(info) {
  const SHEET_NAME = "Users";
  const SETTINGS_SHEET = "Settings";
  const COUNT_SHEET_NAME = "LastCount";

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName(SETTINGS_SHEET);
  const settingsData = settingsSheet.getDataRange().getValues();
  let otpValid = false;
  let otpRowIndex = -1;
  const now = new Date().getTime();

  for (let i = 1; i < settingsData.length; i++) {
    if (settingsData[i][0] === info.email && settingsData[i][1].toString() === info.otp.toString() && now < settingsData[i][2]) {
      otpValid = true;
      otpRowIndex = i + 1;
      break;
    }
  }

  if (!otpValid) {
    return renderJsonResponse({ success: false, error: "অবৈধ অথবা মেয়াদোত্তীর্ণ OTP!" });
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // ২৫তম কলাম হিসেবে "Signature Data" যুক্ত করা হলো
    sheet.appendRow(["Member ID", "Bangla Name", "English Name", "Father Name", "Mother Name", "Mobile", "Email", "Blood Group", "Gender", "DOB", "Present Address", "Permanent Address", "Education", "Academic Year", "Profession", "Institution", "Photo URL", "WhatsApp", "Facebook", "NID/BRN", "Password Hash", "Status", "Role", "Created At", "Signature Data"]);
  }
  
  const currentData = sheet.getDataRange().getValues();
  const targetEmail = info.email.trim().toLowerCase();

  for (let i = 1; i < currentData.length; i++) {
    if (currentData[i][6]) {
      const checkEmail = currentData[i][6].toString().trim().toLowerCase();
      if (checkEmail === targetEmail) {
        return renderJsonResponse({ 
          success: false, 
          error: "দুঃখিত, এই ইমেইলটি দিয়ে ইতিমধ্যে নিবন্ধন সম্পন্ন হয়ে গেছে! অনুগ্রহ করে লগইন করুন।" 
        });
      }
    }
  }

  let countSheet = ss.getSheetByName(COUNT_SHEET_NAME);
  if (!countSheet) {
    countSheet = ss.insertSheet(COUNT_SHEET_NAME);
    countSheet.getRange(1, 1).setValue(0);
  }
  
  let lastCount = parseInt(countSheet.getRange(1, 1).getValue(), 10);
  if (isNaN(lastCount)) lastCount = 0;
  
  const nextNumber = lastCount + 1;
  const currentYear = new Date().getFullYear();
  const memberId = "ROS-" + currentYear + "-" + String(nextNumber).padStart(4, '0');
  
  const hashedPassword = hashPassword(info.password);
  
  // 🕒 বাংলাদেশের সঠিক লোকাল সময়
  const bdTime = Utilities.formatDate(new Date(), "GMT+6", "yyyy-MM-dd HH:mm:ss");

  // ২৫টি কলাম ডেটা অ্যাপেন্ড করা হচ্ছে (স্বাক্ষর সহ)
  sheet.appendRow([
    memberId, info.banglaName, info.englishName, info.fatherName, info.motherName,
    info.mobileNumber, info.email, info.bloodGroup, info.gender, info.dob,
    info.presentAddress, info.permanentAddress, info.education, info.academicYear,
    info.profession, info.institution, info.photoUrl, info.whatsappNumber,
    info.facebookLink, info.nidOrBrn, hashedPassword, "pending", "member", bdTime,
    info.signatureData || "" // Base64 ডিজিটাল স্বাক্ষর ডেটা
  ]);

  countSheet.getRange(1, 1).setValue(nextNumber);

  if (otpRowIndex > -1) settingsSheet.deleteRow(otpRowIndex);

  return renderJsonResponse({ success: true, memberId: memberId });
}

function handleLogin(credentials) {
  const SHEET_NAME = "Users";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return renderJsonResponse({ success: false, error: "কোনো রেজিস্টার্ড ডেটাবেজ খুঁজে পাওয়া যায়নি!" });
  }
  
  const data = sheet.getDataRange().getValues();
  const inputEmail = credentials.email.trim().toLowerCase();
  const inputHash = hashPassword(credentials.password);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][6] && data[i][6].toString().trim().toLowerCase() === inputEmail) {
      if (data[i][20].toString() === inputHash) {
        
        const accountStatus = data[i][21].toString().trim().toLowerCase();
        const userRole = data[i][22].toString().trim().toLowerCase();
        
        const managementRoles = [
          "admin", "president", "vice_president", "general_secretary", 
          "joint_general_secretary", "organizing_secretary", "treasurer", 
          "education_secretary", "event_secretary", "pr_secretary", "it_secretary", "executive_member"
        ];

        if (!managementRoles.includes(userRole)) {
          if (accountStatus === "pending") {
            return renderJsonResponse({ 
              success: false, 
              error: "আপনার আবেদনটি বর্তমানে পেন্ডিং রয়েছে। এডমিন ভেরিফিকেশন সম্পন্ন হলে লগইন করতে পারবেন।" 
            });
          } else if (accountStatus === "suspended") {
            return renderJsonResponse({ 
              success: false, 
              error: "দুঃখিত, আপনার অ্যাকাউন্টটি সাসপেন্ড করা হয়েছে। অনুগ্রহ করে এডমিনের সাথে যোগাযোগ করুন।" 
            });
          } else if (accountStatus === "inactive") {
            return renderJsonResponse({ 
              success: false, 
              error: "আপনার অ্যাকাউন্টটি বর্তমানে ইনঅ্যাক্টিভ রয়েছে।" 
            });
          }
        }
        
        return renderJsonResponse({ 
          success: true, 
          userData: { memberId: data[i][0], banglaName: data[i][1], englishName: data[i][2], email: data[i][6], photoUrl: data[i][16], role: userRole, status: accountStatus } 
        });
        
      } else {
        return renderJsonResponse({ success: false, error: "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।" });
      }
    }
  }
  return renderJsonResponse({ success: false, error: "এই ইমেইল এড্রেস দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।" });
}

function handleStatusUpdate(adminData) {
  const SHEET_NAME = "Users";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return renderJsonResponse({ success: false, error: "ডাটাবেজ পাওয়া যায়নি।" });
  
  const data = sheet.getDataRange().getValues();
  const targetMemberId = adminData.memberId.toString().trim();
  const newStatus = adminData.status.toString().trim().toLowerCase();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim() === targetMemberId) {
      const currentStatus = data[i][21].toString().trim().toLowerCase();
      
      sheet.getRange(i + 1, 22).setValue(newStatus);
      if (newStatus === "active" && currentStatus !== "active") {
        sendApprovalEmail(data[i]);
      }
      return renderJsonResponse({ success: true, message: "স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।" });
    }
  }
  return renderJsonResponse({ success: false, error: "মেম্বার আইডি খুঁজে পাওয়া যায়নি।" });
}

// ==========================================
// ৫. ইমেইল ও ওটিপি ডিসপ্যাচ প্রসেসর
// ==========================================
function sendApprovalEmail(row) {
  const URL_APPROVED_EMAIL    = "https://raw.githubusercontent.com/ros-admin/ROS-Website-Maker/refs/heads/main/Registration/Email/ApprovedEmail.html";
  const URL_APPROVED_PDF      = "https://raw.githubusercontent.com/ros-admin/ROS-Website-Maker/refs/heads/main/Registration/Email/ApprovedEmailPDF.html";

  const memberData = {
    memberId: row[0], banglaName: row[1], englishName: (row[2] || 'MEMBER').toUpperCase(),
    fatherName: row[3], motherName: row[4], mobile: row[5], email: row[6],
    blood: row[7], gender: row[8], dob: row[9], curAddr: row[10], perAddr: row[11], 
    edu: row[12], session: row[13], prof: row[14], inst: row[15], photoUrl: row[16],
    role: row[22] === 'member' ? 'সদস্য' : 'সাধারণ সদস্য',
    createdAt: row[23] ? Utilities.formatDate(new Date(row[23]), "GMT+6", "dd-MM-yyyy") : Utilities.formatDate(new Date(), "GMT+6", "dd-MM-yyyy"),
    signatureData: row[24] || "" // ২৫তম ইন্ডেক্স (Column Y) থেকে ডিজিটাল স্বাক্ষর গ্রহণ
  };

  const photoHtml = memberData.photoUrl ? 
    `<img src="${memberData.photoUrl}" style="width:100%; height:100%; object-fit:cover;">` : 
    `<div style="font-size:10px; color:#777; text-align:center; padding-top:40px;">ছবি নেই</div>`;

  // পিডিএফ-এর জন্য ডিজিটাল স্বাক্ষর ইমেজ জেনারেট করা
  const signatureHtml = memberData.signatureData ? 
    `<img src="${memberData.signatureData}" style="max-width:150px; max-height:60px; object-fit:contain;">` : 
    `<span style="color:#aaa; font-size:12px; font-style:italic;">স্বাক্ষর উপলব্ধ নয়</span>`;

  const now = new Date();
  const formattedTimeStr = `ডাউনলোড সময়: ${Utilities.formatDate(now, "GMT+6", "dd-MM-yyyy")} | সময়: ${Utilities.formatDate(now, "GMT+6", "hh:mm a")}`;

  let emailHtmlBody = fetchHtmlFromGitHub(URL_APPROVED_EMAIL);
  let pdfHtmlTemplate = fetchHtmlFromGitHub(URL_APPROVED_PDF);

  emailHtmlBody = emailHtmlBody.replace(/{{fullName}}/g, row[2]);
  emailHtmlBody = emailHtmlBody.replace("{{memberId}}", memberData.memberId);
  emailHtmlBody = emailHtmlBody.replace("{{createdAt}}", memberData.createdAt);
  emailHtmlBody = emailHtmlBody.replace("{{fatherName}}", memberData.fatherName);
  emailHtmlBody = emailHtmlBody.replace("{{motherName}}", memberData.motherName);
  emailHtmlBody = emailHtmlBody.replace("{{email}}", memberData.email);
  emailHtmlBody = emailHtmlBody.replace("{{gender}}", memberData.gender);
  emailHtmlBody = emailHtmlBody.replace("{{blood}}", memberData.blood);

  let displayGender = memberData.gender === 'Female' ? 'মহিলা' : (memberData.gender === 'Male' ? 'পুরুষ' : memberData.gender);

  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{memberId}}", memberData.memberId);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{createdAt}}", memberData.createdAt);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{role}}", memberData.role);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{photoHtml}}", photoHtml);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{banglaName}}", memberData.banglaName);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{englishName}}", memberData.englishName);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{fatherName}}", memberData.fatherName);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{motherName}}", memberData.motherName);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{mobile}}", memberData.mobile);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{email}}", memberData.email);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{dob}}", memberData.dob);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{blood}}", memberData.blood);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{gender}}", displayGender);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{prof}}", memberData.prof);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{inst}}", memberData.inst);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{edu}}", memberData.edu);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{session}}", memberData.session);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{curAddr}}", memberData.curAddr);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{perAddr}}", memberData.perAddr);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{formattedTimeStr}}", formattedTimeStr);
  
  // পিডিএফে ডিজিটাল সিগনেচার প্লেসহোল্ডার ডাইনামিকালি রিপ্লেস করা
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{signatureHtml}}", signatureHtml);

  const blob = Utilities.newBlob(pdfHtmlTemplate, "text/html", "ROS_Form.html");
  const pdfFile = blob.getAs("application/pdf").setName(`ROS_Form_${memberData.englishName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);

  MailApp.sendEmail({
    to: memberData.email,
    subject: "[ROS] Membership Approved & Verified Form",
    name: "Rajshahi Olympiad Society",
    htmlBody: emailHtmlBody,
    attachments: [pdfFile]
  });
}

function handleSendResetOtp(email) {
  const SHEET_NAME = "Users";
  const SETTINGS_SHEET = "Settings";
  const URL_PASSWORD_RECOVERY = "https://raw.githubusercontent.com/ros-admin/ROS-Website-Maker/refs/heads/main/Registration/Email/PasswordRecoveryOTP.html";

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName(SHEET_NAME);
  if (!userSheet) return renderJsonResponse({ success: false, error: "ডাটাবেজ টেবিল পাওয়া যায়নি।" });
  
  let userExists = false;
  let fullName = "Member";
  const userData = userSheet.getDataRange().getValues();
  const targetEmail = email.trim().toLowerCase();
  
  for (let i = 1; i < userData.length; i++) {
    if (userData[i][6] && userData[i][6].toString().trim().toLowerCase() === targetEmail) { 
      userExists = true; 
      fullName = userData[i][2] || "Member"; 
      break; 
    }
  }
  if (!userExists) return renderJsonResponse({ success: false, error: "এই ইমেইলটি আমাদের সিস্টেমে নিবন্ধিত নয়!" });
  
  let settingsSheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SETTINGS_SHEET);
    settingsSheet.appendRow(["Email", "OTP", "Expiry"]);
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date().getTime() + 5 * 60 * 1000;
  const settingsData = settingsSheet.getDataRange().getValues();
  let found = false;
  
  for (let i = 1; i < settingsData.length; i++) {
    if (settingsData[i][0] === email) { 
      settingsSheet.getRange(i + 1, 2).setValue(otp); 
      settingsSheet.getRange(i + 1, 3).setValue(expiry); 
      found = true; 
      break; 
    }
  }
  if (!found) settingsSheet.appendRow([email, otp, expiry]);

  let htmlBody = fetchHtmlFromGitHub(URL_PASSWORD_RECOVERY);
  htmlBody = htmlBody.replace(/{{fullName}}/g, fullName);
  htmlBody = htmlBody.replace("{{otp}}", otp);
  
  MailApp.sendEmail({ to: email, subject: "[ROS] Password Reset Verification Code", name: "Rajshahi Olympiad Society", htmlBody: htmlBody });
  return renderJsonResponse({ success: true });
}

function handleResetPassword(info) {
  const SHEET_NAME = "Users";
  const SETTINGS_SHEET = "Settings";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName(SETTINGS_SHEET);
  const settingsData = settingsSheet.getDataRange().getValues();
  let otpValid = false; let otpRowIndex = -1; const now = new Date().getTime();
  
  for (let i = 1; i < settingsData.length; i++) {
    if (settingsData[i][0] === info.email && settingsData[i][1].toString() === info.otp.toString() && now < settingsData[i][2]) { 
      otpValid = true; otpRowIndex = i + 1; break; 
    }
  }
  if (!otpValid) return renderJsonResponse({ success: false, error: "ভেরিফিকেশন কোডটি ভুল অথবা মেয়াদ শেষ হয়ে গেছে।" });
  
  const userSheet = ss.getSheetByName(SHEET_NAME);
  const userData = userSheet.getDataRange().getValues();
  const targetEmail = info.email.trim().toLowerCase();
  const newHashedPassword = hashPassword(info.newPassword);
  
  for (let i = 1; i < userData.length; i++) {
    if (userData[i][6] && userData[i][6].toString().trim().toLowerCase() === targetEmail) { 
      userSheet.getRange(i + 1, 21).setValue(newHashedPassword); break; 
    }
  }
  if (otpRowIndex > -1) settingsSheet.deleteRow(otpRowIndex);
  return renderJsonResponse({ success: true });
}

function sendOtpEmail(email, fullName) {
  const SETTINGS_SHEET = "Settings";
  const URL_REGISTRATION_OTP  = "https://raw.githubusercontent.com/ros-admin/ROS-Website-Maker/refs/heads/main/Registration/Email/registrationOTP.html";

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let settingsSheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SETTINGS_SHEET);
    settingsSheet.appendRow(["Email", "OTP", "Expiry"]);
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date().getTime() + 5 * 60 * 1000;
  const data = settingsSheet.getDataRange().getValues();
  let found = false;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      settingsSheet.getRange(i + 1, 2).setValue(otp);
      settingsSheet.getRange(i + 1, 3).setValue(expiry);
      found = true; break;
    }
  }
  if (!found) settingsSheet.appendRow([email, otp, expiry]);

  let htmlBody = fetchHtmlFromGitHub(URL_REGISTRATION_OTP);
  htmlBody = htmlBody.replace(/{{fullName}}/g, fullName);
  htmlBody = htmlBody.replace("{{otp}}", otp);

  MailApp.sendEmail({ to: email, subject: "[ROS] Account Verification Code: " + otp, name: "Rajshahi Olympiad Society", htmlBody: htmlBody });
  return renderJsonResponse({ success: true });
}

// এক্সটার্নাল রিকোয়েস্ট (গিটহাব ফেচ) পারমিশন ট্রিগার করার জন্য ফাংশন
function triggerPermissionCheck() {
  UrlFetchApp.fetch("https://raw.githubusercontent.com");
}
