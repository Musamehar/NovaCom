#pragma once
#include "User.hpp"
#include "Community.hpp"
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
    // DATA STRUCTURES
    unordered_map<int, User> userDB;
    unordered_map<string, int> usernameIndex; // NEW: Map Username -> ID
    unordered_map<int, vector<int>> adjList;
    
    // Community Storage
    unordered_map<int, Community> communityDB;
    int nextCommunityId = 100;

    // Helpers
    vector<string> split(const string& s, char delimiter);

public:
    // PERSISTENCE
    void loadData();
    void saveData();

    // AUTHENTICATION (NEW)
    int registerUser(string username, string email, string password, string avatar, string tags);
    int loginUser(string username, string password);
    void updateUserProfile(int id, string email, string avatar, string tags);

    // USER & GRAPH OPS
    void addUser(int id, string username); // Updated to match new struct
    void addFriendship(int u, int v);
    
    // COMMUNITY OPS
    // Updated signature to include coverUrl
    void createCommunity(string name, string desc, string tags, int creatorId, string coverUrl);
    void joinCommunity(int userId, int commId);
    void leaveCommunity(int userId, int commId);
    void addMessage(int commId, int senderId, string content);

    // MODERATION
    void banUser(int commId, int adminId, int targetId);
    void unbanUser(int commId, int adminId, int targetId);
    void deleteMessage(int commId, int adminId, int msgIndex);
    void pinMessage(int commId, int adminId, int msgIndex);
    void upvoteMessage(int commId, int userId, int msgIndex);

    // READ VIEWS (JSON)
    string getUserJSON(int id);
    string getFriendListJSON(int id);
    string getConnectionsByDegreeJSON(int startNode, int targetDegree);
    string getRecommendationsJSON(int userId);
    string getGraphVisualJSON();
    
    string getAllCommunitiesJSON();
    string getCommunityDetailsJSON(int commId, int userId, int offset = 0, int limit = 50);
    string searchUsersJSON(string query, string tagFilter);
    string getPopularCommunitiesJSON();
    
    // ALGORITHMS
    int getRelationDegree(int startNode, int targetNode);
};