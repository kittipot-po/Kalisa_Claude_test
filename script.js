/* ============================================================
   KALISA Body Oil — Interactive Script
   ============================================================ */

/* ── Nav scroll behaviour ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Burger / Mobile Menu ── */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  mobileMenu.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── Scroll Reveal ── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Hero Particles ── */
const particlesContainer = document.getElementById('particles');

function createParticle() {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 4 + 2;
  const duration = Math.random() * 12 + 8;
  const startX = Math.random() * 100;
  const dx = (Math.random() - 0.5) * 80;

  p.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${startX}%;
    bottom: -${size}px;
    animation-duration: ${duration}s;
    animation-delay: ${Math.random() * 6}s;
    --dx: ${dx}px;
    opacity: 0;
  `;
  particlesContainer.appendChild(p);
  setTimeout(() => p.remove(), (duration + 6) * 1000);
}

setInterval(createParticle, 600);
for (let i = 0; i < 10; i++) createParticle();

/* ── Smooth Active Nav Highlighting ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--gold-dark)' : '';
        });
      }
    });
  },
  { rootMargin: '-50% 0px -50% 0px' }
);

sections.forEach(s => activeObserver.observe(s));

/* ── Liquid bottle parallax on hero scroll ── */
const bottleShape = document.querySelector('.bottle-shape');
if (bottleShape) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      bottleShape.style.transform = `translateY(${scrolled * 0.08}px)`;
    }
  }, { passive: true });
}

/* ── Stagger reveal delay for grids ── */
document.querySelectorAll('.benefits__grid, .products__grid, .ingredients__grid, .reviews__slider').forEach(grid => {
  const children = grid.querySelectorAll('.reveal');
  children.forEach((child, i) => {
    child.style.transitionDelay = `${i * 0.1}s`;
  });
});

/* ── Newsletter Form Feedback ── */
const footerForm = document.querySelector('.footer__form');
if (footerForm) {
  footerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = footerForm.querySelector('input');
    const btn = footerForm.querySelector('button');
    if (!input.value.includes('@')) {
      input.style.borderColor = '#c9786a';
      input.placeholder = 'Enter a valid email';
      setTimeout(() => { input.style.borderColor = ''; input.placeholder = 'your@email.com'; }, 2000);
      return;
    }
    btn.textContent = '✓ Joined!';
    btn.style.background = '#6b8c6b';
    input.value = '';
    input.placeholder = "You're on the list!";
    setTimeout(() => {
      btn.textContent = 'Join';
      btn.style.background = '';
      input.placeholder = 'your@email.com';
    }, 3000);
  });
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

/* ============================================================
   CART SYSTEM
   ============================================================ */

const PRODUCTS = [
  { id: 'softglow', name: 'Kalisa Soft Glow Body Oil', price: 68 },
];

const CART_KEY = 'lumiere_cart';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty });
  }
  saveCart();
  updateCartBadge();
  renderCart();
  const msg = qty > 1 ? `${qty}× ${product.name} added to cart` : `${product.name} added to cart`;
  showToast(msg);
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  saveCart();
  updateCartBadge();
  renderCart();
}

function removeFromCart(productId) {
  const item = cart.find(i => i.id === productId);
  if (item) showToast(`${item.name} removed from cart`, 'info');
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = total;
  badge.hidden = total === 0;
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <p>Your cart is empty</p>
        <a href="#products" class="btn btn--primary" onclick="closeCart()">Shop Now</a>
      </div>`;
    footerEl.innerHTML = '';
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalQty  = cart.reduce((sum, item) => sum + item.qty, 0);
  const freeShipping = subtotal >= 60;

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item__visual cart-item__visual--${item.id}"></div>
      <div class="cart-item__info">
        <h4>${item.name}</h4>
        <span class="cart-item__price">$${item.price}</span>
      </div>
      <div class="cart-item__controls">
        <button class="qty-btn" onclick="updateQty('${item.id}',-1)" aria-label="Decrease">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty('${item.id}',1)" aria-label="Increase">+</button>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')" aria-label="Remove">×</button>
      </div>
    </div>`).join('');

  footerEl.innerHTML = `
    <div class="cart-total">
      <span>Subtotal (${totalQty} item${totalQty !== 1 ? 's' : ''})</span>
      <strong>$${subtotal}</strong>
    </div>
    <p class="cart-shipping">${freeShipping
      ? '✓ Free shipping applied!'
      : `Add $${60 - subtotal} more for free shipping`}</p>
    <button class="btn btn--primary btn--full" onclick="handleCheckout()">Proceed to Checkout</button>
    <button class="btn btn--ghost btn--full" onclick="closeCart()" style="margin-top:.5rem">Continue Shopping</button>`;
}

function openCart() {
  renderCart();
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function handleCheckout() {
  if (!currentUser) {
    closeCart();
    openLogin();
    showToast('Please sign in to complete your order', 'info');
    return;
  }

  document.getElementById('cartItems').innerHTML = `
    <div class="cart-empty">
      <div class="cart-empty__icon">✨</div>
      <p><strong>Order Confirmed!</strong></p>
      <p style="font-size:.85rem;color:var(--light-mid);margin-top:.5rem">
        Thank you, ${currentUser.name}!<br>Your order will arrive in 3–5 business days.
      </p>
    </div>`;
  document.getElementById('cartFooter').innerHTML = `
    <button class="btn btn--ghost btn--full" onclick="closeCart()">Close</button>`;

  cart = [];
  saveCart();
  updateCartBadge();
  showToast('Order placed successfully!', 'success');
}

/* ── Showcase quantity controls ── */
let showcaseQty = 1;

const qtyValEl  = document.getElementById('showcaseQtyVal');
const qtyDecBtn = document.getElementById('showcaseQtyDec');
const qtyIncBtn = document.getElementById('showcaseQtyInc');

if (qtyDecBtn && qtyIncBtn) {
  qtyDecBtn.addEventListener('click', () => {
    if (showcaseQty > 1) { showcaseQty--; qtyValEl.textContent = showcaseQty; }
  });
  qtyIncBtn.addEventListener('click', () => {
    showcaseQty++;
    qtyValEl.textContent = showcaseQty;
  });
}

/* ── Add to Cart buttons ── */
document.querySelectorAll('[data-product-id]').forEach(btn => {
  btn.addEventListener('click', function () {
    const id = this.dataset.productId;
    // Use showcase qty if this is the main showcase button
    const qty = (this.id === 'showcaseAddToCart') ? showcaseQty : 1;
    addToCart(id, qty);
    // Visual feedback on button
    const original = this.textContent;
    this.textContent = qty > 1 ? `✓ ${qty} Added!` : '✓ Added!';
    this.style.background = '#6b8c6b';
    setTimeout(() => {
      this.textContent = original;
      this.style.background = '';
    }, 1800);
  });
});

document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', closeCart);

/* ============================================================
   AUTH SYSTEM
   ============================================================ */

const USERS_KEY   = 'lumiere_users';
const SESSION_KEY = 'lumiere_session';

let currentUser = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');

function getUsers() { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

function openLogin() {
  document.getElementById('loginOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  switchTab('signin');
  clearFormErrors();
}

function closeLogin() {
  document.getElementById('loginOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function switchTab(tab) {
  document.querySelectorAll('.modal__tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('signinForm').classList.toggle('hidden', tab !== 'signin');
  document.getElementById('signupForm').classList.toggle('hidden', tab !== 'signup');
}

function clearFormErrors() {
  document.getElementById('signinError').textContent = '';
  document.getElementById('signupError').textContent = '';
}

function updateNavUser() {
  const loginBtn = document.getElementById('loginBtn');
  const initial  = document.getElementById('userInitial');
  if (currentUser) {
    loginBtn.setAttribute('aria-label', `Account: ${currentUser.name}`);
    loginBtn.title = `${currentUser.name} · Click to sign out`;
    loginBtn.classList.add('logged-in');
    initial.textContent = currentUser.name[0].toUpperCase();
  } else {
    loginBtn.setAttribute('aria-label', 'Sign In');
    loginBtn.title = 'Sign In';
    loginBtn.classList.remove('logged-in');
    initial.textContent = '';
  }
}

/* ── Sign In ── */
document.getElementById('signinForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email    = document.getElementById('signinEmail').value.trim();
  const password = document.getElementById('signinPassword').value;
  const errorEl  = document.getElementById('signinError');

  const user = getUsers().find(u => u.email === email && u.password === password);
  if (!user) {
    errorEl.textContent = 'Invalid email or password.';
    return;
  }

  currentUser = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  updateNavUser();
  closeLogin();
  showToast(`Welcome back, ${user.name}!`, 'success');
});

/* ── Sign Up ── */
document.getElementById('signupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const errorEl  = document.getElementById('signupError');

  if (password.length < 6) {
    errorEl.textContent = 'Password must be at least 6 characters.';
    return;
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    errorEl.textContent = 'An account with this email already exists.';
    return;
  }

  const newUser = { name, email, password };
  users.push(newUser);
  saveUsers(users);

  currentUser = newUser;
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  updateNavUser();
  closeLogin();
  showToast(`Welcome to KALISA, ${name}!`, 'success');
});

/* ── Login / logout button ── */
document.getElementById('loginBtn').addEventListener('click', () => {
  if (currentUser) {
    showLogoutMenu();
  } else {
    openLogin();
  }
});

function showLogoutMenu() {
  const existing = document.getElementById('logoutMenu');
  if (existing) { existing.remove(); return; }

  const menu = document.createElement('div');
  menu.id = 'logoutMenu';
  menu.className = 'logout-menu';
  menu.innerHTML = `
    <div class="logout-menu__user">
      <strong>${currentUser.name}</strong>
      <span>${currentUser.email}</span>
    </div>
    <button onclick="handleLogout()">Sign Out</button>`;

  const loginBtn = document.getElementById('loginBtn');
  loginBtn.parentElement.style.position = 'relative';
  loginBtn.insertAdjacentElement('afterend', menu);

  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      if (!menu.contains(e.target) && e.target !== loginBtn) {
        menu.remove();
        document.removeEventListener('click', handler);
      }
    });
  }, 10);
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem(SESSION_KEY);
  updateNavUser();
  document.getElementById('logoutMenu')?.remove();
  showToast('You have been signed out.', 'info');
}

document.getElementById('loginClose').addEventListener('click', closeLogin);
document.getElementById('loginOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('loginOverlay')) closeLogin();
});

document.querySelectorAll('.modal__tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

/* ── Escape key closes overlays ── */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  closeCart();
  closeLogin();
  document.getElementById('logoutMenu')?.remove();
});

/* ============================================================
   FOOTER LINKS — Info Toasts
   ============================================================ */

const footerMessages = {
  'Gift Sets':              'Gift sets coming soon! Sign up for early access.',
  'Bundle & Save':          'Bundle deals coming soon — follow us to be notified!',
  'Shipping & Returns':     'Free shipping on orders over $60. Free returns within 30 days.',
  'FAQ':                    'Our FAQ page is launching soon!',
  'Track My Order':         'Order tracking is available after purchase.',
  'Contact Us':             'Email us at hello@kalisa.com — we reply within 24 hours.',
  'Privacy Policy':         'Privacy Policy page coming soon.',
  'Terms of Service':       'Terms of Service page coming soon.',
  'Accessibility':          'Accessibility statement coming soon.',
};

document.querySelectorAll('.footer__col a, .footer__links a').forEach(link => {
  const text = link.textContent.trim();
  if (footerMessages[text]) {
    link.href = '#';
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showToast(footerMessages[text], 'info');
    });
  }
});

/* ── Social links ── */
document.querySelectorAll('.footer__social a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const label = link.getAttribute('aria-label') || 'Social';
    showToast(`Follow us on ${label} — coming soon!`, 'info');
  });
});

/* ── Init ── */
updateCartBadge();
updateNavUser();
