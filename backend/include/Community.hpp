#pragma once
#include <string>
#include <vector>
#include <set>
#include <map>

using namespace std;

struct PollOption
{
    int id;
    string text;
    set<int> voterIds;
};

struct PollData
{
    string question;
    bool allowMultiple;
    vector<PollOption> options;
};

struct Message
{
    int id = 0;
    int senderId;
    string senderName;
    string content;
    string timestamp;
    set<int> upvoters;
    bool isPinned = false;

    int replyToId = -1;
    string type = "text";
    string mediaUrl = "";

    PollData poll;
};

struct Community
{
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

    int nextMsgId = 1;
};