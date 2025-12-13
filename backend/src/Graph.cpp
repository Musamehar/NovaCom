#include "../include/Graph.hpp"
#include <fstream>
#include <sstream>
#include <algorithm>
#include <ctime>

// --- Helper to get Time ---
string getCurrentTime() {
    time_t now = time(0);
    tm *ltm = localtime(&now);
    char buffer[10];
    sprintf(buffer, "%02d:%02d", ltm->tm_hour, ltm->tm_min);
    return string(buffer);
}

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

// Helper: Clean message content for file storage
string sanitize(string input) {
    replace(input.begin(), input.end(), '\n', ' '); // Remove newlines
    replace(input.begin(), input.end(), '|', ' ');  // Remove pipes
    return input;
}

// ==========================================
// PERSISTENCE (LOAD/SAVE) - SAFE MODE
// ==========================================

void NovaGraph::loadData() {
    string line;

    // 1. Load Users (SAFE MODE)
    // Supports both: "1,Alice" AND "1,Alice,50" (Backward Compatibility)
    ifstream userFile("data/users.txt");
    if (userFile.is_open()) {
        while (getline(userFile, line)) {
            if (line.empty()) continue;
            auto parts = split(line, ',');
            if (parts.size() >= 2) {
                int id = stoi(parts[0]);
                string name = parts[1];
                int karma = 0;
                
                // Only try to load Karma if it exists in the file
                if (parts.size() > 2) { 
                    try { karma = stoi(parts[2]); } catch(...) { karma = 0; }
                }

                userDB[id] = { id, name, {}, {}, karma };
            }
        }
        userFile.close();
    }

    // 2. Load Graph (With Auto-Cleanup)
    ifstream graphFile("data/graph.txt");
    if (graphFile.is_open()) {
        while (getline(graphFile, line)) {
            if (line.empty()) continue;
            auto parts = split(line, ',');
            int id = stoi(parts[0]);
            
            // Temp vector to clean connections
            vector<int> friends;
            for (size_t i = 1; i < parts.size(); i++) {
                int friendID = stoi(parts[i]);
                
                // RULE 1: No Self-Loops (Alice can't be friends with Alice)
                if (friendID == id) continue;

                friends.push_back(friendID);
            }

            // RULE 2: Remove Duplicates
            sort(friends.begin(), friends.end());
            friends.erase(unique(friends.begin(), friends.end()), friends.end());

            // Store the clean list
            adjList[id] = friends;
        }
        graphFile.close();
    }

    // 3. Load Communities
    ifstream commFile("data/communities.txt");
    if (commFile.is_open()) {
        while (getline(commFile, line)) {
            if (line.empty()) continue;
            auto parts = split(line, '|');
            if (parts.size() >= 4) {
                Community c;
                c.id = stoi(parts[0]);
                c.name = parts[1];
                c.description = parts[2];
                
                auto tagList = split(parts[3], ',');
                for(auto t : tagList) c.tags.push_back(t);

                if (parts.size() > 4 && parts[4] != "NULL") {
                    auto memList = split(parts[4], ',');
                    for(auto m : memList) c.members.insert(stoi(m));
                }

                // NEW: Load Moderators (Index 5)
                if (parts.size() > 5 && parts[5] != "NULL") {
                    auto modList = split(parts[5], ',');
                    for(auto m : modList) c.moderators.insert(stoi(m));
                }

                // NEW: Load Banned Users (Index 6)
                if (parts.size() > 6 && parts[6] != "NULL") {
                    auto banList = split(parts[6], ',');
                    for(auto b : banList) c.bannedUsers.insert(stoi(b));
                }

                communityDB[c.id] = c;
                if (c.id >= nextCommunityId) nextCommunityId = c.id + 1;
            }
        }
        commFile.close();
    }
	
	// 4. Load Chats (Format: CommID|SenderID|SenderName|Time|Votes|Pinned|Content)
    ifstream chatFile("data/chats.txt");
    if (chatFile.is_open()) {
        while (getline(chatFile, line)) {
            if (line.empty()) continue;
            auto parts = split(line, '|');
            
            // We expect at least 7 parts. 
            // Note: If content contained spaces, split is fine. 
            if (parts.size() >= 7) {
                int commId = stoi(parts[0]);
                
                // Only add if community exists
                if (communityDB.find(commId) != communityDB.end()) {
                    Message m;
                    m.senderId = stoi(parts[1]);
                    m.senderName = parts[2];
                    m.timestamp = parts[3];
                    try { m.upvotes = stoi(parts[4]); } catch (...) { m.upvotes = 0; }
                    m.isPinned = (parts[5] == "1");
                    m.content = parts[6];
                    
                    // If content had pipes that split accidentally, rejoin them (Safety)
                    for (size_t i = 7; i < parts.size(); i++) {
                        m.content += " " + parts[i];
                    }

                    communityDB[commId].chatHistory.push_back(m);
                }
            }
        }
        chatFile.close();
    }
}

