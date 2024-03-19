// Funkcja do zapisywania danych akcji do lokalnego magazynu danych w formacie JSON
function saveDataToJSON(stockName, data) {
    const allStockData = JSON.parse(localStorage.getItem('stockData')) || {};
    allStockData[stockName] = data;
    localStorage.setItem('stockData', JSON.stringify(allStockData));
}

// Funkcja do ładowania danych akcji z lokalnego magazynu danych w formacie JSON
function loadDataFromJSON(stockName) {
    const allStockData = JSON.parse(localStorage.getItem('stockData')) || {};
    return allStockData[stockName] || { sharesOwned: 0, totalValue: 0 };
}

function updateStockData(stockName, sharesChange, totalValueChange, lastPrice) {
    const stockData = loadDataFromJSON(stockName);
    stockData.sharesOwned += sharesChange;
    // Aktualizacja całkowitej wartości powinna zależeć od aktualnej ceny akcji i ilości posiadanych akcji
    stockData.totalValue = stockData.sharesOwned * lastPrice;
    saveDataToJSON(stockName, stockData);
    document.getElementById('sharesOwned').innerText = stockData.sharesOwned;
    document.getElementById('totalValue').innerText = stockData.totalValue.toFixed(2) + " PLN";
}
function updateZoom(stockChart, stockPrices) {
    stockChart.data.datasets.forEach((dataset) => {
        dataset.data = stockPrices.slice(-zoomLevel); // Dostosuj wyświetlane dane do poziomu zoomu
    });
    stockChart.update();
}   

// Funkcja do inicjalizacji wykresu
function setupChart() {
    const initialPrice = 100; // Początkowa cena akcji
    const stockPrices = [initialPrice];
    
    const ctx = document.getElementById('stockChart').getContext('2d');
    const stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Usunięto domyślną etykietę
            datasets: [{
                label: '', // Pusta etykieta, aby ukryć nazwę serii danych
                data: stockPrices,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                pointRadius: 0 // Usuwa punkty z linii wykresu
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                },
                x: {
                    // Konfiguracja osi X, aby nie wyświetlała etykiet
                    ticks: {
                        display: false // Nie wyświetlaj etykiet dla osi X
                    },
                    grid: {
                        display: false, // Opcjonalnie, ukryj również linie siatki osi X
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Ukryj legendę
                }
            },
            animation: {
                duration: 0 // Usuwa animacje
            },
            hover: {
                mode: null // Wyłącza interakcje z kursorem
            },
            elements: {
                line: {
                    tension: 0 // Usuwa wygładzanie linii
                },
                point: {
                    radius: 0 // Dodatkowo zapewnia, że punkty nie będą widoczne
                }
            }
        }
    });
    
    
    
    updateChart(stockChart, stockPrices); // Aktualizuj wykres

    // Obsługa scrolla dla zoomu
    document.getElementById('stockChart').addEventListener('wheel', function(event) {
        event.preventDefault(); // Zapobiegaj domyślnemu zachowaniu scrolla
        const delta = event.deltaY < 0 ? 5 : -5; // Kierunek scrolla decyduje o zmianie zoomu
        zoomLevel = Math.min(Math.max(zoomLevel + delta, 5), stockPrices.length); // Ogranicz zoomLevel do dopuszczalnych wartości
        
        updateZoom(stockChart, stockPrices); // Aktualizuj wykres z nowym poziomem zoomu
    });
}

// Dodaj obsługę przycisków zoomu
function setupZoomButtons() {
    document.getElementById('zoomIn').addEventListener('click', () => {
        zoomLevel = Math.max(zoomLevel - 5, 5); // Ogranicz minimalny zoom do 5 punktów
        updateZoom(stockChart);
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        zoomLevel = Math.min(zoomLevel + 5, stockPrices.length); // Ogranicz maksymalny zoom do liczby dostępnych punktów
        updateZoom(stockChart);
    });
}
document.querySelectorAll('.faq-question').forEach(item => {
    item.addEventListener('click', () => {
        const answer = item.nextElementSibling;
        const faq = item.parentNode;

        if (faq.classList.contains('active')) {
            faq.classList.remove('active');
            answer.style.maxHeight = '0';
            answer.style.padding = '0 10px';
        } else {
            document.querySelectorAll('.faq').forEach(faq => {
                faq.classList.remove('active');
                faq.querySelector('.faq-answer').style.maxHeight = '0';
                faq.querySelector('.faq-answer').style.padding = '0 10px';
            });

            faq.classList.add('active');
            answer.style.maxHeight = '200px'; // Zakładamy, że jest to wystarczająca maksymalna wysokość
            answer.style.padding = '10px';
        }
    });
});



