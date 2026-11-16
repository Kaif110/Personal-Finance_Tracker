// Get DOM elements
const form = document.getElementById("transactionForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const totalBalanceEl = document.getElementById("totalBalance");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");

const transactionList = document.getElementById("transactionList");
const chartContainer = document.getElementById("chartContainer");
const expenseCountEl = document.getElementById("expenseCount");
const filterType = document.getElementById("filterType");
const clearAllBtn = document.getElementById("clearAllBtn");

// Set today's date by default
dateInput.valueAsDate = new Date();

// Load saved transactions from LocalStorage
let transactions = JSON.parse(localStorage.getItem("my_ledger_data")) || [];

// Save to LocalStorage
function saveData() {
  localStorage.setItem("my_ledger_data", JSON.stringify(transactions));
}

// Add new transaction
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const newEntry = {
    id: Date.now(),
    title: titleInput.value.trim(),
    amount: parseFloat(amountInput.value),
    type: typeInput.value,
    category: categoryInput.value,
    date: dateInput.value
  };

  transactions.unshift(newEntry);
  saveData();
  updateUI();

  // Reset fields
  titleInput.value = "";
  amountInput.value = "";
});

// Delete single transaction
function deleteTransaction(id) {
  transactions = transactions.filter(function (item) {
    return item.id !== id;
  });
  saveData();
  updateUI();
}

// Clear all data
clearAllBtn.addEventListener("click", function () {
  if (transactions.length === 0) return;
  if (confirm("Are you sure you want to delete all entries?")) {
    transactions = [];
    saveData();
    updateUI();
  }
});

// Filter change
filterType.addEventListener("change", renderList);

// Update Summary Numbers
function updateSummary() {
  let income = 0;
  let expense = 0;

  transactions.forEach(function (item) {
    if (item.type === "income") {
      income += item.amount;
    } else {
      expense += item.amount;
    }
  });

  const balance = income - expense;

  totalBalanceEl.textContent = "₹" + balance.toLocaleString("en-IN");
  totalIncomeEl.textContent = "+₹" + income.toLocaleString("en-IN");
  totalExpenseEl.textContent = "-₹" + expense.toLocaleString("en-IN");
}

// Render Transaction History List
function renderList() {
  const selectedFilter = filterType.value;

  const filtered = transactions.filter(function (item) {
    if (selectedFilter === "all") return true;
    return item.type === selectedFilter;
  });

  if (filtered.length === 0) {
    transactionList.innerHTML = '<li class="empty-msg">No transactions found.</li>';
    return;
  }

  transactionList.innerHTML = "";

  filtered.forEach(function (item) {
    const li = document.createElement("li");
    li.className = "transaction-item";

    const sign = item.type === "income" ? "+" : "-";
    const amountClass = item.type === "income" ? "amount-plus" : "amount-minus";

    li.innerHTML = `
      <div class="item-info">
        <h4>${item.title}</h4>
        <span class="item-meta">${item.category} • ${item.date}</span>
      </div>
      <div class="item-right">
        <span class="${amountClass}">${sign}₹${item.amount.toLocaleString("en-IN")}</span>
        <button class="delete-btn" onclick="deleteTransaction(${item.id})" title="Delete">✕</button>
      </div>
    `;

    transactionList.appendChild(li);
  });
}

// Render Category Expense Chart
function renderChart() {
  const expenses = transactions.filter(function (item) {
    return item.type === "expense";
  });

  expenseCountEl.textContent = expenses.length + (expenses.length === 1 ? " expense" : " expenses");

  if (expenses.length === 0) {
    chartContainer.innerHTML = '<p class="empty-msg">Add some expenses to see category breakdown.</p>';
    return;
  }

  // Group amounts by category
  const categoryTotals = {};
  let grandTotal = 0;

  expenses.forEach(function (item) {
    if (!categoryTotals[item.category]) {
      categoryTotals[item.category] = 0;
    }
    categoryTotals[item.category] += item.amount;
    grandTotal += item.amount;
  });

  chartContainer.innerHTML = "";

  for (const category in categoryTotals) {
    const amount = categoryTotals[category];
    const percent = Math.round((amount / grandTotal) * 100);

    const chartItem = document.createElement("div");
    chartItem.className = "chart-item";
    chartItem.innerHTML = `
      <div class="chart-item-head">
        <span>${category} (${percent}%)</span>
        <strong>₹${amount.toLocaleString("en-IN")}</strong>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${percent}%"></div>
      </div>
    `;
    chartContainer.appendChild(chartItem);
  }
}

// Refresh everything
function updateUI() {
  updateSummary();
  renderList();
  renderChart();
}

// Run on page load
updateUI();
