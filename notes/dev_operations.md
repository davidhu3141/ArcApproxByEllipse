



Release operations (manual)
---------------------------

### goto release branch

- `git merge main`
- App.jsx: change version display
- `git commit -m "publish: v0.0.x.xxxx.x"`
- `npm run build`
- `git push`

### goto gh-pages branch

- del top files but gitignore, dist, node_modules
    - `rm index.html; rm vite.svg; rm -f assets`
- move dist to top
    - ???
- commit and push
    - `git commit -m "Update site"`

### leave gh-pages branch

- `git checkout main` or feature