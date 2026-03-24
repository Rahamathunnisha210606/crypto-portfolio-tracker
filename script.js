// --- INITIALIZATION & SESSION ---
function loginAndAnalyze() {
    const name = document.getElementById('user-name-input').value.trim();
    if (!name) return alert("Enter your name!");

    const user = { name, id: "WD-" + Math.floor(1000 + Math.random() * 8999) };
    localStorage.setItem('wealth_user', JSON.stringify(user));
    initializeDashboard(user);
}

function initializeDashboard(user) {
    document.getElementById('login-overlay').classList.add('hidden');
    const dashboard = document.getElementById('main-dashboard');
    dashboard.classList.remove('hidden');
    dashboard.classList.add('visible');

    document.getElementById('card-name').innerText = user.name;
    document.getElementById('card-id').innerText = user.id;

    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = "";
    new QRCode(qrDiv, { text: user.id, width: 55, height: 55 });

    // LOAD ALL COMPONENTS
    loadChart();
    renderNotes();
    fetchGlobalMarket();
    fetchMarketRates(); // NEW
    loadNewsWidget();
}

// --- NEW: THEME TOGGLE ---
function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('wealth_theme', isLight ? 'light' : 'dark');
    document.getElementById('theme-toggle').innerText = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
    loadChart(); // Reload chart to match theme
}

// --- NEW: FETCH MARKET RATES (INR) ---
async function fetchMarketRates() {
    try {
        const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=10&sparkline=false");
        const coins = await res.json();
        const body = document.getElementById('market-rates-body');
        
        body.innerHTML = coins.map(coin => `
            <tr>
                <td><strong>${coin.symbol.toUpperCase()}</strong></td>
                <td>₹${coin.current_price.toLocaleString()}</td>
                <td class="${coin.price_change_percentage_24h >= 0 ? 'price-up' : 'price-down'}">
                    ${coin.price_change_percentage_24h.toFixed(2)}%
                </td>
            </tr>
        `).join('');
    } catch (e) { console.log("Rates API Busy"); }
}

async function fetchGlobalMarket() {
    try {
        const res = await fetch("https://api.coingecko.com/api/v3/global");
        const { data } = await res.json();
        document.getElementById('global-cap').innerText = `$${(data.total_market_cap.usd / 1e12).toFixed(2)}T`;
        document.getElementById('global-vol').innerText = `$${(data.total_volume.usd / 1e9).toFixed(2)}B`;
        document.getElementById('global-coins').innerText = data.active_cryptocurrencies;
        document.getElementById('btc-dom').innerText = data.market_cap_percentage.btc.toFixed(1) + "%";
    } catch (e) { console.log("Market API Busy"); }
}

function loadChart() {
    const isLight = document.body.classList.contains('light-mode');
    document.getElementById('tradingview_widget').innerHTML = ""; // Clear old chart
    new TradingView.widget({
        "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "D",
        "theme": isLight ? "light" : "dark", 
        "container_id": "tradingview_widget", "style": "1",
        "locale": "en", "allow_symbol_change": true
    });
}

function loadNewsWidget() {
    const container = document.getElementById('tradingview-news-widget');
    container.innerHTML = "";
    const isLight = document.body.classList.contains('light-mode');
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "feedMode": "all_symbols", "colorTheme": isLight ? "light" : "dark", "isTransparent": true,
        "displayMode": "regular", "width": "100%", "height": "100%", "locale": "en"
    });
    container.appendChild(script);
}

function saveNote() {
    const input = document.getElementById('note-input');
    const text = input.value.trim();
    if (!text) return;
    const notes = JSON.parse(localStorage.getItem('wealth_notes')) || [];
    notes.unshift({ text, time: new Date().toLocaleTimeString() });
    localStorage.setItem('wealth_notes', JSON.stringify(notes));
    input.value = "";
    renderNotes();
}

function renderNotes() {
    const container = document.getElementById('notes-display');
    const notes = JSON.parse(localStorage.getItem('wealth_notes')) || [];
    container.innerHTML = notes.map(n => `<div class="note-item" style="border-bottom: 1px solid var(--border); padding: 10px 0;"><small style="color:var(--primary)">${n.time}</small><br>${n.text}</div>`).join('');
}

function logout() {
    localStorage.removeItem('wealth_user');
    location.reload();
}

window.onload = () => {
    // Restore Theme
    if (localStorage.getItem('wealth_theme') === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('theme-toggle').innerText = "🌙 Dark Mode";
    }
    
    const savedUser = JSON.parse(localStorage.getItem('wealth_user'));
    if (savedUser) initializeDashboard(savedUser);
};
