# Kkle

## 概要

Kkle.js は、JavaScript でプラグイン開発を支援するライブラリです。

WordPress のフック機能をアレンジし、より柔軟かつ拡張性の高いプラグイン開発を可能にすることを開発者は目指しています。

## 特徴

* **アクションの登録:** 特定のタイミングで実行されるコールバック関数を登録できます。
* **フィルターの適用:** データを処理する段階で、フィルターを適用して値を変更できます。
* **非同期処理:** Promise を利用して非同期処理を管理できます。
* **イテラブルの定義:** カスタムのイテラブルを定義し、効率的なデータ処理を実現できます。
* **カスタムノードの定義:** 再利用可能な HTML 要素を定義できます。

## WordPress のフックとの類似点

WordPress の開発経験がある方にとって、馴染みやすいメソッドを定義します。

### 例えば次のようなメソッド

* `Kkle.addAction` は WordPress の `add_action` に相当し、アクションの登録を行います。
* `Kkle.doAction` は WordPress の `do_action` に相当し、アクションの実行を行います。

## 非同期処理

Kkle.js は、WordPress のフック機能をベースに、`Promise` を利用した非同期処理をサポートしています。
