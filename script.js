/*******************/
/* Tab Functionality */
/*******************/
function openTab(evt, tabName) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.classList.add("active");
  if (tabName === "leaderboard") loadLeaderboard();
  if (tabName === "stocks") loadStocks();
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("defaultOpen").click();
  // Set roulette wheel background with dynamically generated gradient
  document.getElementById("rouletteWheel").style.background = generateRouletteGradient();
});

/*******************/
/* Webhook Setup */
/*******************/
const webhookURL = "https://discord.com/api/webhooks/1341473262714228889/EODUhMpY4Pk_J6Z8RQyfl0eK4y8i5jbEd0pQkw9Z4e1Htn8Npx0vhlZES9wUdEPdbcNN"; // Replace with your webhook URL
const SECRET_KEY = "MY_SUPER_SECRET_SLOT_KEY"; // Your secret key

function sendWebhook(payload) {
  const body = { content: JSON.stringify(payload) };
  fetch(webhookURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(response => response.text())
  .then(data => console.log('Webhook sent:', data))
  .catch(error => console.error('Error sending webhook:', error));
}

/*******************/
/* Generate Roulette Wheel Gradient */
/*******************/
function generateRouletteGradient() {
  const segments = 37;
  const degPer = 360 / segments;
  const stops = [];
  for (let i = 0; i < segments; i++) {
    const start = i * degPer;
    const end = (i + 1) * degPer;
    let color;
    if (i === 0) {
      color = "green"; // 0 is green
    } else {
      // Alternate red and black for the remaining 36 segments
      color = (i % 2 === 1) ? "red" : "black";
    }
    stops.push(`${color} ${start}deg ${end}deg`);
  }
  return `conic-gradient(${stops.join(", ")})`;
}

/*******************/
/* SLOTS GAME with Animation */
/*******************/
const slotSymbols = ["🍒", "🍋", "🍊", "🍇", "🍉", "⭐"];
document.getElementById('slotsSpinButton').addEventListener('click', () => {
  const username = document.getElementById('slotsUsername').value.trim();
  const bet = parseInt(document.getElementById('slotsBet').value);
  const messageDiv = document.getElementById('slotsMessage');
  
  if (!username) {
    messageDiv.textContent = "Please enter your Discord username.";
    return;
  }
  if (!bet || bet < 1) {
    messageDiv.textContent = "Please enter a valid bet amount.";
    return;
  }
  
  // Set up spinning animation for each reel
  const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
  const finalSymbols = [];
  let reelsCompleted = 0;
  
  reels.forEach((reel, index) => {
    const spinInterval = setInterval(() => {
      reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
    }, 100);
    
    // Stop each reel after a delay (staggered)
    setTimeout(() => {
      clearInterval(spinInterval);
      const finalSymbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
      reel.textContent = finalSymbol;
      finalSymbols[index] = finalSymbol;
      reelsCompleted++;
      
      if (reelsCompleted === reels.length) {
        let win = false;
        let payout = 0;
        if (finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2]) {
          win = true;
          payout = bet * 3;
        }
        messageDiv.textContent = win 
          ? `Congratulations ${username}! You won ${payout} coins!`
          : `Sorry ${username}, you lost ${bet} coins. Try again!`;
        
        sendWebhook({
          game: "Slots",
          secret: SECRET_KEY,
          username: username,
          bet: bet,
          win: win,
          payout: payout,
          reels: finalSymbols
        });
      }
    }, 1000 + index * 500);
  });
});

/*******************/
/* BLACKJACK GAME */
/*******************/
let bjDeck = [], bjPlayerHand = [], bjDealerHand = [], bjGameActive = false;
const bjDealButton = document.getElementById('bjDealButton');
const bjHitButton = document.getElementById('bjHitButton');
const bjStandButton = document.getElementById('bjStandButton');
const bjMessage = document.getElementById('bjMessage');

bjDealButton.addEventListener('click', startBlackjack);
bjHitButton.addEventListener('click', playerHit);
bjStandButton.addEventListener('click', playerStand);

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const deck = [];
  suits.forEach(suit => {
    ranks.forEach(rank => deck.push({ rank, suit }));
  });
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(card) {
  if (card.rank === 'A') return 11;
  if (['K','Q','J'].includes(card.rank)) return 10;
  return parseInt(card.rank);
}

