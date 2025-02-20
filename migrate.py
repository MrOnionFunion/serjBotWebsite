import json
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate(r"C:\Programming\botJson\serjeconomybot-firebase-adminsdk-fbsvc-c332461cd6.json")  # Replace with your path
firebase_admin.initialize_app(cred)
db = firestore.client()

# Paths to your JSON files
BALANCE_FILE = r"C:\Programming\botJson\balances.json"
STOCK_FILE = r"C:\Programming\botJson\stock.json"

# Load and upload balances
with open(BALANCE_FILE, "r") as f:
    balances_data = json.load(f)

for uid, entry in balances_data.items():
    if isinstance(entry, dict):
        username = entry.get("username", f"User {uid}")
        balance = entry.get("balance", 100)
    else:
        username = f"User {uid}"
        balance = entry
    db.collection("balances").document(uid).set({
        "username": username,
        "balance": balance
    })

# Load and upload stocks
with open(STOCK_FILE, "r") as f:
    stocks_data = json.load(f)

# Upload stock prices
for symbol, info in stocks_data.get("stocks", {}).items():
    if isinstance(info, dict):
        db.collection("stocks").document(symbol).set(info)
    else:
        db.collection("stocks").document(symbol).set({"price": info, "prev_price": info})

# Upload user investments as subcollections
for uid, investments in stocks_data.get("users", {}).items():
    for stock, details in investments.items():
        db.collection("balances").document(uid).collection("investments").document(stock).set(details)

print("Data migration to Firestore completed!")