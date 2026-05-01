# 🧠 Dynamic Wumpus Logic Agent

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup-flask)
  - [Frontend Setup](#frontend-setup-react)
- [Features](#-features)
- [Game Rules](#-game-rules)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)


---

##  About the Project

The **Dynamic Wumpus Logic Agent** is an AI-powered interactive simulation of the classic *Wumpus World* problem, originally described by Russell & Norvig in *Artificial Intelligence: A Modern Approach*. This project brings the game to life with a modern web interface where users can watch an intelligent agent reason through a dangerous cave using **propositional logic** and a **knowledge base**.

The agent must navigate a grid-based dungeon, avoid deadly pits and the fearsome Wumpus, and retrieve the gold — all while relying solely on sensory perceptions and logical inference.

> 🌐 **Try it live:** [dynamic-wumpus-logic-agent-mu.vercel.app](https://dynamic-wumpus-logic-agent-mu.vercel.app)

---

## How It Works

The agent operates in a **4×4 grid world** with the following logic:

- The agent starts at cell `[1,1]` facing East and builds a **knowledge base** as it explores.
- At each step, the agent receives **percepts** from the environment: Stench, Breeze, Glitter, Bump, or Scream.
- Using **propositional logic inference**, the agent deduces which cells are safe to visit and which are dangerous.
- The Flask backend handles all game logic and AI reasoning; the React frontend renders the grid and agent state in real time.

```
┌─────┬─────┬─────┬─────┐
│  S  │     │ B   │  P  │
├─────┼─────┼─────┼─────┤
│     │  B  │     │  B  │
├─────┼─────┼─────┼─────┤
│  S  │  W  │  B  │  P  │
├─────┼─────┼─────┼─────┤
│ 🤖  │  S  │     │     │
└─────┴─────┴─────┴─────┘
  W = Wumpus  P = Pit  S = Stench  B = Breeze  🤖 = Agent
```

---

## 🛠 Tech Stack

| Layer      | Technology        | Purpose                              |
|------------|-------------------|--------------------------------------|
| Frontend   | React (JSX)       | Interactive UI & game grid rendering |
| Styling    | CSS               | Custom styling & animations          |
| Backend    | Python / Flask    | Game logic, AI agent, REST API       |
| AI Logic   | Propositional Logic | Knowledge-based reasoning          |
| Deployment | Vercel            | Frontend hosting                     |

---

##  Project Structure

```
Dynamic-Wumpus-Logic-Agent/
│
├── backened/                  # Flask backend
│   ├── app.py                 # Main Flask application & REST API
│   ├── wumpus_agent.py        # AI agent logic & knowledge base
│   ├── wumpus_world.py        # Game environment & rules engine
│   └── requirements.txt       # Python dependencies
│
├── frontend/                  # React frontend (primary)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # React UI components
│   │   ├── App.js             # Root application component
│   │   ├── App.css            # Application styles
│   │   └── index.js           # Entry point
│   └── package.json
│
└── frontened/                 # Alternate frontend build
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Python](https://www.python.org/) (v3.8 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [pip](https://pip.pypa.io/)

---

### Backend Setup (Flask)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Syedmashaf-14/Dynamic-Wumpus-Logic-Agent.git
   cd Dynamic-Wumpus-Logic-Agent
   ```

2. **Navigate to the backend directory**
   ```bash
   cd backened
   ```

3. **Create a virtual environment** *(recommended)*
   ```bash
   python -m venv venv
   source venv/bin/activate       # On Windows: venv\Scripts\activate
   ```

4. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the Flask server**
   ```bash
   python app.py
   ```
   The backend will start at `http://localhost:5000`

---

### Frontend Setup (React)

1. **Navigate to the frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

>  **Note:** Make sure the Flask backend is running before starting the React frontend so API calls work correctly.

---

##  Features

-  **Intelligent Logic Agent** — The AI agent reasons using a propositional knowledge base to navigate safely.
-  **Interactive Grid World** — Visual 4×4 game grid rendered in React with real-time updates.
-  **Step-by-Step Navigation** — Watch the agent explore the cave cell by cell.
-  **Dynamic World Generation** — The Wumpus, pits, and gold are placed dynamically for each game.
-  **Percept Visualization** — See Stench, Breeze, and Glitter indicators as the agent explores.
-  **REST API Backend** — Clean Flask API separating game logic from the UI.
-  **Responsive UI** — Works on both desktop and mobile browsers.

---

## Game Rules

| Element   | Description |
|-----------|-------------|
| Agent  | Starts at `[1,1]`, must find gold and exit alive |
| Wumpus | Kills the agent on contact; emits **Stench** in adjacent cells |
| Pit    | Kills the agent on contact; emits **Breeze** in adjacent cells |
| Gold   | Goal item; emits **Glitter** when the agent is in the same cell |
| Arrow  | Agent has one arrow to shoot and kill the Wumpus |
| Exit   | Agent must climb out from `[1,1]` with gold to win |

**Percepts:**

| Percept   | Meaning |
|-----------|---------|
| Stench    | Wumpus is in an adjacent (non-diagonal) cell |
| Breeze    | A pit is in an adjacent (non-diagonal) cell |
| Glitter   | Gold is in the current cell |
| Bump      | Agent walked into a wall |
| Scream    | Wumpus was killed by the arrow |

---

## 📡 API Reference

The Flask backend exposes the following endpoints:

| Method | Endpoint         | Description                          |
|--------|------------------|--------------------------------------|
| `GET`  | `/api/start`     | Initialize a new game world          |
| `POST` | `/api/move`      | Send agent action, receive new state |
| `GET`  | `/api/state`     | Get current game state               |
| `POST` | `/api/reset`     | Reset the game to initial state      |

**Example Request:**
```json
POST /api/move
{
  "action": "FORWARD"
}
```

**Example Response:**
```json
{
  "position": [1, 2],
  "percepts": ["Breeze"],
  "alive": true,
  "gold_found": false,
  "score": -1
}
```


## 🌍 Deployment

The frontend is deployed on **Vercel** and can be accessed at:
https://dynamic-wumpus-logic-agent-i7cti9ebr-mashaf-zaidi-s-projects.vercel.app/

---



<div align="center">


</div>
