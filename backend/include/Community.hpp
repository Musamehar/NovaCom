#pragma once
#include <string>
#include <vector>
#include <set>

using namespace std;

struct Message {
    int senderId;
    string senderName;
    string content;
    string timestamp;
    int upvotes = 0; // NEW: Defaults to 0
};

struct Community {
    int id;
    string name;
    string description;
    vector<string> tags;
    set<int> members;
    vector<Message> chatHistory;
};