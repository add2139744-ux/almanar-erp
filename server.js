const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// --- قاعدة البيانات (ملاحظة: البيانات ستعود للأصل عند إعادة تشغيل السيرفر) ---
let db = {
    settings: {
        mainTitle: "شركة ومكتبة المنار",
        subTitle: "شركة محمود جبر أبو عبيد للتجارة العامة",
        mainColor: "#1e3799",
        fontFamily: "'Cairo', sans-serif",
        bannerText: "🌙 رمضان كريم - خصومات تصل إلى 30% في مكتبة المنار",
        workStatus: "open",
        currency: "₪",
        whatsapp: "970590000000" // ضع رقم الواتساب هنا
    },
    inventory: {
        "القرطاسية": { icon: "✏️", items: [] },
        "الطباعة والتصوير": { icon: "🖨️", items: [] },
        "الكتب": { icon: "📚", items: [] }
    },
    users: {
        "adel2009": { pass: "2130063", name: "عادل محمود", role: "admin" }
    }
};

// --- 1. واجهة الزبائن ---
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    let catsHtml = Object.keys(db.inventory).map(cat => `
        <div class="card" onclick="location.href='/category?name=${cat}'">
            <div style="font-size:50px;">${db.inventory[cat].icon}</div>
            <h3>${cat}</h3>
        </div>`).join('');

    res.send(`
        <html>
        <head>
            <title>${db.settings.mainTitle}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo&display=swap" rel="stylesheet">
            <style>
                body { direction:rtl; font-family:${db.settings.fontFamily}; background:#f4f7f6; margin:0; text-align:center; }
                .banner { background:#d63031; color:white; padding:12px; font-weight:bold; }
                .header { background:${db.settings.mainColor}; color:white; padding:20px; display:flex; align-items:center; justify-content:space-between; }
                .logo-img { width:80px; border-radius:10px; background:white; margin-left:10px; }
                .card { background:white; padding:20px; border-radius:15px; width:150px; display:inline-block; margin:10px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.1); }
                .whatsapp-btn { position:fixed; bottom:20px; left:20px; background:#25d366; color:white; padding:15px; border-radius:50%; font-size:30px; text-decoration:none; box-shadow:0 4px 10px rgba(0,0,0,0.3); z-index:1000; }
                .pwa-bar { position:fixed; bottom:0; width:100%; background:white; padding:10px; border-top:2px solid ${db.settings.mainColor}; }
            </style>
        </head>
        <body>
            <div class="banner">${db.settings.bannerText}</div>
            <div class="header">
                <div style="display:flex; align-items:center;">
                    <img src="/logo.jpeg" class="logo-img" onerror="this.src='https://via.placeholder.com/80?text=Logo'">
                    <div style="text-align:right;"><h2>${db.settings.mainTitle}</h2><p>${db.settings.subTitle}</p></div>
                </div>
                <div onclick="location.href='/admin-login'" style="cursor:pointer; font-size:30px;">⚙️</div>
            </div>
            <div style="padding:20px;">${catsHtml}</div>
            
            <a href="https://wa.me/${db.settings.whatsapp}" class="whatsapp-btn" target="_blank">📱</a>

            <div class="pwa-bar">
                ثبت تطبيق المنار الآن 
                <button onclick="alert('اضغط على زر المشاركة ثم إضافة للشاشة الرئيسية في متصفحك')">تثبيت التطبيق</button>
            </div>
        </body>
        </html>
    `);
});

// --- 2. لوحة التحكم المحدثة (أزرار فعالة) ---
app.get('/dashboard', (req, res) => {
    const { user, pass } = req.query;
    if (!db.users[user] || db.users[user].pass !== pass) return res.send("دخول خاطئ!");

    res.send(`
        <body style="direction:rtl; font-family:Cairo; padding:20px; text-align:right;">
            <h1>لوحة تحكم ${db.settings.mainTitle} 🛠️</h1>
            <div style="background:#eee; padding:20px; border-radius:10px;">
                <h3>➕ إضافة قسم جديد</h3>
                <input id="newCatName" placeholder="اسم القسم (مثلاً: ألعاب)">
                <input id="newCatIcon" placeholder="إيموجي (مثلاً: 🎮)">
                <button onclick="addCat()">إضافة القسم</button>
            </div>
            <hr>
            <h3>📁 الأقسام الحالية</h3>
            <ul>
                ${Object.keys(db.inventory).map(cat => `
                    <li>${cat} <button onclick="deleteCat('${cat}')" style="color:red;">حذف</button></li>
                `).join('')}
            </ul>
            <script>
                async function addCat() {
                    const name = document.getElementById('newCatName').value;
                    const icon = document.getElementById('newCatIcon').value;
                    await fetch('/api/add-cat', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ name, icon })
                    });
                    location.reload();
                }
                async function deleteCat(name) {
                    if(confirm('حذف ' + name + '؟')) {
                        await fetch('/api/delete-cat', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ name })
                        });
                        location.reload();
                    }
                }
            </script>
        </body>
    `);
});

// --- APIs ---
app.post('/api/add-cat', (req, res) => {
    const { name, icon } = req.body;
    if(name) db.inventory[name] = { icon: icon || "📁", items: [] };
    res.json({ success: true });
});

app.post('/api/delete-cat', (req, res) => {
    delete db.inventory[req.body.name];
    res.json({ success: true });
});

app.listen(PORT, () => console.log('المنار Live!'));
