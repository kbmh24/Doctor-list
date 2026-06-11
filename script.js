window.onload = () => {
    const selectors = ['deptSelectDay', 'deptSelectFee', 'deptSelectFull'];
    selectors.forEach(sId => {
        const el = document.getElementById(sId);
        if (el) {
            depts.forEach(d => el.innerHTML += `<option value="${d}">${d}</option>`);
        }
    });
};

function showSection(id, btn) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active-link'));
    btn.classList.add('active-link');
    window.scrollTo(0,0);
}

function createDocListItem(doc, schedule) {
    return `
        <div class="doctor-card">
            <div class="doc-name">${doc.name}</div>
            <div class="doc-spec">${doc.spec}</div>
            <div class="card-meta">
                <span class="badge"><i class="fa-solid fa-stethoscope"></i> ${doc.dept}</span>
                <span class="badge badge-fee"><i class="fa-solid fa-wallet"></i> ফি: ${doc.fee1}/-</span>
                <span class="badge badge-time"><i class="fa-solid fa-clock"></i> ${schedule.time}</span>
                <span class="badge badge-room"><i class="fa-solid fa-door-open"></i> রুম: ${schedule.room}</span>
            </div>
        </div>`;
}

function filterDay() {
    const day = document.getElementById('daySelect').value;
    const dept = document.getElementById('deptSelectDay').value;
    const res = document.getElementById('dayResults');
    if(!day) return;

    const filtered = doctors.filter(d => (!dept || d.dept === dept) && d.schedules.some(s => s.day === day));
    
    let morningHtml = "";
    let afternoonHtml = "";

    filtered.forEach(d => {
        const s = d.schedules.find(sc => sc.day === day);
        if(s.time.includes("AM") && !s.time.startsWith("12")) {
            morningHtml += createDocListItem(d, s);
        } else {
            afternoonHtml += createDocListItem(d, s);
        }
    });

    res.innerHTML = `
        <div class="shift-title shift-morning"><i class="fa-solid fa-sun"></i> সকালের তালিকা</div>
        ${morningHtml || '<div style="padding:10px;">সকালে কোনো ডাক্তার নেই।</div>'}
        <div class="shift-title shift-afternoon"><i class="fa-solid fa-moon"></i> বিকাল ও সন্ধ্যার তালিকা</div>
        ${afternoonHtml || '<div style="padding:10px;">বিকালে কোনো ডাক্তার নেই।</div>'}
    `;
}

function searchDoctors() {
    const query = document.getElementById('mainSearch').value.toLowerCase();
    const results = document.getElementById('searchResults');
    if(query.length < 2) { results.innerHTML = ''; return; }

    const filtered = doctors.filter(d => 
        d.name.toLowerCase().includes(query) || 
        d.spec.toLowerCase().includes(query) ||
        d.dept.toLowerCase().includes(query)
    );

    results.innerHTML = filtered.length ? filtered.map(d => `
        <div class="doctor-card">
            <div class="doc-name">${d.name}</div>
            <div class="doc-spec">${d.spec}</div>
            <div class="card-meta">
                <span class="badge"><i class="fa-solid fa-stethoscope"></i> ${d.dept}</span>
                <span class="badge badge-fee"><i class="fa-solid fa-wallet"></i> ফি: ${d.fee1}/-</span>
            </div>
            <div style="font-size:13px; color:#475569; margin-top:5px;">
                ${d.schedules.map(s => `<b>${s.day}:</b> ${s.time} (রুম: ${s.room})`).join('<br>')}
            </div>
        </div>
    `).join('') : '<div class="no-data">তথ্য পাওয়া যায়নি।</div>';
}

function filterFees() {
    const dept = document.getElementById('deptSelectFee').value;
    const res = document.getElementById('feeResults');
    if(!dept) return;

    let html = `<table><thead><tr><th>ডাক্তারের নাম</th><th>১ম ফি</th><th>২য় ফি</th></tr></thead><tbody>`;
    doctors.filter(d => d.dept === dept).forEach(d => {
        html += `<tr><td><strong>${d.name}</strong><br><small>${d.spec}</small></td><td>${d.fee1}/-</td><td>${d.fee2 ? d.fee2+'/-' : 'N/A'}</td></tr>`;
    });
    res.innerHTML = html + `</tbody></table>`;
}

function updateDocList() {
    const dept = document.getElementById('deptSelectFull').value;
    const docSelect = document.getElementById('doctorSelect');
    docSelect.innerHTML = '<option value="">ডাক্তার সিলেক্ট করুন</option>';
    doctors.filter(d => d.dept === dept).forEach(d => {
        docSelect.innerHTML += `<option value="${d.name}">${d.name}</option>`;
    });
}

function showFullSchedule() {
    const name = document.getElementById('doctorSelect').value;
    const res = document.getElementById('fullResults');
    if(!name) return;
    const d = doctors.find(doc => doc.name === name);
    res.innerHTML = `
        <div class="doctor-card">
            <div class="doc-name">${d.name}</div>
            <div class="doc-spec">${d.spec}</div>
            <div class="card-meta" style="margin-bottom:15px;">
                <span class="badge badge-fee" style="font-size:16px; padding:5px 15px;"><i class="fa-solid fa-wallet"></i> ভিজিট ফি: ${d.fee1}/-</span>
            </div>
            <div style="background:#f8fafc; padding:10px; border-radius:8px;">
                ${d.schedules.map(s => `<div style="padding:5px 0; border-bottom:1px solid #e2e8f0;"><b>${s.day}:</b> ${s.time} (রুম: ${s.room})</div>`).join('')}
            </div>
        </div>`;
}
