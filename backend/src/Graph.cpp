#include "../include/Graph.hpp"
#include <fstream>
#include <sstream>
#include <algorithm>
#include <queue>
#include <set>
#include <map>

// --- Helper: Split String ---
vector<string> NovaGraph::split(const string& s, char delimiter) {
    vector<string> tokens;
    string token;
    istringstream tokenStream(s);
    while (getline(tokenStream, token, delimiter)) {
        tokens.push_back(token);
    }
    return tokens;
}

// --- Persistence: Load Data ---
void NovaGraph::loadData() {
    // 1. Load Users (Format: ID,Name)
    ifstream userFile("data/users.txt");
    string line;
    if (userFile.is_open()) {
        while (getline(userFile, line)) {
            if (line.empty()) continue;
            auto parts = split(line, ',');
            if (parts.size() >= 2) {
                int id = stoi(parts[0]);
                string name = parts[1];
                userDB[id] = { id, name, {}, {} };
            }
        }
        userFile.close();
    }

    // 2. Load Friendships (Format: ID,Friend1,Friend2...)
    ifstream graphFile("data/graph.txt");
    if (graphFile.is_open()) {
        while (getline(graphFile, line)) {
            if (line.empty()) continue;
            auto parts = split(line, ',');
            int id = stoi(parts[0]);
            for (size_t i = 1; i < parts.size(); i++) {
                adjList[id].push_back(stoi(parts[i]));
            }
        }
        graphFile.close();
    }
}

// --- Persistence: Save Data ---
void NovaGraph::saveData() {
    // 1. Save Users
    ofstream userFile("data/users.txt");
    for (auto const& [id, user] : userDB) {
        userFile << id << "," << user.name << "\n";
    }
    userFile.close();

    // 2. Save Graph
    ofstream graphFile("data/graph.txt");
    for (auto const& [id, friends] : adjList) {
        graphFile << id;
        for (int friendID : friends) {
            graphFile << "," << friendID;
        }
        graphFile << "\n";
    }
    graphFile.close();
}

// --- Logic ---
void NovaGraph::addUser(int id, string name) {
    if (userDB.find(id) != userDB.end()) return; // Exists
    userDB[id] = { id, name, {}, {} };
}

void NovaGraph::addFriendship(int u, int v) {
    adjList[u].push_back(v);
    adjList[v].push_back(u); // Undirected graph
}

// ==========================================
// PHASE 2 ALGORITHMS
// ==========================================

// 1. BFS for Connection Degrees (The LinkedIn Logic)
string NovaGraph::getConnectionsByDegreeJSON(int startNode, int targetDegree) {
    if (userDB.find(startNode) == userDB.end()) return "[]";

    // Queue stores {UserID, CurrentDepth}
    queue<pair<int, int>> q;
    q.push({ startNode, 0 });

    set<int> visited;
    visited.insert(startNode);

    vector<int> resultIDs;

    while (!q.empty()) {
        auto [currentUser, depth] = q.front();
        q.pop();

        // If we reached the target depth, add to results and DON'T go deeper
        if (depth == targetDegree) {
            resultIDs.push_back(currentUser);
            continue;
        }

        // Stop if we are about to exceed target depth
        if (depth > targetDegree) continue;

        // Explore neighbors
        for (int neighbor : adjList[currentUser]) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                q.push({ neighbor, depth + 1 });
            }
        }
    }

    // Convert to JSON
    string json = "[";
    for (size_t i = 0; i < resultIDs.size(); ++i) {
        User& u = userDB[resultIDs[i]];
        json += "{ \"id\": " + to_string(u.id) + ", \"name\": \"" + u.name + "\", \"degree\": " + to_string(targetDegree) + " }";
        if (i < resultIDs.size() - 1) json += ", ";
    }
    json += "]";
    return json;
}

// 2. Recommendation Engine (Mutual Friends)
string NovaGraph::getRecommendationsJSON(int userId) {
    if (adjList.find(userId) == adjList.end()) return "[]";

    // Map<CandidateID, MutualCount>
    map<int, int> frequencyMap;
    const vector<int>& myFriends = adjList[userId];

    // Mark my friends (so we don't recommend existing friends)
    set<int> existingFriends(myFriends.begin(), myFriends.end());
    existingFriends.insert(userId); // Don't recommend myself

    // Logic: Look at friends -> Look at THEIR friends
    for (int friendId : myFriends) {
        for (int candidate : adjList[friendId]) {
            // If candidate is NOT me and NOT already my friend
            if (existingFriends.find(candidate) == existingFriends.end()) {
                frequencyMap[candidate]++;
            }
        }
    }

    // Convert Map to Vector for Sorting
    vector<pair<int, int>> candidates;
    for (auto const& [id, count] : frequencyMap) {
        candidates.push_back({ id, count });
    }

    // Sort by Mutual Count (Descending)
    sort(candidates.begin(), candidates.end(), [](const pair<int, int>& a, const pair<int, int>& b) {
        return a.second > b.second; // Higher count first
    });

    // Convert to JSON
    string json = "[";
    for (size_t i = 0; i < candidates.size(); ++i) {
        int id = candidates[i].first;
        int mutuals = candidates[i].second;
        string name = userDB[id].name;

        json += "{ \"id\": " + to_string(id) + 
                ", \"name\": \"" + name + "\"" +
                ", \"mutual_friends\": " + to_string(mutuals) + " }";
        
        if (i < candidates.size() - 1) json += ", ";
    }
    json += "]";
    return json;
}

// --- JSON Formatting ---
string NovaGraph::getUserJSON(int id) {
    if (userDB.find(id) == userDB.end()) return "{}";
    return "{ \"id\": " + to_string(id) + ", \"name\": \"" + userDB[id].name + "\" }";
}

string NovaGraph::getFriendListJSON(int id) {
    string json = "[";
    if (adjList.find(id) != adjList.end()) {
        const auto& friends = adjList[id];
        for (size_t i = 0; i < friends.size(); ++i) {
            User& f = userDB[friends[i]];
            json += "{ \"id\": " + to_string(f.id) + ", \"name\": \"" + f.name + "\" }";
            if (i < friends.size() - 1) json += ", ";
        }
    }
    json += "]";
    return json;
}