let zoomLevel = 20; // Stała liczba punktów danych do wyświetlenia

function updateChart(stockChart, stockPrices) {
    setInterval(() => {
        const previousPrice = parseFloat(stockPrices[stockPrices.length - 1]);
        const newPrice = previousPrice + (Math.random() - 0.5) * 10;
        stockPrices.push(newPrice.toFixed(2));
        
        // Usuń najstarszy punkt danych, jeśli liczba punktów przekracza zoomLevel
        if (stockPrices.length > zoomLevel) {
            stockPrices.shift();
        }

        const currentPriceElement = document.getElementById('currentPrice');
        currentPriceElement.innerText = newPrice.toFixed(2);
        updatePriceChangeDisplay(previousPrice, newPrice);

        // Dostosuj etykiety do aktualnej liczby punktów danych, utrzymując ich stałą liczbę
        // Tutaj zdecydowałem się na puste etykiety, aby zachować wykres czystym
        let labels = new Array(stockPrices.length).fill('');

        // Aktualizacja danych wykresu
        stockChart.data.labels = labels;
        stockChart.data.datasets[0].data = stockPrices;
        stockChart.update();
    }, 1000);
}

function updateBalance(newBalance) {
    var $balance = $('#balance'); // Używamy selektora jQuery do znalezienia elementu

    // Formatowanie liczby do dwóch miejsc po przecinku z PLN
    var formattedBalance = newBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "<small> PLN</small>";

    // Animujemy zmianę wartości
    $({ animatedValue: parseFloat($balance.text().replace(' PLN', '').replace(',', '')) || 0 }).animate({ animatedValue: newBalance }, {
        duration: 1000,
        step: function() {
            // Uaktualnienie wartości salda z mniejszymi cyframi po przecinku i bez pogrubienia
            $balance.html(this.animatedValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "<small> PLN</small>");
        },
        complete: function() {
            $balance.html(formattedBalance); // Upewniamy się, że końcowa wartość jest dokładna i sformatowana
        }
    });
}

// Funkcja do aktualizowania wyświetlanej zmiany ceny
function updatePriceChangeDisplay(previousPrice, newPrice) {
    const changePercentage = ((newPrice - previousPrice) / previousPrice) * 100;
    const changeElement = document.getElementById('changePercentage');
    changeElement.innerText = changePercentage.toFixed(2) + '%';
    changeElement.style.color = changePercentage >= 0 ? 'green' : 'red';
}

// Funkcja do obsługi przycisków Kup/Sprzedaj
function setupTransactionHandlers() {
    document.getElementById('buyButton').addEventListener('click', function() {
        const sharesToBuy = parseInt(document.getElementById('sharesToBuy').value);
        if (isNaN(sharesToBuy) || sharesToBuy <= 0) {
            alert("Niepoprawna ilość akcji.");
            return;
        }
        const lastPrice = parseFloat(document.getElementById('currentPrice').innerText);
        const totalPrice = lastPrice * sharesToBuy;
        processTransaction('XYZ Corp', sharesToBuy, totalPrice, true);
    });

    document.getElementById('sellButton').addEventListener('click', function() {
        const sharesToSell = parseInt(document.getElementById('sharesToSell').value);
        if (isNaN(sharesToSell) || sharesToSell <= 0) {
            alert("Niepoprawna ilość akcji.");
            return;
        }
        const lastPrice = parseFloat(document.getElementById('currentPrice').innerText);
        const totalPrice = lastPrice * sharesToSell;
        processTransaction('XYZ Corp', sharesToSell, totalPrice, false);
    });
}

function processTransaction(stockName, shares, totalPrice, isBuying) {
    let balance = parseFloat(document.getElementById('balance').innerText.replace(/[^0-9.-]+/g, ""));
    const lastPrice = parseFloat(document.getElementById('currentPrice').innerText);
    
    if (isBuying) {
        if (balance >= totalPrice) {
            balance -= totalPrice;
            updateStockData(stockName, shares, totalPrice, lastPrice); // Dodaj akcje
            addTransactionToHistory(stockName, shares, totalPrice, true); // Dodaj transakcję do historii
        } else {
            showNotification("Niewystarczające środki.", true);
            return;
        }
    } else {
        const stockData = loadDataFromJSON(stockName);
        if (stockData.sharesOwned >= shares) {
            balance += totalPrice;
            updateStockData(stockName, -shares, -totalPrice, lastPrice); // Odejmij akcje
            addTransactionToHistory(stockName, shares, totalPrice, false); // Dodaj transakcję do historii
        } else {
            showNotification("Nie masz wystarczającej ilości akcji do sprzedaży.", true);
            return;
        }
    }
    updateBalance(balance); // Aktualizuj saldo po transakcji
}



