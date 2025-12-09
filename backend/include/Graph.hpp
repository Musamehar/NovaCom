#pragma once
#include "User.hpp"
#include <unordered_map>
#include <vector>
#include <string>
#include <iostream>
#include <queue>
#include <set>
#include <map>
#include <algorithm>

using namespace std;

class NovaGraph {
private:
    // --- Data Stores ---
    unordered_map<int, User> userDB;
    unordered_map<int, vector<int>> adjList; // The Social Graph

    // --- Helper Functions ---
    vector<string> split(const string& s, char delimiter);

public:
    // --- Core Lifecycle ---
    void loadData(); // Loads users.txt and graph.txt
    void saveData(); // Saves to data/ folder

    // --- Graph Operations ---
    void addUser(int id, string name);
    void addFriendship(int u, int v);
	
	 // --- NEW ALGORITHMS (PHASE 2) ---
    // BFS: Find connections at a specific depth (e.g., 2 = Friends of Friends)
    string getConnectionsByDegreeJSON(int startNode, int targetDegree);
    
    // Recommendations: Suggest friends based on mutuals
    string getRecommendationsJSON(int userId);

    // --- API Responses (JSON Strings) ---
    string getUserJSON(int id);
    string getFriendListJSON(int id);
};