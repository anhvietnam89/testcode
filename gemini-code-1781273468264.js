// --- KHỞI TẠO DỮ LIỆU MẪU ĐỂ TEST (Nếu LocalStorage trống) ---
if (!localStorage.getItem('products')) {
    const defaultProducts = [
        { id: 1, name: "Móc khóa đầu cừu GULI", price: 45000, img: "https://picsum.photos/200?random=1" },
        { id: 2, name: "Zombie đội xô len", price: 120000, img: "https://picsum.photos/200?random=2" },
        { id: 3, name: "Pokémon Chikorita len", price: 95000, img: "https://picsum.photos/200?random=3" },
        { id: 4, name: "Snorlax Béo ú Nu", price: 150000, img: "https://picsum.photos/200?random=4" }
    ];
    localStorage.setItem('products', JSON.stringify(defaultProducts));
}
if (!localStorage.getItem('users')) {
    // Tài khoản admin mặc định: admin / admin
    localStorage.setItem('users', JSON.stringify([{ username: 'admin', password: 'admin', role: 'admin' }]));
}
if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify([]));
}

// Lấy dữ liệu toàn cục
let products = JSON.parse(localStorage.getItem('products'));
let orders = JSON.parse(localStorage.getItem('orders'));
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// --- XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ ---
let isLoginMode = true;

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "Đăng Nhập" : "Đăng Ký";
    document.getElementById('main-auth-btn').innerText = isLoginMode ? "Đăng Nhập" : "Đăng Ký";
    document.getElementById('toggle-text').innerText = isLoginMode ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập";
}

function submitAuth() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    let users = JSON.parse(localStorage.getItem('users'));

    if(!u || !p) return alert("Vui lòng nhập đủ thông tin");

    if (isLoginMode) {
        // Log in
        const user = users.find(x => x.username === u && x.password === p);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert("Đăng nhập thành công!");
            window.location.href = 'index.html';
        } else {
            alert("Sai tài khoản hoặc mật khẩu!");
        }
    } else {
        // Register
        if (users.some(x => x.username === u)) return alert("Tài khoản đã tồn tại!");
        users.push({ username: u, password: p, role: 'user' });
        localStorage.setItem('users', JSON.stringify(users));
        alert("Đăng ký thành công! Hãy đăng nhập.");
        toggleAuthMode();
    }
}

function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const infoSpan = document.getElementById('user-info');
    const authBtn = document.getElementById('auth-btn');
    const adminLink = document.getElementById('admin-link');

    if(user) {
        infoSpan.innerText = `Xin chào, ${user.username}`;
        authBtn.innerText = "Đăng xuất";
        if(user.username === 'admin') adminLink.style.display = 'inline';
    } else {
        infoSpan.innerText = "";
        authBtn.innerText = "Đăng nhập";
        adminLink.style.display = 'none';
    }
}

function handleAuthAction() {
    if(localStorage.getItem('currentUser')) {
        localStorage.removeItem('currentUser');
        alert("Đã đăng xuất!");
        window.location.reload();
    } else {
        window.location.href = 'login.html';
    }
}

// --- XỬ LÝ CỬA HÀNG & GIỎ HÀNG ---
function renderShopProducts() {
    const container = document.getElementById('product-list');
    if(!container) return;
    container.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.img}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p style="color:red; font-weight:bold;">${p.price.toLocaleString()}đ</p>
            <button onclick="addToCart(${p.id})">Thêm vào giỏ</button>
        </div>
    `).join('');
}

function addToCart(id) {
    const prod = products.find(x => x.id === id);
    const cartItem = cart.find(x => x.id === id);
    if(cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({...prod, quantity: 1});
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    if(!container) return;
    container.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
            <span>${item.name} (x${item.quantity})</span>
            <span>${(item.price * item.quantity).toLocaleString()}đ 
                <button onclick="removeFromCart(${idx})" style="background:gray; padding:2px 5px; margin-left:10px;">Xóa</button>
            </span>
        </div>
    `).join('');

    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total-price').innerText = total.toLocaleString();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// --- XỬ LÝ THANH TOÁN ---
function processCheckout() {
    if(cart.length === 0) return alert("Giỏ hàng của bạn đang trống!");
    
    const name = document.getElementById('cus-name').value;
    const phone = document.getElementById('cus-phone').value;
    const addr = document.getElementById('cus-address').value;

    if(!name || !phone || !addr) return alert("Vui lòng điền đủ thông tin giao hàng!");

    const newOrder = {
        id: 'DH' + Date.now(),
        customer: { name, phone, addr },
        items: cart,
        total: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0),
        status: 'Chờ xử lý'
    };

    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Xóa giỏ hàng sau khi mua thành công
    cart = [];
    localStorage.removeItem('cart');
    alert("Đặt hàng thành công! Đơn hàng của bạn đang chờ Admin duyệt.");
    window.location.reload();
}

// --- XỬ LÝ TRANG ADMIN ---
function renderAdminProducts() {
    const container = document.getElementById('admin-product-list');
    if(!container) return;
    container.innerHTML = products.map((p, idx) => `
        <div style="display:flex; justify-content:space-between; margin:5px 0; background:#eee; padding:5px;">
            <span>${p.name} - ${p.price.toLocaleString()}đ</span>
            <button onclick="deleteProduct(${idx})" style="background:red; padding:2px 5px;">Xóa</button>
        </div>
    `).join('');
}

function addNewProduct() {
    const name = document.getElementById('prod-name').value;
    const price = parseInt(document.getElementById('prod-price').value);
    let img = document.getElementById('prod-img').value;

    if(!name || !price) return alert("Nhập tên và giá sản phẩm!");
    if(!img) img = "https://picsum.photos/200"; // Ảnh mặc định nếu bỏ trống

    products.push({ id: Date.now(), name, price, img });
    localStorage.setItem('products', JSON.stringify(products));
    alert("Đã thêm sản phẩm thành công!");
    window.location.reload();
}

function deleteProduct(index) {
    if(confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        window.location.reload();
    }
}

function renderAdminOrders() {
    const container = document.getElementById('admin-order-list');
    if(!container) return;
    if(orders.length === 0) container.innerHTML = "<p>Chưa có đơn hàng nào.</p>";
    container.innerHTML = orders.map((o, idx) => `
        <div class="order-item" style="flex-direction: column; align-items: flex-start; background: #fafafa; padding: 10px; margin-bottom: 10px;">
            <strong>Mã Đơn: ${o.id} - Trạng thái: <span style="color:blue">${o.status}</span></strong>
            <span>Khách hàng: ${o.customer.name} (${o.customer.phone}) - ĐC: ${o.customer.addr}</span>
            <div>Chi tiết: ${o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</div>
            <strong>Tổng tiền: ${o.total.toLocaleString()}đ</strong>
            <div style="margin-top: 5px;">
                <button onclick="updateOrderStatus(${idx}, 'Đã duyệt')" style="background:green;">Duyệt đơn</button>
                <button onclick="deleteOrder(${idx})" style="background:red;">Hủy đơn</button>
            </div>
        </div>
    `).join('');
}

function updateOrderStatus(index, status) {
    orders[index].status = status;
    localStorage.setItem('orders', JSON.stringify(orders));
    alert("Đã cập nhật trạng thái đơn hàng!");
    renderAdminOrders();
}

function deleteOrder(index) {
    if(confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
        orders.splice(index, 1);
        localStorage.setItem('orders', JSON.stringify(orders));
        window.location.reload();
    }
}