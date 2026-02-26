const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// --- قاعدة البيانات الشاملة لشركة ومكتبة المنار ---
let db = {
    settings: {
        mainTitle: "شركة ومكتبة المنار",
        subTitle: "شركة محمود جبر أبو عبيد للتجارة العامة",
        mainColor: "#1e3799",
        fontFamily: "'Cairo', sans-serif",
        bannerText: "🌙 عروض نهاية الأسبوع: خصومات تصل إلى 30% على كافة الأقسام",
        workStatus: "open", // open, closed, soon
        currency: "₪"
    },
    users: {
        "almanar2000": { pass: "1978", name: "إدارة المنار", role: "super_admin", title: "الإدارة العامة (ثابت)" },
        "adel2009": { pass: "2130063", name: "عادل محمود جبر أبو عبيد", role: "admin", title: "مدير الشركة" },
        "mohammed2006": { pass: "2130063", name: "محمد محمود جبر أبو عبيد", role: "editor", title: "مسؤول محتوى" }
    },
    inventory: {
        "الطباعة والتصوير": { 
            icon: "🖨️", 
            items: [
                { id: 1, n: "طباعة A4 ملون", p: "2", img: "https://via.placeholder.com/150?text=A4+Color" },
                { id: 2, n: "تصوير كتب مدرسية", p: "5", img: "https://via.placeholder.com/150?text=Books" }
            ] 
        },
        "الكتب": { icon: "📚", items: [{ id: 3, n: "رواية جديدة", p: "25", img: "https://via.placeholder.com/150?text=Novel" }] },
        "القرطاسية": { icon: "✏️", items: [] },
        "الفنون والحرف": { icon: "🎨", items: [] },
        "لوازم مدرسية": { icon: "🎒", items: [] },
        "هدايا مميزة": { icon: "🎁", items: [] },
        "خدمات مكتبية": { icon: "💼", items: [] }
    }
};

