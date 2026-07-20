// ==========================================
// ১. কন্টেন্ট রেসপন্স রিটার্ন করার কমন ফাংশন
// ==========================================
function renderJsonResponse(responseObj) {
  return ContentService.createTextOutput(JSON.stringify(responseObj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

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
// ৩. মূল doGet Function
// ==========================================
function doGet(e) {
  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === "getAdmins") {
      const sheet = ss.getSheetByName("AdminList");
      if (!sheet) return renderJsonResponse({ success: true, admins: [] });
      
      const data = sheet.getDataRange().getValues();
      const admins = [];
      for (let i = 1; i < data.length; i++) {
        admins.push({
          englishName: data[i][0], email: data[i][1], mobile: data[i][2],
          username: data[i][3], role: data[i][4], photoUrl: data[i][5]
        });
      }
      return renderJsonResponse({ success: true, admins: admins });
    }
  } catch (err) {
    return renderJsonResponse({ success: false, error: err.toString() });
  }
}

// ==========================================
// ৪. মূল doPost Function
// ==========================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    let adminSheet = ss.getSheetByName("AdminList");
    if (!adminSheet) {
      adminSheet = ss.insertSheet("AdminList");
      adminSheet.appendRow(["Full Name", "Email", "Mobile", "Username", "Role", "Photo URL", "Password Hash"]);
      adminSheet.appendRow([
        "Rajshahi Olympiad Society", "helpline.ros@gmail.com", "01700000000", "rosadmin", "super_admin", "", ""
      ]);
    }

    if (action === "getUsersData") {
      const sheet = ss.getSheetByName("Users");
      if (!sheet) return renderJsonResponse({ success: true, data: [] });
      
      const dataRange = sheet.getDataRange().getValues();
      const usersArray = [];
      
      for (let i = 1; i < dataRange.length; i++) {
        const row = dataRange[i];
        if (!row[0]) continue; 
        
        usersArray.push({
          memberId: row[0],         
          banglaName: row[1],
          englishName: row[2],      
          fatherName: row[3],
          motherName: row[4],
          mobile: row[5],           
          email: row[6],            
          bloodGroup: row[7],
          gender: row[8],           
          dob: row[9] ? (row[9] instanceof Date ? Utilities.formatDate(row[9], "GMT+6", "yyyy-MM-dd") : row[9].toString()) : "",
          presentAddress: row[10],
          permanentAddress: row[11],
          education: row[12],
          academicYear: row[13],
          profession: row[14],
          institution: row[15],
          photoUrl: row[16],
          whatsappNumber: row[17],
          facebookLink: row[18],
          nidOrBrn: row[19],
          status: row[20],
          role: row[21],
          registrationDate: row[22] ? Utilities.formatDate(new Date(row[22]), "GMT+6", "yyyy-MM-dd HH:mm:ss") : "",
          statusReason: row[23] || "" // Created At এর পরের ঘরে Status Reason
        });
      }
      return renderJsonResponse({ success: true, data: usersArray });
    }

    // --- ক) সাধারণ ইউজার মেম্বারশিপ রুট ---
    if (action === "sendOtp") {
      const sheet = ss.getSheetByName("Users");
      if (sheet) {
        const dataRange = sheet.getDataRange().getValues();
        const inputEmail = data.email ? data.email.trim().toLowerCase() : "";
        if (inputEmail) {
          for (let i = 1; i < dataRange.length; i++) {
            if (dataRange[i][6] && dataRange[i][6].toString().trim().toLowerCase() === inputEmail) {
              return renderJsonResponse({ success: false, error: "This email is already registered. Please use another email." });
            }
          }
        }
      }
      return sendOtpEmail(data.email, data.englishName || "Registrant");
    } 
    
    else if (action === "register") {
      return handleRegistration(data);
    } 
    
    else if (action === "updateStatus") {
      return handleStatusUpdate(data);
    }

    // --- এডমিন বিশেষ মেম্বার ম্যানেজমেন্ট রাউট ---
    else if (action === "adminAddMember") {
      return handleAdminAddMember(data);
    }

    else if (action === "adminUpdateMember") {
      return handleAdminUpdateMember(data);
    }

    // --- খ) অ্যাডমিন প্যানেল রুটস ---
    else if (action === "adminLogin") {
      const rows = adminSheet.getDataRange().getValues();
      const inputUser = data.username.trim().toLowerCase();
      const inputHash = hashPassword(data.password);
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][3].toString().trim().toLowerCase() === inputUser) {
          if (rows[i][6].toString() === "") {
            return renderJsonResponse({ success: false, error: "আপনার পাসওয়ার্ড সেট করা নেই। দয়া করে Forgot Password ব্যবহার করে পাসওয়ার্ড সেট করুন।" });
          }
          if (rows[i][6].toString() === inputHash) {
            return renderJsonResponse({
              success: true,
              adminData: { englishName: rows[i][0], email: rows[i][1], mobile: rows[i][2], username: rows[i][3], role: rows[i][4], photoUrl: rows[i][5] }
            });
          }
        }
      }
      return renderJsonResponse({ success: false, error: "ভুল ইউজারনেম অথবা পাসওয়ার্ড!" });
    }

    else if (action === "createAdmin") {
      const rows = adminSheet.getDataRange().getValues();
      const targetUser = data.username.trim().toLowerCase();
      const targetEmail = data.email.trim().toLowerCase();
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][3].toString().trim().toLowerCase() === targetUser) {
          return renderJsonResponse({ success: false, error: "এই ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হয়েছে!" });
        }
      }
      
      const assignedRole = (targetEmail === "helpline.ros@gmail.com") ? "super_admin" : "admin";
      
      adminSheet.appendRow([
        data.englishName, data.email, data.mobile, targetUser, assignedRole, data.photoUrl, hashPassword(data.password)
      ]);
      return renderJsonResponse({ success: true });
    }

    else if (action === "deleteAdmin") {
      const rows = adminSheet.getDataRange().getValues();
      const targetUser = data.username.trim().toLowerCase();
      if (targetUser === "rosadmin") {
        return renderJsonResponse({ success: false, error: "প্রধান রুট সুপার অ্যাডমিন প্রোফাইলটি ডিলিট করা অসম্ভব!" });
      }
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][3].toString().trim().toLowerCase() === targetUser) {
          adminSheet.deleteRow(i + 1);
          return renderJsonResponse({ success: true });
        }
      }
      return renderJsonResponse({ success: false, error: "অ্যাডমিন খুঁজে পাওয়া যায়নি।" });
    }

    else if (action === "changeAdminPassword") {
      const rows = adminSheet.getDataRange().getValues();
      const targetUser = data.username.trim().toLowerCase();
      const newHash = hashPassword(data.newPassword);
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][3].toString().trim().toLowerCase() === targetUser) {
          adminSheet.getRange(i + 1, 7).setValue(newHash);
          return renderJsonResponse({ success: true });
        }
      }
      return renderJsonResponse({ success: false, error: "অ্যাডমিন অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।" });
    }

    else if (action === "sendAdminResetOtp") {
      const rows = adminSheet.getDataRange().getValues();
      const inputUser = data.username.trim().toLowerCase();
      let foundAdmin = null;
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][3].toString().trim().toLowerCase() === inputUser) {
          foundAdmin = { name: rows[i][0], email: rows[i][1] };
          break;
        }
      }
      if (!foundAdmin) return renderJsonResponse({ success: false, error: "এই ইউজারনেমের কোনো অ্যাডমিন পাওয়া যায়নি!" });

      let settingsSheet = ss.getSheetByName("Settings");
      if (!settingsSheet) {
        settingsSheet = ss.insertSheet("Settings");
        settingsSheet.appendRow(["Identifier", "OTP", "Expiry"]);
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date().getTime() + 5 * 60 * 1000;

      settingsSheet.appendRow([inputUser, otp, expiry]);

      const URL_ADMIN_RESET_EMAIL = "https://raw.githubusercontent.com/ros-admin/ROS-Website-Maker/refs/heads/main/Registration/Email/PasswordRecoveryOTP.html";
      let emailHtmlBody = fetchHtmlFromGitHub(URL_ADMIN_RESET_EMAIL);
      
      emailHtmlBody = emailHtmlBody.replace(/{{fullName}}/g, foundAdmin.name);
      emailHtmlBody = emailHtmlBody.replace(/{{otp}}/g, otp);

      MailApp.sendEmail({
        to: foundAdmin.email,
        subject: "[ROS Panel] Password Reset OTP Code",
        name: "Rajshahi Olympiad Society",
        htmlBody: emailHtmlBody
      });
      return renderJsonResponse({ success: true });
    }

    else if (action === "resetAdminPassword") {
      const rows = adminSheet.getDataRange().getValues();
      const inputUser = data.username.trim().toLowerCase();
      const finalHash = hashPassword(data.newPassword);
      
      if (data.otp && data.otp.toString() === "DIRECT") {
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][3].toString().trim().toLowerCase() === inputUser) {
            adminSheet.getRange(i + 1, 7).setValue(finalHash);
            return renderJsonResponse({ success: true, message: "পাসওয়ার্ড সরাসরি পরিবর্তন করা হয়েছে।" });
          }
        }
        return renderJsonResponse({ success: false, error: "অ্যাডমিন অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।" });
      } 
      
      else {
        const otpSheet = ss.getSheetByName("Settings");
        if (!otpSheet) return renderJsonResponse({ success: false, error: "ওটিপি সিস্টেম ত্রুটি।" });

        const otpData = otpSheet.getDataRange().getValues();
        let isValid = false;
        let targetRowIndex = -1;
        const now = new Date().getTime();

        for (let i = 1; i < otpData.length; i++) {
          if (otpData[i][0].toString().trim().toLowerCase() === inputUser && otpData[i][1].toString() === data.otp.toString() && now < otpData[i][2]) {
            isValid = true;
            targetRowIndex = i + 1;
            break;
          }
        }

        if (!isValid) return renderJsonResponse({ success: false, error: "ভুল অথবা মেয়াদোত্তীর্ণ OTP কোড!" });

        for (let i = 1; i < rows.length; i++) {
          if (rows[i][3].toString().trim().toLowerCase() === inputUser) {
            adminSheet.getRange(i + 1, 7).setValue(finalHash);
            if (targetRowIndex > -1) otpSheet.deleteRow(targetRowIndex); 
            return renderJsonResponse({ success: true });
          }
        }
        return renderJsonResponse({ success: false, error: "অ্যাডমিন অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।" });
      }
    }

  } catch (err) {
    return renderJsonResponse({ success: false, error: err.toString() });
  }
}

