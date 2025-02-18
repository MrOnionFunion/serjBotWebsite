// List of symbols to use in the slot machine
const symbols = ["🍒", "🍋", "🍊", "🍇", "🍉", "⭐"];

// Replace with your actual webhook URL
const webhookURL = "https://discord.com/api/webhooks/1341473262714228889/EODUhMpY4Pk_J6Z8RQyfl0eK4y8i5jbEd0pQkw9Z4e1Htn8Npx0vhlZES9wUdEPdbcNN";

// Add a secret key to secure your payload (this must match what your bot expects)
const SECRET_KEY = "MY_SUPER_SECRET_SLOT_KEY";


/*******************/
/* Tab Functionality */
/*******************/
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
  
    // If the Leaderboard or Stocks tab is selected, load the data.
    if (tabName === "leaderboard") {
      loadLeaderboard();
    } else if (tabName === "stocks") {
      loadStocks();
    }
  }
  
  document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("defaultOpen").click();
  });
  
  /*******************/
  /* Slot Machine Code */
  /*******************/
  
  
  document.getElementById('spinButton').addEventListener('click', spinSlotMachine);
  
  function spinSlotMachine() {
    const username = document.getElementById('username').value.trim();
    const bet = parseInt(document.getElementById('bet').value);
    const messageDiv = document.getElementById('message');
  
    // Validate input
    if (!username) {
      messageDiv.textContent = "Please enter your Discord username.";
      return;
    }
    if (!bet || bet < 1) {
      messageDiv.textContent = "Please enter a valid bet amount.";
      return;
    }
  
    // Spin the reels
    const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel3 = symbols[Math.floor(Math.random() * symbols.length)];
  
    document.getElementById('reel1').textContent = reel1;
    document.getElementById('reel2').textContent = reel2;
    document.getElementById('reel3').textContent = reel3;
  
    // Determine the outcome (win if all three match)
    let win = false;
    let payout = 0;
    if (reel1 === reel2 && reel2 === reel3) {
      win = true;
      payout = bet * 3;
    }
  
    // Update the message display
    if (win) {
      messageDiv.textContent = `Congratulations ${username}! You won ${payout} coins!`;
    } else {
      messageDiv.textContent = `Sorry ${username}, you lost ${bet} coins. Try again!`;
    }
  
    // Prepare the payload to send via webhook
    const payload = {
      secret: SECRET_KEY,
      username: username,
      bet: bet,
      win: win,
      payout: payout,
      reels: [reel1, reel2, reel3]
    };
  
    // Prepare the webhook payload (sending as the message content)
    const body = {
      content: JSON.stringify(payload)
    };
  
    fetch(webhookURL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    })
    .then(response => response.text())
    .then(data => console.log('Webhook sent:', data))
    .catch(error => console.error('Error sending webhook:', error));
  }
  /*******************/
/* Leaderboard Code */
/*******************/
function loadLeaderboard() {
  const leaderboardContent = document.getElementById("leaderboardContent");
  
  fetch("http://YOUR_BOT_SERVER:8080/api/leaderboard")
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        leaderboardContent.innerHTML = "<p>No leaderboard data available.</p>";
        return;
      }
      let html = "<table>";
      html += "<tr><th>Rank</th><th>Username</th><th>Balance</th></tr>";
      data.forEach(entry => {
        html += `<tr>
                   <td>${entry.rank}</td>
                   <td>${entry.username}</td>
                   <td>${entry.balance}</td>
                 </tr>`;
      });
      html += "</table>";
      leaderboardContent.innerHTML = html;
    })
    .catch(err => {
      console.error("Error loading leaderboard:", err);
      leaderboardContent.innerHTML = "<p>Error loading leaderboard.</p>";
    });
}

/*******************/
/* Stocks Code */
/*******************/
function loadStocks() {
  const stocksContent = document.getElementById("stocksContent");
  
  fetch("http://YOUR_BOT_SERVER:8080/api/stocks")
    .then(response => response.json())
    .then(data => {
      // If no stocks are available:
      if (Object.keys(data).length === 0) {
        stocksContent.innerHTML = "<p>No stock data available.</p>";
        return;
      }
      let html = "<table>";
      html += "<tr><th>Symbol</th><th>Price</th><th>Previous Price</th></tr>";
      Object.entries(data).forEach(([symbol, info]) => {
        let price, prev_price;
        if (typeof info === "object") {
          price = info.price;
          prev_price = info.prev_price;
        } else {
          price = info;
          prev_price = info;
        }
        html += `<tr>
                   <td>${symbol}</td>
                   <td>${price}</td>
                   <td>${prev_price}</td>
                 </tr>`;
      });
      html += "</table>";
      stocksContent.innerHTML = html;
    })
    .catch(err => {
      console.error("Error loading stocks:", err);
      stocksContent.innerHTML = "<p>Error loading stock data.</p>";
    });
}
