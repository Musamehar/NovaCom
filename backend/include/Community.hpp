#pragma once
#include <string>
#include <vector>
#include <set>

using namespace std;

struct Message {
    int id; // Unique ID
    int senderId;
    string senderName;
    string content;
    string timestamp;
    int upvotes = 0;
    bool isPinned = false; // NEW: Pinned status
};

struct Community {
    int id;
    string name;
    string description;
    vector<string> tags;
    set<int> members;
    vector<Message> chatHistory;
    
    // NEW FIELDS
    set<int> moderators;  // Set of User IDs who are mods
    set<int> bannedUsers; // Set of User IDs who are banned
};