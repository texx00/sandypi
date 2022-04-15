#!/bin/bash

FILE="./server/saves/autoupdate.txt" 

if test -f "$FILE"; then 
    echo "$FILE exists."; 
    exit 0 
else 
    echo "$FILE doesn't exist." 
    exit 1 
fi 