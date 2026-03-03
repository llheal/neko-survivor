---
description: LINE Mini App の新規GitHub作成 → Vercel自動デプロイ
---
# LINE Mini App デプロイワークフロー

## 前提条件 (初回のみ)
// turbo-all

### 1. GitHub CLI ログイン
```bash
gh auth login --web --git-protocol https
```
ブラウザが開くので、GitHubにログインしてデバイスコードを入力。

### 2. Vercel CLI ログイン
```bash
vercel login
```
ブラウザが開くので、Vercelアカウントでログイン。

## デプロイ手順 (毎回)

### 3. GitHubリポジトリ作成 & プッシュ
```bash
cd <プロジェクトディレクトリ>
gh repo create <リポ名> --public --source=. --push
```

### 4. Vercelにデプロイ
```bash
vercel --prod --yes
```

### 5. LINE DevelopersのエンドポイントURL更新
Vercelが出力したURLを LINE Developers Console のエンドポイントに設定。

## 更新時 (コード変更後)
```bash
git add -A && git commit -m "update" && git push
```
Vercelが自動でリデプロイされます。