// ==========================================
// ৫. মেম্বার নিবন্ধন ও স্ট্যাটাস আপডেট হ্যান্ডলার
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

  if (!otpValid) return renderJsonResponse({ success: false, error: "অবৈধ অথবা মেয়াদোত্তীর্ণ OTP!" });

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Member ID", "Bangla Name", "English Name", "Father Name", "Mother Name", "Mobile", "Email", "Blood Group", "Gender", "DOB", "Present Address", "Permanent Address", "Education", "Academic Year", "Profession", "Institution", "Photo URL", "WhatsApp", "Facebook", "NID/BRN", "Status", "Role", "Created At", "Status Reason"]);
  }
  
  const currentData = sheet.getDataRange().getValues();
  const targetEmail = info.email ? info.email.trim().toLowerCase() : "";

  if (targetEmail) {
    for (let i = 1; i < currentData.length; i++) {
      if (currentData[i][6] && currentData[i][6].toString().trim().toLowerCase() === targetEmail) {
        return renderJsonResponse({ success: false, error: "This email is already registered. Please use another email." });
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
  
  const bdTime = Utilities.formatDate(new Date(), "GMT+6", "yyyy-MM-dd HH:mm:ss");

  // নিবন্ধন হওয়ার পর পেন্ডিং অবস্থায় থাকবে
  sheet.appendRow([
    memberId, info.banglaName || "", info.englishName || "", info.fatherName || "", info.motherName || "",
    info.mobileNumber || "", info.email || "", info.bloodGroup || "", info.gender || "", info.dob || "",
    info.presentAddress || "", info.permanentAddress || "", info.education || "", info.academicYear || "",
    info.profession || "", info.institution || "", info.photoUrl || "", info.whatsappNumber || "",
    info.facebookLink || "", info.nidOrBrn || "", "pending", "member", bdTime, "Pending Approval"
  ]);

  countSheet.getRange(1, 1).setValue(nextNumber);
  if (otpRowIndex > -1) settingsSheet.deleteRow(otpRowIndex);

  return renderJsonResponse({ success: true, memberId: memberId });
}

// এডমিন কর্তৃক সরাসরি নতুন মেম্বার সংযোজন
function handleAdminAddMember(info) {
  const SHEET_NAME = "Users";
  const COUNT_SHEET_NAME = "LastCount";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Member ID", "Bangla Name", "English Name", "Father Name", "Mother Name", "Mobile", "Email", "Blood Group", "Gender", "DOB", "Present Address", "Permanent Address", "Education", "Academic Year", "Profession", "Institution", "Photo URL", "WhatsApp", "Facebook", "NID/BRN", "Status", "Role", "Created At", "Status Reason"]);
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
  
  const bdTime = Utilities.formatDate(new Date(), "GMT+6", "yyyy-MM-dd HH:mm:ss");

  const rowData = [
    memberId, info.banglaName || "", info.englishName || "", info.fatherName || "", info.motherName || "",
    info.mobileNumber || "", info.email || "", info.bloodGroup || "", info.gender || "", info.dob || "",
    info.presentAddress || "", info.permanentAddress || "", info.education || "", info.academicYear || "",
    info.profession || "", info.institution || "", info.photoUrl || "", info.whatsappNumber || "",
    info.facebookLink || "", info.nidOrBrn || "", "active", "member", bdTime, "Ok"
  ];

  sheet.appendRow(rowData);
  countSheet.getRange(1, 1).setValue(nextNumber);

  // যদি ইমেইল থাকে তবে ইমেইলে এপ্রুভাল মেসেজ পাঠানো হবে
  if (info.email && info.email.trim() !== "") {
    try {
      sendApprovalEmail(rowData);
    } catch(err) {
      Logger.log("Email dispatch failed: " + err.toString());
    }
  }

  return renderJsonResponse({ success: true, memberId: memberId });
}

// এডমিন কর্তৃক মেম্বারের তথ্য এডিট/আপডেট করা
function handleAdminUpdateMember(info) {
  const SHEET_NAME = "Users";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return renderJsonResponse({ success: false, error: "ডাটাবেজ পাওয়া যায়নি।" });

  const data = sheet.getDataRange().getValues();
  const targetMemberId = info.memberId.toString().trim();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim() === targetMemberId) {
      const rowIndex = i + 1;
      if (info.banglaName !== undefined) sheet.getRange(rowIndex, 2).setValue(info.banglaName);
      if (info.englishName !== undefined) sheet.getRange(rowIndex, 3).setValue(info.englishName);
      if (info.fatherName !== undefined) sheet.getRange(rowIndex, 4).setValue(info.fatherName);
      if (info.motherName !== undefined) sheet.getRange(rowIndex, 5).setValue(info.motherName);
      if (info.mobile !== undefined) sheet.getRange(rowIndex, 6).setValue(info.mobile);
      if (info.email !== undefined) sheet.getRange(rowIndex, 7).setValue(info.email);
      if (info.bloodGroup !== undefined) sheet.getRange(rowIndex, 8).setValue(info.bloodGroup);
      if (info.gender !== undefined) sheet.getRange(rowIndex, 9).setValue(info.gender);
      if (info.dob !== undefined) sheet.getRange(rowIndex, 10).setValue(info.dob);
      if (info.presentAddress !== undefined) sheet.getRange(rowIndex, 11).setValue(info.presentAddress);
      if (info.permanentAddress !== undefined) sheet.getRange(rowIndex, 12).setValue(info.permanentAddress);
      if (info.education !== undefined) sheet.getRange(rowIndex, 13).setValue(info.education);
      if (info.academicYear !== undefined) sheet.getRange(rowIndex, 14).setValue(info.academicYear);
      if (info.profession !== undefined) sheet.getRange(rowIndex, 15).setValue(info.profession);
      if (info.institution !== undefined) sheet.getRange(rowIndex, 16).setValue(info.institution);
      if (info.photoUrl !== undefined) sheet.getRange(rowIndex, 17).setValue(info.photoUrl);
      if (info.whatsappNumber !== undefined) sheet.getRange(rowIndex, 18).setValue(info.whatsappNumber);
      if (info.facebookLink !== undefined) sheet.getRange(rowIndex, 19).setValue(info.facebookLink);
      if (info.nidOrBrn !== undefined) sheet.getRange(rowIndex, 20).setValue(info.nidOrBrn);

      return renderJsonResponse({ success: true, message: "মেম্বারের তথ্য সফলভাবে আপডেট করা হয়েছে।" });
    }
  }
  return renderJsonResponse({ success: false, error: "মেম্বার আইডি খুঁজে পাওয়া যায়নি।" });
}

