#pragma once
#include <string>
#include <vector>
#include <set>
#include <map>

using namespace std;

struct Message {
    int id;
    int senderId;
    string senderName;
    string content;
    string timestamp;
    set<int> upvoters;
    bool isPinned = false;
    
    // NEW FIELDS (Fixed compilation errors)
    int replyToId = -1; 
    string type = "text"; // "text", "image", "poll"
    
    // POLL DATA
    vector<string> pollOptions;
    map<int, set<int>> pollVotes; // OptionIndex -> Set of UserIDs
};

struct Community {
    int id;
    string name;
    string description;
    string coverUrl;
    vector<string> tags;
    set<int> members;
    vector<Message> chatHistory;
    
    set<int> moderators;
    set<int> admins;
    set<int> bannedUsers;
};