# 在庫管理アプリ — GitHub Pages 公開＆スマホアプリ化(PWA)手順

このフォルダの中身をそのまま GitHub に置くと、HTTPS の URL で公開でき、
スマホ／PC に「アプリ」として追加（PWA）できます。通知（ntfy）もそのまま動きます。

## このフォルダに入っているもの
- `index.html` … アプリ本体（`在庫管理_既存版.html` と同じ内容）
- `manifest.webmanifest` … アプリ情報（名前・アイコン・色）
- `sw.js` … Service Worker（高速化・オフライン起動）
- `icon-192.png` / `icon-512.png` / `apple-touch-icon.png` … アプリアイコン

> 重要：アプリ本体は必ず **`index.html`** という名前のまま置いてください（GitHub Pages の入口になります）。

---

## 手順A：ブラウザだけで公開（かんたん・おすすめ）

1. GitHub にログイン → 右上「＋」→ **New repository**
2. Repository name に好きな名前（例 `stock`）を入力 → **Public** を選択 → **Create repository**
3. 作成後の画面で **「uploading an existing file」** をクリック
4. このフォルダの **6ファイルすべて**（index.html / manifest.webmanifest / sw.js / 画像3つ）をドラッグ＆ドロップ → **Commit changes**
5. リポジトリの **Settings → Pages** を開く
6. 「Build and deployment」の Source を **Deploy from a branch**、Branch を **main / (root)** にして **Save**
7. 1〜2分待つと、Pages の画面に公開URL（`https://ユーザー名.github.io/stock/`）が表示されます

これで完成です。そのURLを各端末で開いてください。

---

## 手順B：git コマンドで公開（慣れている場合）

```bash
cd github-pages
git init
git add .
git commit -m "publish stock app"
git branch -M main
git remote add origin https://github.com/ユーザー名/stock.git
git push -u origin main
```
その後、GitHub の **Settings → Pages** で Branch を `main / (root)` に設定。

---

## スマホ／PC に「アプリ」として追加する
- **Android / PC(Chrome・Edge)**：公開URLを開くと、ヘッダーに「📲 アプリを追加」ボタンが出ます（またはアドレスバーのインストールアイコン）。
- **iPhone / iPad(Safari)**：公開URLを開き、共有メニュー（□↑）→ **「ホーム画面に追加」**。
  - ※ iPhone はこの「ホーム画面に追加」をしないとブラウザ通知が使えません。追加後にアプリを開き、「🔔 通知」→「この端末で通知を許可する」を行ってください。

## 通知（他端末への配信）
- 公開後も、これまで通り「🔔 通知」パネルの **配信チャンネル（ntfy）** が使えます。
- スタッフの端末に無料アプリ **ntfy** を入れ、パネルに表示される **配信チャンネル名**（または購読リンク）を購読すると、在庫切れ・補充依頼のプッシュ通知が届きます。

## アプリを更新したとき
`index.html` を差し替えて再アップロードし、`sw.js` の中の
`const CACHE = "oheart-stock-v1";` の **v1 を v2 などに上げる** と、
各端末で新しい内容に更新されます。