function handValue(hand) {
  let total = hand.reduce((sum, card) => sum + cardValue(card), 0);
  let aces = hand.filter(card => card.rank === 'A').length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function displayHand(hand, elementId) {
  const container = document.getElementById(elementId);
  container.innerHTML = "";
  hand.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.textContent = card.rank + card.suit;
    container.appendChild(cardDiv);
  });
}

function updateBlackjackUI() {
  displayHand(bjPlayerHand, 'playerCards');
  displayHand(bjDealerHand, 'dealerCards');
  document.getElementById('playerValue').textContent = "Total: " + handValue(bjPlayerHand);
  document.getElementById('dealerValue').textContent = "Total: " + handValue(bjDealerHand);
}

function startBlackjack() {
  const username = document.getElementById('bjUsername').value.trim();
  const bet = parseInt(document.getElementById('bjBet').value);
  if (!username) {
    bjMessage.textContent = "Please enter your Discord username.";
    return;
  }
  if (!bet || bet < 1) {
    bjMessage.textContent = "Please enter a valid bet amount.";
    return;
  }
  bjDeck = shuffle(createDeck());
  bjPlayerHand = [bjDeck.pop(), bjDeck.pop()];
  bjDealerHand = [bjDeck.pop(), bjDeck.pop()];
  bjGameActive = true;
  bjMessage.textContent = "";
  bjDealButton.disabled = true;
  bjHitButton.disabled = false;
  bjStandButton.disabled = false;
  updateBlackjackUI();
}

function playerHit() {
  if (!bjGameActive) return;
  bjPlayerHand.push(bjDeck.pop());
  updateBlackjackUI();
  if (handValue(bjPlayerHand) > 21) {
    bjMessage.textContent = "Bust! You lose.";
    endBlackjack("loss");
  }
}

function playerStand() {
  if (!bjGameActive) return;
  while (handValue(bjDealerHand) < 17) {
    bjDealerHand.push(bjDeck.pop());
  }
  updateBlackjackUI();
  const playerTotal = handValue(bjPlayerHand);
  const dealerTotal = handValue(bjDealerHand);
  let result = "";
  if (dealerTotal > 21 || playerTotal > dealerTotal) {
    result = "win";
    bjMessage.textContent = "You win!";
  } else if (playerTotal === dealerTotal) {
    result = "push";
    bjMessage.textContent = "Push. It's a tie!";
  } else {
    result = "loss";
    bjMessage.textContent = "You lose.";
  }
  endBlackjack(result);
}

function endBlackjack(result) {
  bjGameActive = false;
  bjDealButton.disabled = false;
  bjHitButton.disabled = true;
  bjStandButton.disabled = true;
  const username = document.getElementById('bjUsername').value.trim();
  const bet = parseInt(document.getElementById('bjBet').value);
  let payout = 0;
  if (result === "win") payout = bet * 2;
  if (result === "push") payout = bet;
  sendWebhook({
    game: "Blackjack",
    secret: SECRET_KEY,
    username: username,
    bet: bet,
    result: result,
    payout: payout,
    playerHand: bjPlayerHand,
    dealerHand: bjDealerHand
  });
}

