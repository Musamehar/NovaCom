#pragma once
#include <string>
#include <vector>

using namespace std;

struct DirectMessage
{
    int id;
    int senderId;
    string content;
    string timestamp;

    int replyToMsgId = -1;
    string reaction = "";
    bool isSeen = false;

    string type = "text";
    string mediaUrl = "";
};

struct DirectChat
{
    string chatKey;
    vector<DirectMessage> messages;
    int nextMsgId = 1;
};