// স্ট্যাটাস ও কারণ আপডেট হ্যান্ডলার
function handleStatusUpdate(adminData) {
  const SHEET_NAME = "Users";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return renderJsonResponse({ success: false, error: "ডাটাবেজ পাওয়া যায়নি।" });
  
  const data = sheet.getDataRange().getValues();
  const targetMemberId = adminData.memberId.toString().trim();
  const newStatus = adminData.status.toString().trim().toLowerCase();
  
  // Active হলে কারণ হবে "Ok", অন্যথায় ক্লায়েন্ট থেকে পাঠানো কারণ ব্যবহার করা হবে
  let reason = (newStatus === "active") ? "Ok" : (adminData.reason || "Updated by admin");

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim() === targetMemberId) {
      const currentStatus = data[i][20].toString().trim().toLowerCase();
      
      sheet.getRange(i + 1, 21).setValue(newStatus); // Status Column
      sheet.getRange(i + 1, 24).setValue(reason);    // Status Reason Column (Created At এর পরের ঘর)
      
      if (newStatus === "active" && currentStatus !== "active") {
        if (data[i][6] && data[i][6].toString().trim() !== "") {
          sendApprovalEmail(data[i]);
        }
      }
      return renderJsonResponse({ success: true, message: "স্ট্যাটাস এবং কারণ সফলভাবে আপডেট করা হয়েছে।" });
    }
  }
  return renderJsonResponse({ success: false, error: "মেম্বার আইডি খুঁজে পাওয়া যায়নি।" });
}