void NovaGraph::saveData() {
    // 1. Save Users (NOW SAVES KARMA)
    // This upgrades your file format automatically next time you run this
    ofstream userFile("data/users.txt");
    for (auto const& [id, user] : userDB) {
        userFile << id << "," << user.name << "," << user.karma << "\n";
    }
    userFile.close();

    // 2. Save Graph
     ofstream graphFile("data/graph.txt");
    for (auto& [id, friends] : adjList) {
        // CLEAN BEFORE SAVING
        sort(friends.begin(), friends.end());
        friends.erase(unique(friends.begin(), friends.end()), friends.end());

        // Write to file
        graphFile << id;
        for (int friendID : friends) {
            graphFile << "," << friendID;
        }
        graphFile << "\n";
    }
    graphFile.close();

    // 3. Save Communities
    ofstream commFile("data/communities.txt");
    for (auto const& [id, c] : communityDB) {
        commFile << c.id << "|" << c.name << "|" << c.description << "|";
        
        // Tags
        for(size_t i=0; i<c.tags.size(); i++) commFile << c.tags[i] << (i < c.tags.size()-1 ? "," : "");
        commFile << "|";

        // Members
        if(c.members.empty()) commFile << "NULL";
        else {
            int i = 0;
            for(int m : c.members) { commFile << m << (i < c.members.size()-1 ? "," : ""); i++; }
        }
        commFile << "|";

        // NEW: Moderators
        if(c.moderators.empty()) commFile << "NULL";
        else {
            int i = 0;
            for(int m : c.moderators) { commFile << m << (i < c.moderators.size()-1 ? "," : ""); i++; }
        }
        commFile << "|";

        // NEW: Banned Users
        if(c.bannedUsers.empty()) commFile << "NULL";
        else {
            int i = 0;
            for(int m : c.bannedUsers) { commFile << m << (i < c.bannedUsers.size()-1 ? "," : ""); i++; }
        }
        commFile << "\n";
    }
    commFile.close();
	
	// 4. Save Chats
    ofstream chatFile("data/chats.txt");
    for (auto const& [commId, comm] : communityDB) {
        for (const auto& msg : comm.chatHistory) {
            chatFile << commId << "|"
                     << msg.senderId << "|"
                     << msg.senderName << "|"
                     << msg.timestamp << "|"
                     << msg.upvotes << "|"
                     << (msg.isPinned ? "1" : "0") << "|"
                     << sanitize(msg.content) << "\n";
        }
    }
    chatFile.close();
}


void NovaGraph::addMessage(int commId, int senderId, string content) {
    if (communityDB.find(commId) != communityDB.end()) {
        if (communityDB[commId].members.count(senderId)) {
            Message m;
            m.senderId = senderId;
            m.senderName = userDB[senderId].name;
            m.content = sanitize(content); // Clean it before adding
            m.timestamp = getCurrentTime();
            m.upvotes = 0;
            m.isPinned = false;
            
            communityDB[commId].chatHistory.push_back(m);
            
            // SAVE IMMEDIATELY
            saveData(); 
        }
    }
}


// ==========================================
// GRAPH & USER LOGIC
// ==========================================

