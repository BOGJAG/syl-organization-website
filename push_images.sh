#!/bin/bash
batch_size=5
count=0
for f in images/*.png; do
  git add "$f"
  count=$((count+1))
  if [ $count -ge $batch_size ]; then
    git commit -m "Add batch"
    git push
    count=0
  fi
done
git commit -m "Add remaining"
git push