// --- 1. واجهة الزبائن الرئيسية ---
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
            <link href="https://fonts.googleapis.com/css2?family=Cairo&family=Tajawal&family=Almarai&family=Amiri&family=Changa&display=swap" rel="stylesheet">
            <style>
                body { direction:rtl; font-family:${db.settings.fontFamily}; background:#f4f7f6; margin:0; text-align:center; }
                .banner { background:#d63031; color:white; padding:12px; font-weight:bold; position:sticky; top:0; z-index:100; }
                .header { background:${db.settings.mainColor}; color:white; padding:30px; display:flex; align-items:center; justify-content:space-between; }
                .logo-box { display:flex; align-items:center; }
                .logo-img { width:100px; border-radius:15px; background:white; padding:5px; margin-left:15px; box-shadow:0 4px 10px rgba(0,0,0,0.2); }
                .card { background:white; padding:25px; border-radius:20px; width:200px; display:inline-block; margin:15px; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,0.1); transition:0.3s; }
                .card:hover { transform:translateY(-10px); background:#f0f0f0; }
                #clock-bar { background:#fff; padding:10px; border-bottom:1px solid #ddd; font-weight:bold; color:#333; }
                .pwa-bar { position:fixed; bottom:0; width:100%; background:white; padding:15px; border-top:3px solid ${db.settings.mainColor}; font-weight:bold; }
            </style>
        </head>
        <body>
            <div class="banner">${db.settings.bannerText}</div>
            <div class="header">
                <div class="logo-box">
                    <img src="/logo.jpeg" class="logo-img" onerror="this.src='https://via.placeholder.com/100?text=Almanar'">
                    <div style="text-align:right;">
                        <h1 style="margin:0;">${db.settings.mainTitle}</h1>
                        <p style="margin:0;">${db.settings.subTitle}</p>
                    </div>
                </div>
                <div onclick="location.href='/admin-login'" style="cursor:pointer; font-size:35px;">⚙️</div>
            </div>
            <div id="clock-bar">
                📅 <span id="date"></span> | 🕒 <span id="clock"></span> | 
                حالة العمل: <b style="color:${db.settings.workStatus==='open'?'green':'red'}">${db.settings.workStatus==='open'?'مفتوح الآن ✅':'مغلق الآن ❌'}</b>
            </div>
            <div style="padding:40px;">${catsHtml}</div>
            <div class="pwa-bar">يمكنك الآن تثبيت تطبيق شركة ومكتبة المنار على جهازك <button>تثبيت</button></div>

            <script>
                function updateClock() {
                    const now = new Date();
                    document.getElementById('clock').innerText = now.toLocaleTimeString('ar-EG');
                    document.getElementById('date').innerText = now.toLocaleDateString('ar-EG', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
                }
                setInterval(updateClock, 1000); updateClock();
            </script>
        </body>
        </html>
    `);
});

// --- 2. صفحة القسم وعرض المنتجات ---
app.get('/category', (req, res) => {
    const name = req.query.name;
    const cat = db.inventory[name];
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (!cat) return res.send("القسم غير موجود");

    let itemsHtml = cat.items.map(i => `
        <div style="background:white; padding:20px; border-radius:15px; display:inline-block; margin:15px; width:200px; box-shadow:0 4px 10px #ddd;">
            <img src="${i.img}" width="100%" style="border-radius:10px;">
            <h4>${i.n}</h4>
            <p style="color:${db.settings.mainColor}; font-weight:bold; font-size:20px;">${i.p} ${db.settings.currency}</p>
            <button style="width:100%; padding:10px; cursor:pointer;">إضافة للسلة</button>
        </div>`).join('');

    res.send(`
        <body style="direction:rtl; text-align:center; font-family:Cairo; background:#f4f7f6; margin:0;">
            <div style="background:${db.settings.mainColor}; color:white; padding:40px;">
                <h1>${cat.icon} قسم ${name}</h1>
                <button onclick="location.href='/'" style="padding:10px 20px; cursor:pointer;">العودة للرئيسية</button>
            </div>
            <div style="padding:40px;">${itemsHtml || '<h2>لا يوجد منتجات في هذا القسم حالياً</h2>'}</div>
        </body>
    `);
});

// --- 3. لوحة تحكم المدير (عادل والمنار 2000) ---
app.get('/dashboard', (req, res) => {
    const { user, pass } = req.query;
    const u = db.users[user];
    if (!u || u.pass !== pass) return res.send("<h1>خطأ في الدخول!</h1>");

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
        <body style="direction:rtl; font-family:Cairo; padding:30px; background:#eef2f7;">
            <div style="background:white; padding:30px; border-radius:20px; box-shadow:0 10px 30px #ccc;">
                <h1>مرحباً بك يا ${u.name} 👋</h1>
                <p>صلاحيتك: <b style="color:blue;">${u.title}</b></p>
                <hr>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; text-align:right;">
                    <div style="border:2px solid #ddd; padding:20px; border-radius:15px;">
                        <h3>🎨 تخصيص المظهر والخطوط</h3>
                        اللون: <input type="color" id="clr" value="${db.settings.mainColor}"> <button onclick="save('mainColor', 'clr')">حفظ اللون</button><br><br>
                        الخط: <select id="fnt" onchange="save('fontFamily', 'fnt')">
                            <option>Cairo</option><option>Tajawal</option><option>Almarai</option><option>Amiri</option><option>Changa</option>
                        </select><br><br>
                        نص الإعلان: <input id="bnr" value="${db.settings.bannerText}" style="width:100%;"> 
                        <button onclick="save('bannerText', 'bnr')">تحديث الإعلان</button>
                    </div>
                    <div style="border:2px solid #ddd; padding:20px; border-radius:15px;">
                        <h3>📂 إدارة الأقسام والمنتجات</h3>
                        <button onclick="alert('جارٍ تفعيل ميزة إضافة المنتج بصورة...')">📦 إضافة منتج جديد</button>
                        <button onclick="alert('جارٍ تفعيل ميزة إضافة قسم...')">➕ إضافة قسم جديد</button>
                        <hr>
                        <h4>الأقسام الحالية:</h4>
                        <ul>${Object.keys(db.inventory).map(cat => `<li>${cat} <button onclick="deleteCat('${cat}')" style="color:red; border:none; cursor:pointer;">[حذف]</button></li>`).join('')}</ul>
                    </div>
                    ${u.role === 'super_admin' ? `
                    <div style="border:2px solid gold; padding:20px; border-radius:15px; grid-column: span 2;">
                        <h3>👥 إدارة المستخدمين (حصري للمنار 2000)</h3>
                        <button onclick="alert('جارٍ تفعيل ميزة إضافة يوزر...')">👤 إضافة موظف جديد</button>
                        <ul>${Object.keys(db.users).map(un => `<li>${un} - ${db.users[un].name}</li>`).join('')}</ul>
                    </div>` : ''}
                </div>
                <center><br><button onclick="location.href='/'" style="padding:10px 40px; font-size:18px; cursor:pointer;">خروج للموقع</button></center>
            </div>
            <script>
                function save(key, id) {
                    const val = document.getElementById(id).value;
                    fetch('/api/update', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ [key]: val })
                    }).then(() => location.reload());
                }
                function deleteCat(name) {
                    if(confirm('هل أنت متأكد من حذف قسم ' + name + '؟')) {
                        fetch('/api/delete-cat', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ name: name })
                        }).then(() => location.reload());
                    }
                }
            </script>
        </body>
    `);
});

// --- 4. بوابة الدخول (Login) ---
app.get('/admin-login', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
        <body style="direction:rtl; text-align:center; padding-top:100px; font-family:Cairo; background:${db.settings.mainColor};">
            <div style="background:white; display:inline-block; padding:50px; border-radius:30px; box-shadow:0 10px 50px rgba(0,0,0,0.5);">
                <img src="/logo.jpeg" width="100" style="border-radius:15px;">
                <h2 style="color:${db.settings.mainColor};">🔐 نظام الإدارة - شركة المنار</h2>
                <form action="/dashboard">
                    <input name="user" placeholder="اسم المستخدم" required style="padding:12px; width:250px; margin:10px; border-radius:8px; border:1px solid #ccc;"><br>
                    <input name="pass" type="password" placeholder="كلمة السر" required style="padding:12px; width:250px; margin:10px; border-radius:8px; border:1px solid #ccc;"><br>
                    <button type="submit" style="padding:12px 50px; background:${db.settings.mainColor}; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">دخول</button>
                </form>
            </div>
        </body>
    `);
});

// --- مسارات الـ API للتحكم الحقيقي ---
app.post('/api/update', (req, res) => {
    db.settings = { ...db.settings, ...req.body };
    res.json({ success: true });
});

app.post('/api/delete-cat', (req, res) => {
    delete db.inventory[req.body.name];
    res.json({ success: true });
});

app.listen(port, () => console.log(`نظام المنار ERP المدمج يعمل على http://localhost:3000`));