
memo
----

- [x] t 並不是真正意義上的角度。是也可以換算成角度 -> fixed
- [ ] 應該要有分支策略

todo: scaleX and bottomaxis fix


publish:
- goto release branch
    - change ver
    - npm run build
    - push
- goto gh-pages branch
    - del top files
    - move dist to top
    - push

- [x] todo: 在 vite.config.js 加上 base: '/ArcApproxByEllipse/'
- [ ] create github release