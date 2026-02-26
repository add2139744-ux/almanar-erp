const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات الملفات والبيانات
app.use(express.json());
app.use(express.static('public')); // هام: تأكد من وجود صورة logo.jpeg داخل مجلد public

// --- قاعدة البيانات المطورة ---
let db = {
    settings: {
        mainTitle: "شركة ومكتبة المنار",
        subTitle: "عالم متكامل من اللوازم المكتبية والخدمات",
        mainColor: "#1e3799",
        bannerText: "🌙 عروض رمضان: خصم 30% على جميع القرطاسية والمستلزمات!",
        whatsapp: "970590000000" // قم بتعديل الرقم الخاص بك هنا
    },
    inventory: {
        "القرطاسية": { icon: "✏️", items: [] },
        "الطباعة والتصوير": { icon: "🖨️", items: [{ id: 1, n: "طباعة ملون A4", p: "2" }] },
        "الكتب والروايات": { icon: "📚", items: [] },
        "اللوازم المدرسية": { icon: "🎒", items: [] },
        "الفنون والحرف": { icon: "🎨", items: [] }
    },
    users: {
        "adel2009": { pass: "2130063", name: "عادل محمود", role: "admin" }
    }
};

// --- 1. الواجهة الرئيسية ---
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    let catsHtml = Object.keys(db.inventory).map(cat => `
        <div class="card" onclick="location.href='/category?name=${encodeURIComponent(cat)}'">
            <div style="font-size:50px;">${db.inventory[cat].icon}</div>
            <h3>${cat}</h3>
            <small>${db.inventory[cat].items.length} منتج</small>
        </div>`).join('');

    res.send(`
        <html>
        <head>
            <title>${db.settings.mainTitle}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo&display=swap" rel="stylesheet">
            <style>
                body { direction:rtl; font-family:'Cairo', sans-serif; background:#f4f7f6; margin:0; text-align:center; }
                .banner { background:#d63031; color:white; padding:12px; font-weight:bold; }
                .header { background:${db.settings.mainColor}; color:white; padding:20px; display:flex; align-items:center; justify-content:space-between; }
                .logo-img { width:80px; border-radius:10px; background:white; margin-left:15px; }
                .card { background:white; padding:20px; border-radius:15px; width:150px; display:inline-block; margin:15px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.1); transition:0.3s; }
                .card:hover { transform:translateY(-10px); }
                .whatsapp-float { position:fixed; bottom:20px; left:20px; background:#25d366; color:white; padding:15px; border-radius:50%; font-size:30px; text-decoration:none; box-shadow:0 4px 10px rgba(0,0,0,0.3); z-index:1000; }
            </style>
        </head>
        <body>
            <div class="banner">${db.settings.bannerText}</div>
            <div class="header">
                <div style="display:flex; align-items:center;">
                    <img src="/logo.jpeg" class="logo-img" onerror="this.src='https://via.placeholder.com/80?text=Almanar'">
                    <div style="text-align:right;"><h2>${db.settings.mainTitle}</h2><p>${db.settings.subTitle}</p></div>
                </div>
                <div onclick="location.href='/admin-login'" style="cursor:pointer; font-size:30px;">⚙️</div>
            </div>
            <div style="padding:40px;">${catsHtml}</div>
            <a href="https://wa.me/${db.settings.whatsapp}" class="whatsapp-float" target="_blank">📱</a>
        </body>
        </html>
    `);
});

// --- 2. لوحة التحكم (CRUD) ---
app.get('/dashboard', (req, res) => {
    const { user, pass } = req.query;
    if (!db.users[user] || db.users[user].pass !== pass) return res.send("بيانات الدخول غير صحيحة!");

    res.send(`
        <body style="direction:rtl; font-family:Cairo; padding:30px; text-align:right; background:#eef2f7;">
            <h1>لوحة إدارة المنار 🛠️</h1>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <div style="background:white; padding:20px; border-radius:15px;">
                    <h3>➕ إضافة قسم جديد</h3>
                    <input id="catName" placeholder="اسم القسم">
                    <input id="catIcon" placeholder="إيموجي (مثلاً: 📂)">
                    <button onclick="addCategory()">إضافة</button>
                </div>
                <div style="background:white; padding:20px; border-radius:15px;">
                    <h3>📁 الأقسام الحالية</h3>
                    <ul id="catList">
                        ${Object.keys(db.inventory).map(cat => `
                            <li>${cat} <button onclick="deleteCategory('${cat}')" style="color:red;">حذف</button></li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            <center><br><button onclick="location.href='/'">العودة للموقع</button></center>
            <script>
                async function addCategory() {
                    const name = document.getElementById('catName').value;
                    const icon = document.getElementById('catIcon').value;
                    await fetch('/api/category', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ name, icon })
                    });
                    location.reload();
                }
                async function deleteCategory(name) {
                    if(confirm('هل تريد حذف قسم ' + name + '؟')) {
                        await fetch('/api/category', {
                            method: 'DELETE',
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

// --- 3. بوابات الـ API ---
app.post('/api/category', (req, res) => {
    const { name, icon } = req.body;
    if (name) db.inventory[name] = { icon: icon || "📁", items: [] };
    res.json({ success: true });
});

app.delete('/api/category', (req, res) => {
    delete db.inventory[req.body.name];
    res.json({ success: true });
});

app.get('/admin-login', (req, res) => {
    res.send(\`
        <body style="direction:rtl; text-align:center; padding-top:100px; font-family:Cairo; background:${db.settings.mainColor};">
            <form action="/dashboard" style="background:white; display:inline-block; padding:40px; border-radius:20px;">
                <h2>🔐 دخول الإدارة</h2>
                <input name="user" placeholder="اسم المستخدم" required><br><br>
                <input name="pass" type="password" placeholder="كلمة السر" required><br><br>
                <button type="submit">دخول</button>
            </form>
        </body>
    \`);
});

app.listen(PORT, () => console.log(\`نظام المنار يعمل على منفذ \${PORT}\`));
