# Habit-Tracker

A simple **habit tracker** with a weekly grid, streak tracking, and persistent data using localStorage.

---

## 🚀 Run

No setup required:

- Open `index.html` in your browser  
- Or run a local server:

```bash
npx serve .


## ✨ Features

- Add, edit, and delete habits  
- Weekly grid layout (Monday → Sunday)  
- Highlight for the current day  
- Automatic streak tracking 🔥  
- Navigate between weeks  
- Past data preserved, future days disabled  
- Full keyboard support 
- Responsive design 
- Data persisted using browser localStorage  

---

## 🧠 How It Works

- Each habit is stored with a unique ID  
- Daily progress is saved using date keys (`YYYY-MM-DD`)  
- All data is stored in localStorage . 
- Streak is calculated by counting consecutive completed days  
- If today is not completed, the streak continues from previous consecutive days  

---