void NovaGraph::addUser(int id, string name) {
    if (userDB.find(id) != userDB.end()) return;
    // Default karma is 0 for new users
    userDB[id] = { id, name, {}, {}, 0 }; 
}

void NovaGraph::addFriendship(int u, int v) {
    if (u == v) return;
    auto& uFriends = adjList[u];
    if (find(uFriends.begin(), uFriends.end(), v) != uFriends.end()) return;

    adjList[u].push_back(v);
    adjList[v].push_back(u);
}

// ==========================================
// COMMUNITY LOGIC
// ==========================================

// FIXED: Now accepts creatorId to set them as the first Moderator
void NovaGraph::createCommunity(string name, string desc, string tags, int creatorId) {
    Community c;
    c.id = nextCommunityId++;
    c.name = name;
    c.description = desc;
    c.tags = split(tags, ',');
    
    // Auto-join and Auto-Mod
    c.members.insert(creatorId);
    c.moderators.insert(creatorId);
    
    communityDB[c.id] = c;
}

// FIXED: Includes logic to block Banned Users
void NovaGraph::joinCommunity(int userId, int commId) {
    if (communityDB.find(commId) != communityDB.end()) {
        Community& c = communityDB[commId];

        // 1. REJECT if banned
        if (c.bannedUsers.count(userId)) return;
        
        // 2. Add to Members
        c.members.insert(userId);

        // 3. ABANDONED COMMUNITY CLAIM
        // If there are no moderators (e.g., everyone left), the new joiner inherits the community.
        if (c.moderators.empty()) {
            c.moderators.insert(userId);

            // Optional: Announce the new leader
            Message sysMsg;
            sysMsg.senderId = -1;
            sysMsg.senderName = "NOVA SYSTEM";
            sysMsg.content = "Community reclaimed. User " + to_string(userId) + " is now the Moderator.";
            sysMsg.timestamp = getCurrentTime();
            sysMsg.isPinned = true;
            c.chatHistory.push_back(sysMsg);
        }
    }
}


string NovaGraph::getAllCommunitiesJSON() {
    string json = "[";
    int count = 0;
    for (auto const& [id, c] : communityDB) {
        if (count > 0) json += ", ";
        json += "{ \"id\": " + to_string(c.id) + 
                ", \"name\": \"" + c.name + "\"" +
                ", \"desc\": \"" + c.description + "\"" +
                ", \"members\": " + to_string(c.members.size()) + 
                ", \"tags\": [";
        for(size_t i=0; i<c.tags.size(); i++) 
            json += "\"" + c.tags[i] + "\"" + (i < c.tags.size()-1 ? "," : "");
        json += "] }";
        count++;
    }
    json += "]";
    return json;
}

void NovaGraph::leaveCommunity(int userId, int commId) {
    if (communityDB.find(commId) != communityDB.end()) {
        Community& c = communityDB[commId];

        // 1. Remove from Members
        c.members.erase(userId);
        
        // 2. Handle Moderator Logic
        if (c.moderators.count(userId)) {
            c.moderators.erase(userId); // Remove the leaver from mods

            // 3. SUCCESSION: If there are NO moderators left, promote the next member
            if (c.moderators.empty() && !c.members.empty()) {
                // *c.members.begin() grabs the first person in the set (Lowest ID / Oldest Member)
                int newModId = *c.members.begin();
                c.moderators.insert(newModId);
                
                // Optional: Add a system message to chat announcing the new leader
                Message sysMsg;
                sysMsg.senderId = -1; // System ID
                sysMsg.senderName = "NOVA SYSTEM";
                sysMsg.content = "Moderator left. User " + to_string(newModId) + " has been promoted.";
                sysMsg.timestamp = getCurrentTime();
                sysMsg.isPinned = true;
                c.chatHistory.push_back(sysMsg);
            }
        }
    }
}

