# Tourism Trivia Challenge 2025 – SLITT University 🎓🌍  

[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)  
[![Made with Excel](https://img.shields.io/badge/Data-Excel-brightgreen?logo=microsoft-excel)](https://www.microsoft.com/en/microsoft-365/excel)  
[![Deployed on GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-blue?logo=github)](https://pages.github.com/)  

A **real-time tournament dashboard** developed for the *Tourism Trivia Challenge 2025* at **SLITT University**.  
This system integrates with **Excel/Google Sheets** to provide live score tracking, automated leaderboards, and a responsive web interface.  

---

## ✨ Key Features  

- **Real-Time Data Sync** – Fetches scores directly from a published Google Sheet or Excel CSV.  
- **Dynamic Leaderboard** – Automatically updates team rankings with medals (🥇🥈🥉) and points.  
- **Round Management** – Supports multiple quiz rounds:  
  - Round 1: Picture Round  
  - Round 2: Multiple Choice  
  - Round 3: Rapid Fire  
- **Flexible Refresh Options** – Auto-refresh every 5s, 10s, 30s, or 1m, plus manual refresh controls.  
- **Modern, Responsive UI** – Built with HTML, CSS, and vanilla JavaScript, optimized for desktop and mobile.  

---

## 🗂 Project Structure  

```plaintext
├── index.html   # Main dashboard layout
├── style.css    # Styling and responsive design
├── script.js    # Data fetching, parsing, and rendering logic
```

---

## ⚙️ How It Works  

1. **Prepare the data source**  
   - Create an Excel/Google Sheet with the following columns:  
     ```
     Round | Bracket | Team | Score
     ```  

   Example:  

   | Round | Bracket   | Team   | Score |
   |-------|-----------|--------|-------|
   | 1     | Match 1   | Team A | 5     |
   | 1     | Match 1   | Team B | 3     |
   | 2     | Match 2   | Team C | 8     |

2. **Publish the sheet as CSV**  
   - In Google Sheets: *File → Share → Publish to Web → CSV*.  

3. **Configure the dashboard**  
   - Update the `MATCHES_CSV_URL` in `script.js` with your published CSV link.  

4. **Launch the dashboard**  
   - Open `index.html` in any modern browser.  
   - Scores and leaderboards will update automatically.  

---

## 🚀 Deployment Options  

- **Local Setup**  
  ```bash
  git clone https://github.com/yourusername/tourism-trivia-2025.git
  cd tourism-trivia-2025
  ```
  - Update `script.js` with your data source  
  - Open `index.html` in a browser  

- **Online Hosting**  
  - Deploy via **GitHub Pages**, **Netlify**, or **Vercel**  
  - Share the live dashboard link with participants and audiences  

---

## 📸 Suggested Screenshots  

- Dashboard with active rounds and match results  
- Leaderboard view with medals (🥇🥈🥉) and points  

---

## 🎓 About the Event  

The *Tourism Trivia Challenge 2025* is an academic quiz competition organized by **SLITT University**, celebrating excellence in **tourism, geography, and cultural knowledge**.  
This dashboard was developed to modernize the event with a **transparent, real-time scoring system** and an **engaging audience experience**.  

---

## 🙌 Acknowledgements  

- Developed for **SLITT University – Tourism Trivia Challenge 2025**  
- Built using **HTML, CSS, JavaScript, and Excel/Google Sheets**  
- Designed to support academic competitions, cultural quizzes, and similar events  

---
