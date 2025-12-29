#pragma once
#include <string>
#include <vector>
#include <unordered_set>

using namespace std;

struct User
{
    int id;
    string username;
    string email;
    string password;
    string avatarUrl;
    vector<string> tags;
    int karma = 0;

    unordered_set<int> pendingRequests;
};