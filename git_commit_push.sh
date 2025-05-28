#!/bin/bash
# by castorga

if [ ! -d .git ]; then
    echo "Repo not found!"
    exit 1
fi

if [ -n "$(git status -s)" ]; then
    echo "Changes detected. Committing and pushing..."
    
    git status
    git add .
    git status

    echo "Message: "
    read message

    git commit -m "$message"
    git push

    echo "Changes committed and pushed successfully."
else
    echo "No changes to commit. Repository is up to date."
fi

