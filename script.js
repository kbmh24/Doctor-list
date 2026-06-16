// ১. পেজ লোড হওয়ার পর ড্রপডাউন পপুলেট করা
window.onload = () => {
    if (typeof doctors === 'undefined') {
        console.error("ডাটাবেজ ফাইল (data.js) পাওয়া যায়নি!");
        return;
    }
    
    const selectors = ['deptSelectDay', 'deptSelectFee', 'deptSelectFull'];
    const depts = [...new Set(doctors.map(d => d.dept))].sort();
    
    selectors.forEach(sId => {
        const el = document.getElementById(sId);
        if (el) {
            depts.forEach(d => {
                const option = document.createElement('option');
                option.value = d;
                option.textContent = d;
                el.appendChild(option);
            });
        }
    });
};

// ২. সেকশন পরিবর্তনের লজিক
function showSection(id, btn) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active-link'));
    btn.classList.add('active-link');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ৩. ডাক্তার কার্ড জেনারেটর ফাংশন
function createDocCard(doc, currentSchedule = null) {
    // যদি শিডিউল নির্দিষ্ট না থাকে (সার্চের ক্ষেত্রে), তবে সব দিনের নাম দেখাবে
    const scheduleBadges = currentSchedule 
        ? `<span class="badge badge-time"><i class="fa-solid fa-clock"></i> ${currentSchedule.time}</span>
           <span class="badge badge-room"><i class="fa-solid fa-door-open"></i> রুম: ${currentSchedule.room}</span>`
        : `<div style="font-size:12px; color:#64748b; margin-top:8px;"><b>শিডিউল:</b> ${doc.schedules.map(s => s.day).join(', ')}</div>`;

    return `
        <div class="doctor-card">
            <div class="doc-name">${doc.name}</div>
            <div class="doc-spec">${doc.spec}</div>
            <div class="card-meta">
                <span class="badge"><i class="fa-solid fa-stethoscope"></i> ${doc.dept}</span>
                <span class="badge badge-fee"><i class="fa-solid fa-wallet"></i> ফি: ${doc.fee1}/-</span>
                ${scheduleBadges}
            </div>
            <div style="font-size:12px; color:#94a3b8;">${doc.from}</div>
        </div>`;
}

// ৪. সার্চ লজিক
function searchDoctors() {
    const query = document.getElementById('mainSearch').value.toLowerCase();
    const results = document.getElementById('searchResults');
    
    if(query.length < 2) { 
        results.innerHTML = ''; 
        return; 
    }

    const filtered = doctors.filter(d => 
        d.name.toLowerCase().includes(query) || 
        d.dept.toLowerCase().includes(query) ||
        d.spec.toLowerCase().includes(query)
    );

    results.innerHTML = filtered.length 
        ? filtered.map(d => createDocCard(d)).join('') 
        : '<div class="no-data">কোন ডাক্তার বা বিভাগ পাওয়া যায়নি।</div>';
}

// ৫. দিনের ফিল্টার লজিক (সকাল/বিকাল ভাগ করা)
function filterDay() {
    const day = document.getElementById('daySelect').value;
    const dept = document.getElementById('deptSelectDay').value;
    const res = document.getElementById('dayResults');
    
    if(!day) { 
        res.innerHTML = '<div class="no-data">অনুগ্রহ করে একটি দিন সিলেক্ট করুন।</div>'; 
        return; 
    }

    const filtered = doctors.filter(d => 
        (!dept || d.dept === dept) && 
        d.schedules.some(s => s.day === day)
    );
    
    let morningHtml = "";
    let afternoonHtml = "";

    filtered.forEach(d => {
        const s = d.schedules.find(sc => sc.day === day);
        // লজিক: AM থাকলে বা দুপুর ১টার আগে হলে সকালের তালিকায়
        if(s.time.includes("AM") && !s.time.startsWith("12")) {
            morningHtml += createDocCard(d, s);
        } else {
            afternoonHtml += createDocCard(d, s);
        }
    });

    res.innerHTML = `
        <div class="shift-title shift-morning"><i class="fa-solid fa-sun"></i> সকালের তালিকা</div>
        ${morningHtml || '<div style="padding:10px; color:#94a3b8;">সকালে কোন ডাক্তার নেই।</div>'}
        <div class="shift-title shift-afternoon"><i class="fa-solid fa-moon"></i> বিকাল ও সন্ধ্যার তালিকা</div>
        ${afternoonHtml || '<div style="padding:10px; color:#94a3b8;">বিকালে কোন ডাক্তার নেই।</div>'}
    `;
}

// ৬. ফি ফিল্টার লজিক
function filterFees() {
    const dept = document.getElementById('deptSelectFee').value;
    const res = document.getElementById('feeResults');
    
    if(!dept) { 
        res.innerHTML = ''; 
        return; 
    }

    const filtered = doctors.filter(d => d.dept === dept);
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>ডাক্তারের নাম</th>
                    <th>নতুন ভিজিট</th>
                    <th>পুরাতন ভিজিট</th>
                </tr>
            </thead>
            <tbody>`;
            
    filtered.forEach(d => {
        html += `
            <tr>
                <td><strong>${d.name}</strong><br><small>${d.spec}</small></td>
                <td><b style="color:var(--accent)">${d.fee1}/-</b></td>
                <td>${d.fee2 > 0 ? d.fee2 + '/-' : '---'}</td>
            </tr>`;
    });

    res.innerHTML = html + `</tbody></table>`;
}

// ৭. পূর্ণাঙ্গ শিডিউল লজিক
function updateDocList() {
    const dept = document.getElementById('deptSelectFull').value;
    const docSelect = document.getElementById('doctorSelect');
    docSelect.innerHTML = '<option value="">ডাক্তার সিলেক্ট করুন</option>';
    
    doctors.filter(d => d.dept === dept).forEach(d => {
        const option = document.createElement('option');
        option.value = d.name;
        option.textContent = d.name;
        docSelect.appendChild(option);
    });
    document.getElementById('fullResults').innerHTML = "";
}

function showFullSchedule() {
    const name = document.getElementById('doctorSelect').value;
    const res = document.getElementById('fullResults');
    
    if(!name) return;
    
    const d = doctors.find(doc => doc.name === name);
    res.innerHTML = `
        <div class="doctor-card" style="border-left-color: var(--accent);">
            <div class="doc-name">${d.name}</div>
            <div class="doc-spec">${d.spec}</div>
            <div style="background:#f1f5f9; padding:15px; border-radius:10px; margin-top:15px;">
                <h4 style="margin:0 0 10px 0; color:var(--primary);">সাপ্তাহিক চেম্বার সময়:</h4>
                ${d.schedules.map(s => `
                    <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #e2e8f0; font-size:14px;">
                        <span><b>${s.day}</b></span>
                        <span>${s.time} (রুম: ${s.room})</span>
                    </div>
                `).join('')}
                <div style="margin-top:12px; font-weight:bold; color:var(--accent);">
                    ভিজিট ফি: ${d.fee1}/- ${d.fee2 > 0 ? `(পুরাতন: ${d.fee2}/-)` : ''}
                </div>
            </div>
            <div style="margin-top:10px; font-size:13px; color:#64748b;">${d.from}</div>
        </div>`;
}
