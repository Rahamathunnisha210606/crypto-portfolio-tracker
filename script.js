let portfolio = [];
let myChart = null;

const addBtn = document.getElementById('add-btn');
const assetList = document.getElementById('asset-list');
const netWorthDisplay = document.getElementById('net-worth');

addBtn.addEventListener('click', async () => {
    const id = document.getElementById('coin-id').value.toLowerCase().trim();
    const amount = parseFloat(document.getElementById('coin-amount').value);

    if (!id || isNaN(amount)) return alert("Please enter valid details");

    try {
        // FIX 1: Use backticks `` instead of single quotes ''
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
        const data = await response.json();
        
        if (!data[id]) throw new Error("Coin not found");

        const price = data[id].usd;
        portfolio.push({ id, amount, price });
        
        updateUI();
    } catch (err) {
        alert("Error: " + err.message);
    }
});

function updateUI() {
    assetList.innerHTML = '';
    let totalNetWorth = 0;
    const labels = [];
    const values = [];

    portfolio.forEach((item, index) => {
        const totalValue = item.amount * item.price;
        totalNetWorth += totalValue;
        
        labels.push(item.id.toUpperCase());
        values.push(totalValue);

        assetList.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.amount}</td>
                <td>$${item.price.toLocaleString()}</td>
                <td>$${totalValue.toLocaleString()}</td>
                <td><button onclick="removeCoin(${index})">Remove</button></td>
            </tr>
        `;
    });

    // FIX 2: Added backticks around the Net Worth text
    netWorthDisplay.innerText = `$${totalNetWorth.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    updateChart(labels, values);
}

// FIX 3: Make removeCoin global so the HTML button can find it
window.removeCoin = function(index) {
    portfolio.splice(index, 1);
    updateUI();
}

function updateChart(labels, values) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#f39c12', '#3498db', '#9b59b6', '#2ecc71', '#e74c3c']
            }]
        }
    });
}