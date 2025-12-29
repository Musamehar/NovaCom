#pragma once
#include "User.hpp"
#include "Community.hpp"
#include "DirectChat.hpp"
#include <map>
#include <vector>
#include <string>
#include <iostream>
#include <queue>
#include <set>
#include <algorithm>
#include <stack>

using namespace std;

class NovaGraph
{
private:
    map<int, User> userDB;
    map<string, int> usernameIndex;
    map<int, vector<int>> adjList;
    map<int, Community> communityDB;
    map<string, DirectChat> dmDB;

    int nextCommunityId = 100;

public:
    vector<string> split(const string &s, char delimiter);
    void loadData();
    void saveData();
    int registerUser(string username, string email, string password, string avatar, string tags);
    int loginUser(string username, string password);
    void updateUserProfile(int id, string email, string avatar, string tags);
    void deleteUser(int id);

    string sendConnectionRequest(int senderId, int targetId);
    void acceptConnectionRequest(int userId, int requesterId);
    void declineConnectionRequest(int userId, int requesterId);
    string getPendingRequestsJSON(int userId);
    string getRelationshipStatus(int me, int target);

    void addUser(int id, string username);
    void addFriendship(int u, int v);
    void createCommunity(string name, string desc, string tags, int creatorId, string coverUrl);
    void joinCommunity(int userId, int commId);
    void leaveCommunity(int userId, int commId);

    void addMessage(int commId, int senderId, string content, string type = "text", string mediaUrl = "", int replyToId = -1);
    void votePoll(int commId, int userId, int msgIndex, int optionIndex);

    void banUser(int commId, int actorId, int targetId);
    void unbanUser(int commId, int actorId, int targetId);
    void deleteMessage(int commId, int actorId, int msgIndex);
    void pinMessage(int commId, int actorId, int msgIndex);
    void upvoteMessage(int commId, int userId, int msgIndex);
    void promoteToAdmin(int commId, int actorId, int targetId);
    void demoteAdmin(int commId, int actorId, int targetId);
    void transferOwnership(int commId, int actorId, int targetId);
    void removeFriendship(int u, int v);

    void createPoll(int commId, int senderId, string question, bool allowMultiple, vector<string> options);
    void togglePollVote(int commId, int userId, int msgId, int optionId);

    void sendDirectMessage(int senderId, int receiverId, string content, int replyToId = -1, string type = "text", string mediaUrl = "");
    void reactToDirectMessage(int senderId, int receiverId, int msgId, string reaction);
    void deleteDirectMessage(int userId, int friendId, int msgId);
    string getDirectChatJSON(int viewerId, int friendId, int offset = 0, int limit = 50);
    string getActiveDMsJSON(int userId);

    string getUserJSON(int id);
    string getFriendListJSON(int id);
    string getAllCommunitiesJSON();
    string getCommunityDetailsJSON(int commId, int userId, int offset = 0, int limit = 50);
    string searchUsersJSON(string query, string tagFilter);
    string getPopularCommunitiesJSON();
    string getGraphVisualJSON();
    string getRecommendationsJSON(int userId);
    string getCommunityMembersJSON(int commId);

    int getRelationDegree(int startNode, int targetNode);
    string getConnectionsByDegreeJSON(int startNode, int targetDegree);

    string getJoinedCommunitiesJSON(int userId);

    string getSmartUserRecommendations(int userId);
    string getSmartCommunityRecommendations(int userId);
    map<int, int> getDistancesBFS(int startId);

    void navPush(int userId, string tab);
    string navBack(int userId);
    string navForward(int userId);
    string getNavStateJSON(int userId);
};