string NovaGraph::getCommunityDetailsJSON(int commId, int userId) {
    if (communityDB.find(commId) == communityDB.end()) return "{}";
    
    Community& c = communityDB[commId];
    bool isMember = c.members.count(userId);
    bool isMod = c.moderators.count(userId); // Check if viewing user is mod

    string json = "{ \"id\": " + to_string(c.id) + 
                  ", \"name\": \"" + c.name + "\"" +
                  ", \"desc\": \"" + c.description + "\"" +
                  ", \"is_member\": " + (isMember ? "true" : "false") + 
                  ", \"is_mod\": " + (isMod ? "true" : "false") + 
                  ", \"messages\": [";
    
    for(size_t i=0; i<c.chatHistory.size(); i++) {
        Message& m = c.chatHistory[i];
        json += "{ \"index\": " + to_string(i) + 
                ", \"sender\": \"" + m.senderName + "\"" +
                ", \"senderId\": " + to_string(m.senderId) +
                ", \"content\": \"" + m.content + "\"" +
                ", \"time\": \"" + m.timestamp + "\"" +
                ", \"votes\": " + to_string(m.upvotes) + 
                ", \"pinned\": " + (m.isPinned ? "true" : "false") + " }";
        if(i < c.chatHistory.size() - 1) json += ", ";
    }
    json += "] }";
    return json;
}

// ==========================================
// MODERATION ACTIONS
// ==========================================

void NovaGraph::banUser(int commId, int adminId, int targetId) {
    if (communityDB.find(commId) == communityDB.end()) return;
    Community& c = communityDB[commId];

    // Verify Admin rights
    if (c.moderators.count(adminId)) {
        c.members.erase(targetId);      // Kick
        c.bannedUsers.insert(targetId); // Ban
    }
}

void NovaGraph::deleteMessage(int commId, int adminId, int msgIndex) {
    if (communityDB.find(commId) == communityDB.end()) return;
    Community& c = communityDB[commId];

    if (c.moderators.count(adminId)) {
        if (msgIndex >= 0 && msgIndex < c.chatHistory.size()) {
            c.chatHistory.erase(c.chatHistory.begin() + msgIndex);
        }
    }
}

void NovaGraph::pinMessage(int commId, int adminId, int msgIndex) {
    if (communityDB.find(commId) == communityDB.end()) return;
    Community& c = communityDB[commId];

    if (c.moderators.count(adminId)) {
        if (msgIndex >= 0 && msgIndex < c.chatHistory.size()) {
            c.chatHistory[msgIndex].isPinned = !c.chatHistory[msgIndex].isPinned;
        }
    }
}

// ==========================================
// ALGORITHMS (BFS, RECOMMENDATION, DEGREES)
// ==========================================

// BFS to find if User is 1st, 2nd, or 3rd degree
int NovaGraph::getRelationDegree(int startNode, int targetNode) {
    if (startNode == targetNode) return 0;
    if (adjList.find(startNode) == adjList.end()) return -1;

    queue<pair<int, int>> q;
    q.push({ startNode, 0 });
    set<int> visited;
    visited.insert(startNode);

    while (!q.empty()) {
        auto [currentUser, depth] = q.front();
        q.pop();

        if (currentUser == targetNode) return depth;
        // Optimization: Don't search beyond 3rd degree
        if (depth >= 3) continue;

        for (int neighbor : adjList[currentUser]) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                q.push({ neighbor, depth + 1 });
            }
        }
    }
    return -1; // Not connected closely
}

string NovaGraph::getConnectionsByDegreeJSON(int startNode, int targetDegree) {
    if (userDB.find(startNode) == userDB.end()) return "[]";

    queue<pair<int, int>> q;
    q.push({ startNode, 0 });

    set<int> visited;
    visited.insert(startNode);

    vector<int> resultIDs;

    while (!q.empty()) {
        auto [currentUser, depth] = q.front();
        q.pop();

        if (depth == targetDegree) {
            resultIDs.push_back(currentUser);
            continue;
        }

        if (depth > targetDegree) continue;

        for (int neighbor : adjList[currentUser]) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                q.push({ neighbor, depth + 1 });
            }
        }
    }

    string json = "[";
    for (size_t i = 0; i < resultIDs.size(); ++i) {
        User& u = userDB[resultIDs[i]];
        json += "{ \"id\": " + to_string(u.id) + ", \"name\": \"" + u.name + "\", \"degree\": " + to_string(targetDegree) + " }";
        if (i < resultIDs.size() - 1) json += ", ";
    }
    json += "]";
    return json;
}