/*******************/
/* ROULETTE GAME with Animation */
/*******************/
document.getElementById('rtSpinButton').addEventListener('click', () => {
  const username = document.getElementById('rtUsername').value.trim();
  const bet = parseInt(document.getElementById('rtBet').value);
  const betType = document.getElementById('rtBetType').value;
  const optionInput = document.getElementById('rtBetOption');
  const messageDiv = document.getElementById('rtMessage');
  
  if (!username) {
    messageDiv.textContent = "Please enter your Discord username.";
    return;
  }
  if (!bet || bet < 1) {
    messageDiv.textContent = "Please enter a valid bet amount.";
    return;
  }
  
  let playerBet;
  if (betType === "color" || betType === "evenodd") {
    playerBet = optionInput.value;
    if (!playerBet) {
      messageDiv.textContent = "Please select an option.";
      return;
    }
  } else if (betType === "number") {
    playerBet = parseInt(optionInput.value);
    if (isNaN(playerBet) || playerBet < 0 || playerBet > 36) {
      messageDiv.textContent = "Please enter a number between 0 and 36.";
      return;
    }
  }
  
  // Calculate a random roulette result (0-36)
  const resultNumber = Math.floor(Math.random() * 37);
  const resultColor = getRouletteColor(resultNumber);
  
  // Determine the rotation for the wheel
  const segments = 37;
  const anglePerSegment = 360 / segments;
  const fullSpins = Math.floor(Math.random() * 3) + 3;
  const offset = anglePerSegment / 2;
  const finalRotation = fullSpins * 360 + (360 - (resultNumber * anglePerSegment) - offset);
  
  const wheel = document.getElementById('rouletteWheel');
  wheel.style.transition = "transform 3s cubic-bezier(0.33, 1, 0.68, 1)";
  wheel.style.transform = `rotate(${finalRotation}deg)`;
  
  wheel.addEventListener('transitionend', function handler() {
    wheel.removeEventListener('transitionend', handler);
    
    let win = false;
    let payout = 0;
    if (betType === "color") {
      if (playerBet.toLowerCase() === resultColor.toLowerCase()) {
        win = true;
        payout = bet * 2;
      }
    } else if (betType === "evenodd") {
      if (resultNumber !== 0) {
        const parity = resultNumber % 2 === 0 ? "even" : "odd";
        if (playerBet.toLowerCase() === parity) {
          win = true;
          payout = bet * 2;
        }
      }
    } else if (betType === "number") {
      if (playerBet === resultNumber) {
        win = true;
        payout = bet * 35;
      }
    }
    
    messageDiv.innerHTML = `Roulette Result: <strong>${resultNumber} (${resultColor})</strong><br>` +
                             (win ? `Congratulations ${username}, you won ${payout} coins!` 
                                  : `Sorry ${username}, you lost ${bet} coins.`);
    
    sendWebhook({
      game: "Roulette",
      secret: SECRET_KEY,
      username: username,
      bet: bet,
      betType: betType,
      playerBet: playerBet,
      resultNumber: resultNumber,
      resultColor: resultColor,
      win: win,
      payout: payout
    });
  });
});

function getRouletteColor(num) {
  const reds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  if (num === 0) return "Green";
  return reds.includes(num) ? "Red" : "Black";
}

function updateRouletteBetOptions() {
  const betType = document.getElementById('rtBetType').value;
  const container = document.getElementById('rtBetOptionContainer');
  container.innerHTML = "";
  let label = document.createElement('label');
  label.setAttribute("for", "rtBetOption");
  let input;
  
  if (betType === "color") {
    label.textContent = "Choose Color:";
    input = document.createElement('select');
    input.id = "rtBetOption";
    input.innerHTML = `<option value="Red">Red</option>
                       <option value="Black">Black</option>
                       <option value="Green">Green</option>`;
  } else if (betType === "evenodd") {
    label.textContent = "Choose Even or Odd:";
    input = document.createElement('select');
    input.id = "rtBetOption";
    input.innerHTML = `<option value="even">Even</option>
                       <option value="odd">Odd</option>`;
  } else if (betType === "number") {
    label.textContent = "Pick a Number (0-36):";
    input = document.createElement('input');
    input.id = "rtBetOption";
    input.type = "number";
    input.min = "0";
    input.max = "36";
    input.placeholder = "e.g., 17";
  }
  container.appendChild(label);
  container.appendChild(input);
}

/*******************/
/* Leaderboard (Simulated Data) */
/*******************/
function loadLeaderboard() {
  const leaderboardContent = document.getElementById("leaderboardContent");
  const simulatedData = [
    { username: "Alice", balance: 1500 },
    { username: "Bob", balance: 1200 },
    { username: "Charlie", balance: 900 }
  ];
  
  let html = "<table><tr><th>Rank</th><th>Username</th><th>Balance</th></tr>";
  simulatedData.forEach((entry, index) => {
    html += `<tr>
               <td>${index + 1}</td>
               <td>${entry.username}</td>
               <td>${entry.balance}</td>
             </tr>`;
  });
  html += "</table>";
  leaderboardContent.innerHTML = html;
}

/*******************/
/* Stocks (Simulated Data) */
/*******************/
function loadStocks() {
  const stocksContent = document.getElementById("stocksContent");
  const simulatedStocks = [
    { symbol: "AAPL", price: 150, change: "+1.5" },
    { symbol: "GOOG", price: 2800, change: "-15" },
    { symbol: "TSLA", price: 700, change: "+10" }
  ];
  
  let html = "<table><tr><th>Symbol</th><th>Price</th><th>Change</th></tr>";
  simulatedStocks.forEach(stock => {
    html += `<tr>
               <td>${stock.symbol}</td>
               <td>${stock.price}</td>
               <td>${stock.change}</td>
             </tr>`;
  });
  html += "</table>";
  stocksContent.innerHTML = html;
}