// Funkcja dodająca transakcję do historii
function addTransactionToHistory(stockName, shares, totalPrice, isBuying) {
    const transactionText = `${isBuying ? 'Kupiono' : 'Sprzedano'} ${shares} akcji ${stockName} za ${totalPrice.toFixed(2)} PLN.`;
    const transactionsContainer = document.getElementById('transactions');

    const transactionElement = document.createElement('div');
    transactionElement.classList.add('transaction');
    transactionElement.classList.add(isBuying ? 'bought' : 'sold');

    const iconElement = document.createElement('i');
    iconElement.classList.add('fas');
    iconElement.classList.add(isBuying ? 'fa-check' : 'fa-times');
    transactionElement.appendChild(iconElement);

    const textElement = document.createElement('span');
    textElement.textContent = transactionText;
    transactionElement.appendChild(textElement);

    transactionsContainer.insertBefore(transactionElement, transactionsContainer.firstChild);

    if (transactionsContainer.children.length > 4) {
        transactionsContainer.removeChild(transactionsContainer.lastChild);
    }
}

function setupTransactionButtons() {
    const sharesToBuyInput = document.getElementById('sharesToBuy');
    const sharesToSellInput = document.getElementById('sharesToSell');
    const balanceElement = document.getElementById('balance');
    const priceElement = document.getElementById('currentPrice');

    document.getElementById('buyOne').addEventListener('click', () => sharesToBuyInput.value = 1);
    document.getElementById('buyHalf').addEventListener('click', () => {
        const balance = parseFloat(balanceElement.innerText.replace(/[^0-9.-]+/g, ""));
        const price = parseFloat(priceElement.innerText);
        sharesToBuyInput.value = Math.floor((balance / 2) / price); // Połowa dostępnego salda
    });
    document.getElementById('buyAll').addEventListener('click', () => {
        const balance = parseFloat(balanceElement.innerText.replace(/[^0-9.-]+/g, ""));
        const price = parseFloat(priceElement.innerText);
        sharesToBuyInput.value = Math.floor(balance / price); // Całe dostępne saldo
    });

    // Logika sprzedaży pozostaje bez zmian
    document.getElementById('sellOne').addEventListener('click', () => sharesToSellInput.value = 1);
    document.getElementById('sellHalf').addEventListener('click', () => {
        const stockData = loadDataFromJSON('XYZ Corp');
        sharesToSellInput.value = Math.ceil(stockData.sharesOwned / 2);
    });
    document.getElementById('sellAll').addEventListener('click', () => {
        const stockData = loadDataFromJSON('XYZ Corp');
        sharesToSellInput.value = stockData.sharesOwned;
    });
}







// Funkcja do wyświetlania powiadomień
function showNotification(message, isError) {
    const notificationsDiv = document.getElementById('notifications');
    const notificationElement = document.createElement('div');
    notificationElement.classList.add('notification');
    if (isError) {
        notificationElement.classList.add('error');
    }

    const iconElement = document.createElement('i');
    iconElement.classList.add('fas');
    if (isError) {
        iconElement.classList.add('fa-exclamation-circle');
    } else {
        iconElement.classList.add('fa-check');
    }
    notificationElement.appendChild(iconElement);

    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    notificationElement.appendChild(messageElement);

    notificationsDiv.insertBefore(notificationElement, notificationsDiv.firstChild);

    setTimeout(() => {
        notificationsDiv.removeChild(notificationElement);
    }, 5000);
}

window.onload = function() {
    setupChart();
    setupTransactionButtons(); // Dodaj tę linię
    setupTransactionHandlers();
    const stockData = loadDataFromJSON('XYZ Corp');
    document.getElementById('sharesOwned').innerText = stockData.sharesOwned;
    document.getElementById('totalValue').innerText = stockData.totalValue.toFixed(2) + " PLN"; // Dodaj tę linię
    updateBalance(1200); // Aktualizuje saldo do 1,200,000.00 z animacją
};