#pragma once
#include <string>
#include <vector>

using namespace std;

struct DirectMessage {
    int id;              // Unique ID within the chat
    int senderId;
    string content;
    string timestamp;
    
    // METADATA FIELDS
    int replyToMsgId = -1;  // Context: ID of the message being replied to
    string reaction = "";   // Emoji reaction
    bool isSeen = false;    // Read receipt
};

struct DirectChat {
    string chatKey; // "minID_maxID"
    vector<DirectMessage> messages;
    int nextMsgId = 1; // Auto-incrementer for message IDs
};