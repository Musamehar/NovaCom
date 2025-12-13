#pragma once
#include <string>
#include <vector>
#include <unordered_set>

using namespace std;

struct User {
    int id;
    string username; // Changed from 'name' to 'username' for clarity
    string email;
    string password;
    string avatarUrl; // URL to image
    vector<string> tags; // Gaming, Anime, etc.
    
    // Existing fields
    unordered_set<int> joinedCommunities;
    int karma = 0;
};