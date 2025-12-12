#pragma once
#include <string>
#include <vector>
#include <unordered_set>

using namespace std;

struct User {
    int id;
    string name;
    vector<string> interests;
    unordered_set<int> joinedCommunities;
    int karma = 0; // NEW: Defaults to 0
};