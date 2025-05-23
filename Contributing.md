# How to contribute

```bash
# download code repository
1. git clone https://github.com/ArcueidShiki/DataAnalyticsApplication.git

# select a branch for development
2. git checkout dev
   or # solving current issue branch
   git checkout -b [issue_branch_name] [issue_branch_name]

3. Coding / solve issue / bugfix / writing test
   - if database changed: under backend directory
   - flask db migrate -m "what have been changed"
   - flask db upgrade
   - if new data inserted, backup your data under backend/app directory
   - sqlite3 app.db .dump > app.dump.sql

# publish your changes
4. git add .
   or
   git add [path-to-your-files]

5. git commit -m "commit message"

# keep updated with remote main branch to avoid conflict
6. git pull origin main
   # or
   git merge origin main
   # if conflict with some files after running this command do following:
   1. git status # to see which files are conflict
   2. click [resolve] a blue button in vscode editor, compare and merges.
   3. git status # check all the conflicts are solved, if not, back to step2 until all the conflicts are solved.

7. git push origin [remote_branch_name]

8. New a pull request on GitHub, compare [main] to [branch_name]

9. Add reviewers, assignee, labels and development related to the issue need to be solved under this pull request.

10. If meet the requirements, merge pull request.
```
