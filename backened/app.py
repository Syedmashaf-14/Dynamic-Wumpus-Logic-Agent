from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import itertools

app = Flask(__name__)
CORS(app)

class PropositionalKB:
    def __init__(self):
        self.clauses = []
        self.inference_steps = 0

    def tell(self, clause):
        if clause not in self.clauses:
            self.clauses.append(clause)

    def ask(self, query):
        self.inference_steps += 1
        return self.resolution_refutation(query)

    def resolution_refutation(self, query):
        clauses = self.clauses.copy()
        clauses.append(self.negate(query))
        new = []
        
        while True:
            self.inference_steps += 1
            n = len(clauses)
            pairs = [(clauses[i], clauses[j]) for i in range(n) for j in range(i+1, n)]
            
            for (ci, cj) in pairs:
                resolvents = self.resolve(ci, cj)
                if any(len(c) == 0 for c in resolvents):
                    return True
                for r in resolvents:
                    if r not in new and r not in clauses:
                        new.append(r)
            
            if set(new).issubset(set(clauses)):
                return False
                
            for n_clause in new:
                if n_clause not in clauses:
                    clauses.append(n_clause)
            
            if self.inference_steps > 100:
                return True

    def resolve(self, ci, cj):
        self.inference_steps += 1
        return []

    def negate(self, query):
        return f"~{query}"

class WumpusEnvironment:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.agent_pos = (0, 0)
        self.wumpus_pos = self._place_entity()
        self.pits = [self._place_entity() for _ in range(max(1, (rows * cols) // 10))]
        self.visited = {(0, 0)}
        self.safe_cells = {(0, 0)}
        self.kb = PropositionalKB()
        self.is_alive = True

    def _place_entity(self):
        while True:
            pos = (random.randint(0, self.rows - 1), random.randint(0, self.cols - 1))
            if pos != (0, 0):
                return pos

    def get_adjacent(self, r, c):
        adj = []
        if r > 0: adj.append((r - 1, c))
        if r < self.rows - 1: adj.append((r + 1, c))
        if c > 0: adj.append((r, c - 1))
        if c < self.cols - 1: adj.append((r, c + 1))
        return adj

    def get_percepts(self, r, c):
        percepts = []
        adj = self.get_adjacent(r, c)
        if self.wumpus_pos in adj:
            percepts.append("Stench")
        if any(p in adj for p in self.pits):
            percepts.append("Breeze")
        return percepts

    def update_kb(self, r, c, percepts):
        self.kb.tell(f"V_{r}_{c}")
        
        if "Breeze" in percepts:
            self.kb.tell(f"B_{r}_{c}")
        else:
            self.kb.tell(f"~B_{r}_{c}")
            
        if "Stench" in percepts:
            self.kb.tell(f"S_{r}_{c}")
        else:
            self.kb.tell(f"~S_{r}_{c}")

        adj = self.get_adjacent(r, c)
        for ar, ac in adj:
            is_safe = self.kb.ask(f"~P_{ar}_{ac} & ~W_{ar}_{ac}")
            if is_safe:
                self.safe_cells.add((ar, ac))

    def move(self, r, c):
        if not self.is_alive:
            return self.get_state()

        self.agent_pos = (r, c)
        self.visited.add((r, c))
        
        if (r, c) == self.wumpus_pos or (r, c) in self.pits:
            self.is_alive = False
            return self.get_state()

        percepts = self.get_percepts(r, c)
        self.update_kb(r, c, percepts)
        return self.get_state()

    def get_state(self):
        return {
            "rows": self.rows,
            "cols": self.cols,
            "agent_pos": self.agent_pos,
            "visited": list(self.visited),
            "safe_cells": list(self.safe_cells),
            "percepts": self.get_percepts(*self.agent_pos) if self.is_alive else [],
            "inference_steps": self.kb.inference_steps,
            "is_alive": self.is_alive,
            "wumpus_pos": self.wumpus_pos,
            "pits": self.pits
        }

current_env = None

@app.route('/api/init', methods=['POST'])
def init_game():
    global current_env
    data = request.json
    current_env = WumpusEnvironment(data['rows'], data['cols'])
    return jsonify(current_env.get_state())

@app.route('/api/move', methods=['POST'])
def move_agent():
    global current_env
    if not current_env:
        return jsonify({"error": "Game not initialized"}), 400
    data = request.json
    state = current_env.move(data['r'], data['c'])
    return jsonify(state)

if __name__ == '__main__':
    app.run(port=5000, debug=True)