// ==========================================
// ৬. ইমেইল ডিসপ্যাচ প্রসেসর
// ==========================================
function sendApprovalEmail(row) {
  const URL_APPROVED_EMAIL    = "https://raw.githubusercontent.com/ros-admin/ROS-Website-Maker/refs/heads/main/Registration/Email/ApprovedEmail.html";
  const URL_APPROVED_PDF      = "https://raw.githubusercontent.com/ros-admin/ROS-Website-Maker/refs/heads/main/Registration/Email/ApprovedEmailPDF.html";

  const memberData = {
    memberId: row[0], banglaName: row[1], englishName: (row[2] || 'MEMBER').toUpperCase(),
    fatherName: row[3], motherName: row[4], mobile: row[5], email: row[6],
    blood: row[7], gender: row[8], dob: row[9], curAddr: row[10], perAddr: row[11], 
    edu: row[12], session: row[13], prof: row[14], inst: row[15], photoUrl: row[16],
    role: row[21] === 'member' ? 'সদস্য' : 'সাধারণ সদস্য',
    createdAt: row[22] ? Utilities.formatDate(new Date(row[22]), "GMT+6", "dd-MM-yyyy") : Utilities.formatDate(new Date(), "GMT+6", "dd-MM-yyyy")
  };

  if (!memberData.email || memberData.email.trim() === "") return;

  const photoHtml = memberData.photoUrl ? 
    `<img src="${memberData.photoUrl}" style="width:100%; height:100%; object-fit:cover;">` : 
    `<div style="font-size:10px; color:#777; text-align:center; padding-top:40px;">ছবি নেই</div>`;

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

  const regParts = memberData.memberId.split("-");
  const regPart1 = regParts[0] || "ROS";
  const regPart2 = regParts[1] || "2026";
  const regPart3 = regParts[2] || "0000";

  let cleanMobile = memberData.mobile ? memberData.mobile.toString().replace(/[^0-9]/g, "") : "";
  if (cleanMobile.startsWith("880")) cleanMobile = cleanMobile.substring(3);
  if (!cleanMobile.startsWith("0") && cleanMobile.length === 10) cleanMobile = "0" + cleanMobile;
  cleanMobile = cleanMobile.padEnd(11, " ");
  const mDigits = cleanMobile.split("");

  let dobDigits = [" ", " ", " ", " ", " ", " ", " ", " "];
  let dobText = "";
  if (memberData.dob) {
    if (memberData.dob instanceof Date) {
      const d = String(memberData.dob.getDate()).padStart(2, '0');
      const m = String(memberData.dob.getMonth() + 1).padStart(2, '0');
      const y = String(memberData.dob.getFullYear());
      dobText = `${d}.${m}.${y}`;
      dobDigits = (d + m + y).split("");
    } else {
      dobText = memberData.dob.toString();
      const cleanDob = dobText.replace(/[^0-9]/g, "");
      if (cleanDob.length >= 8) {
        dobDigits = cleanDob.substring(0, 8).split("");
      }
    }
  }

  let regDateDigits = [" ", " ", " ", " ", " ", " ", " ", " "];
  if (memberData.createdAt) {
    const cleanRegDate = memberData.createdAt.replace(/[^0-9]/g, "");
    if (cleanRegDate.length >= 8) {
      regDateDigits = cleanRegDate.substring(0, 8).split("");
    }
  }

  const qrRawText = `--- ROS MEMBER VERIFICATION ---
Reg No: ${memberData.memberId}
Date: ${memberData.createdAt}
Status: ACTIVE
Name: ${memberData.englishName}
Mobile: ${memberData.mobile}
Email: ${memberData.email}
Blood: ${memberData.blood}`;
  const qrCodeUrl = "https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=" + encodeURIComponent(qrRawText) + "&choe=UTF-8";

  let displayGender = memberData.gender === 'Female' ? 'মহিলা' : (memberData.gender === 'Male' ? 'পুরুষ' : memberData.gender);
  const isMale = (memberData.gender === 'Male' || memberData.gender === 'পুরুষ') ? "✓" : "&nbsp;";
  const isFemale = (memberData.gender === 'Female' || memberData.gender === 'মহিলা') ? "✓" : "&nbsp;";

  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{memberId}}/g, memberData.memberId);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{createdAt}}/g, memberData.createdAt);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{role}}/g, memberData.role);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{photoHtml}}/g, photoHtml);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{banglaName}}/g, memberData.banglaName);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{englishName}}/g, memberData.englishName);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{fatherName}}/g, memberData.fatherName);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{motherName}}/g, memberData.motherName);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{mobile}}/g, memberData.mobile);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{email}}/g, memberData.email);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{blood}}/g, memberData.blood);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{gender}}/g, displayGender);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{prof}}/g, memberData.prof);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{inst}}/g, memberData.inst);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{edu}}/g, memberData.edu);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{session}}/g, memberData.session);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{curAddr}}/g, memberData.curAddr);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{perAddr}}/g, memberData.perAddr);
  pdfHtmlTemplate = pdfHtmlTemplate.replace(/{{formattedTimeStr}}/g, formattedTimeStr);
  
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{regPart1}}", regPart1);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{regPart2}}", regPart2);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{regPart3}}", regPart3);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{dobText}}", dobText);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{qrCodeUrl}}", qrCodeUrl);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{isMale}}", isMale);
  pdfHtmlTemplate = pdfHtmlTemplate.replace("{{isFemale}}", isFemale);

  for (let m = 0; m < 11; m++) {
    pdfHtmlTemplate = pdfHtmlTemplate.replace(`{{m${m}}}`, mDigits[m] || " ");
  }
  for (let d = 0; d < 8; d++) {
    pdfHtmlTemplate = pdfHtmlTemplate.replace(`{{d${d}}}`, dobDigits[d] || " ");
  }
  for (let r = 0; r < 8; r++) {
    pdfHtmlTemplate = pdfHtmlTemplate.replace(`{{r${r}}}`, regDateDigits[r] || " ");
  }

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

function triggerPermissionCheck() {
  UrlFetchApp.fetch("https://raw.githubusercontent.com");
}