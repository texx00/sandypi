$FILE = "./server/saves/autoupdate.txt"

if test -f "$FILE"; then
    echo "$FILE exists.";
    echo "0"
else
    echo "$FILE doesn't exist."
    echo "1"
fi