string NovaGraph::getRecommendationsJSON(int userId) {
    if (adjList.find(userId) == adjList.end()) return "[]";

    map<int, int> frequencyMap;
    const vector<int>& myFriends = adjList[userId];
    set<int> existingFriends(myFriends.begin(), myFriends.end());
    existingFriends.insert(userId);

    for (int friendId : myFriends) {
        for (int candidate : adjList[friendId]) {
            if (existingFriends.find(candidate) == existingFriends.end()) {
                frequencyMap[candidate]++;
            }
        }
    }

    vector<pair<int, int>> candidates;
    for (auto const& [id, count] : frequencyMap) {
        candidates.push_back({ id, count });
    }

    sort(candidates.begin(), candidates.end(), [](const pair<int, int>& a, const pair<int, int>& b) {
        return a.second > b.second;
    });

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

// ==========================================
// VOTING LOGIC 
// ==========================================
void NovaGraph::upvoteMessage(int commId, int msgIndex) {
    if (communityDB.find(commId) != communityDB.end()) {
        Community& c = communityDB[commId];
        // Check bounds
        if (msgIndex >= 0 && msgIndex < c.chatHistory.size()) {
            // Increment vote
            c.chatHistory[msgIndex].upvotes++;
            
            // Award Karma to Sender
            int senderId = c.chatHistory[msgIndex].senderId;
            if (userDB.find(senderId) != userDB.end()) {
                userDB[senderId].karma += 5; 
            }
        }
    }
}

string NovaGraph::getGraphVisualJSON() {
    string json = "{ \"nodes\": [";
    
    // 1. Export Nodes (Users)
    int count = 0;
    for (auto const& [id, user] : userDB) {
        if (count > 0) json += ", ";
        // We add 'val' to determine node size based on friend count
        int friendCount = adjList[id].size();
        json += "{ \"id\": " + to_string(id) + 
                ", \"name\": \"" + user.name + "\"" +
                ", \"val\": " + to_string(friendCount + 1) + " }"; // +1 so 0 friends still shows
        count++;
    }
    json += "], \"links\": [";

    // 2. Export Links (Friendships)
    count = 0;
    set<string> processedEdges; // To avoid A-B and B-A duplicates in visual
    
    for (auto const& [u, friends] : adjList) {
        for (int v : friends) {
            // Create unique key for edge (min-max) to avoid duplicates
            int minId = min(u, v);
            int maxId = max(u, v);
            string edgeKey = to_string(minId) + "-" + to_string(maxId);

            if (processedEdges.find(edgeKey) == processedEdges.end()) {
                if (count > 0) json += ", ";
                json += "{ \"source\": " + to_string(u) + ", \"target\": " + to_string(v) + " }";
                processedEdges.insert(edgeKey);
                count++;
            }
        }
    }
    json += "] }";
    return json;
}

// ==========================================
// BASIC VIEWS
// ==========================================

string NovaGraph::getUserJSON(int id) {
    if (userDB.find(id) == userDB.end()) return "{}";
    // Now including Karma in the basic user view as well
    User& u = userDB[id];
    return "{ \"id\": " + to_string(id) + 
           ", \"name\": \"" + u.name + "\"" + 
           ", \"karma\": " + to_string(u.karma) + " }";
}

string NovaGraph::getFriendListJSON(int id) {
    string json = "[";
    if (adjList.find(id) != adjList.end()) {
        // Create a copy of the friends list
        vector<int> friends = adjList[id];

        // FORCE CLEAN: Sort and Remove Duplicates
        sort(friends.begin(), friends.end());
        friends.erase(unique(friends.begin(), friends.end()), friends.end());

        // Now iterate through the Clean List
        for (size_t i = 0; i < friends.size(); ++i) {
            User& f = userDB[friends[i]];
            json += "{ \"id\": " + to_string(f.id) + ", \"name\": \"" + f.name + "\" }";
            if (i < friends.size() - 1) json += ", ";
        }
    }
    json += "]";
    return json;
}