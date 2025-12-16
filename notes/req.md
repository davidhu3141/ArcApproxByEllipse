
(This is for openai codex, but not a formal format.)

ultimate goal 1
---------------

建立一個網頁，讓使用者輸入圓弧的半徑與角度 theta（或半徑與弦長），以及容許誤差，找出能夠近似該圓弧的橢圓

圓弧是圓心在原點的圓，角度是 90-theta/2 ~ 90+theta/2 (deg)



req1
----

建立一個 react/vite + D3.js 專案，並建立畫面。畫面內容
- D3 圖，用來顯示平面座標系的 viewport。 viewport 範圍是:
    - 假設圓弧長寬 w,h，則 viewport 至少要上方外推 h/2, 下方外推 h，左右外推 w/3 
- D3 圖，用來顯示圓弧各個角度的誤差值
- D3 圖，用來顯示嘗試過的橢圓半長短軸值
- 半徑輸入
- 角度輸入(影響弦長)
- 弦長輸入(影響角度)
- 容許誤差值輸入

D3 可以先留空位，後續計算方式與細節會再說明。先有 ui 框架即可。要盡量 RWD



req2
----

給定
- 半徑 r
- 角度 theta (已換算成 rad)
- 誤差 e

可知圓弧兩端點為 
- `(r*cos(pi/2-theta/2), r*sin(pi/2-theta/2))`
- `(r*cos(pi/2+theta/2), r*sin(pi/2+theta/2))`

考慮橢圓過以下三點
- P: `(0, r-e)`
- Q: `((r+d)*cos(pi/2-theta/4), (r+d)*sin(pi/2-theta/4))`
- R: `((r+e)*cos(pi/2-theta/2), (r+e)*sin(pi/2-theta/2))`
其中 d 為可調整的參數，`-e<d<e`

嘗試 100 個不同的 d 值，針對個別 d 值做以下計算
- 參考 calculations.js 
    - 使用 solveABC 算出二次曲線
    - 再使用 toCanonical 算出橢圓半長短軸 a b 與上下平移 h
    - 如果 yDenomSign 為負，代表是雙曲線，不予處理
- 基於橢圓參數式 `(a*cos(t), b*sin(t)+h)`
    - t 的範圍最小值應該是 `t0=arccos((r+e)*cos(pi/2-theta/2)/a)`
    - t 的範圍最大值應該是 `t1=pi-t0`
    - 計算"橢圓弧"與"圓弧"的誤差，方式如下
        - 在 `t0~pi/2` 之間取 10 個 `t` 值，得到橢圓上的點，其與原點 (0,0) 的距離為 r_tilde
        - 誤差 err 即為 `max_{t0 < t < pi/2} abs(r_tilde-r)`
- 將點 (a,b) 標在 "嘗試過的橢圓半長短軸" 圖表上。err 大於 e 的顯示為灰色，其餘依照 err 大小顯示色階。當滑鼠滑過時顯示 (a,b,e)
- 這些嘗試過且 err 小於 e 的橢圓中，將 (a+b) 最小的一個畫在 "平面座標與圓弧 viewport" 中，且其 t vs err 的折線圖畫在 "各角度誤差圖" 中



req3
----

現在考慮比 req2 更多的橢圓可能性

考慮橢圓過以下三點
- P: `(0, r+d1)`
- Q: `((r+d)*cos(pi/2-theta/4), (r+d)*sin(pi/2-theta/4))`
- R: `((r+d2)*cos(pi/2-theta/2), (r+d2)*sin(pi/2-theta/2))`
其中 d,d1,d2 為可調整的參數，`-e<d<e`, `-e<d1<e`, `-e<d2<e`

嘗試 10 個不同的 d, d1, d2 值，共 1000 種可能的組合。針對個別 (d,d1,d2) 值做一樣的計算。接下來的需求都跟 req2 一樣。



req4
----

"Tried ellipse semi-axes" 中， a 值超出 a 的四倍標準差，或 b 值超出 b 的四倍標準差 的點不畫在圖上，以免圖表涵蓋的range太大



req5
----

加入一個進階設定的 section，用來設定 ds d1s d2s ts 這四項的 number of steps.
ds d1s d2s 的 number of steps 範圍是 2~50, ts 的 number of steps 範圍是 4~50

還要一個 checkbox 用來決定是不是 "如果發現 a+b 已經比現有的 pass 的最小 a+b 還大就要跳過"


req6
----

advanced setting 要可以收合。
advanced setting 新增一個 checkbox 用來固定 endpoints。勾選時 d2 只能是 0.


req7
----

仿照 "Force d2 = 0"，做類似的 "Force d1 = 0" 功能