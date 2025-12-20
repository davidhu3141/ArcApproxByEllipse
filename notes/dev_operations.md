

Branch Policy
-------------

will become:

- develop = feature
- main = release
- gh-pages

commit types:

- feat (develop)
- doc (develop)
- publish (main)
- "Update site" (gh-pages)


Release operations (manual)
---------------------------

> Scripted helper: `scripts/publish_release.sh <version-label> [target-branch]`

### goto release branch

- [ ] `git merge main`
- [ ] App.jsx: change version display
- `git commit -m "publish: v0.0.x.xxxx.x"`
- `npm run build`
- `git push`

### goto gh-pages branch

- del top files but gitignore, dist/, node_modules/
    - `rm -f index.html vite.svg`
    - `rm -rf assets`
- move dist to top
    - `cp -r dist/. .`
    - `rm -rf dist`
- commit and push
    - `git commit -m "Update site"`

### leave gh-pages branch

- `git checkout main` or feature
