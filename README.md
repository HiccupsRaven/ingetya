# INGETYA

> https://IngetYa.net

## Instal *

Sementara pake NPM aja (bisa via terminal)
```shell
npm install
```

> [!IMPORTANT]
> Plis instal nodemon, boleh secara global ataupun devdeps

```shell
# Global
npm i -g nodemon

# Local DevDeps
npm i -D nodemon
```

## Inisialisasi *

Jalanin sekali setiap setelah **update dari repo atau/dan instalasi deps**. Berfungsi buat ngecek file typescript dan generate beberapa config di `./config`.

```shell
npm run init
```

Setelah config tergenerate, edit dulu bagian `./config/db.json`.

```javascript
{
  // false - kalo kamu ga instal mongodb
  // true - ya kalo dah instal lah kocak
  "MONGODB_INSTALLED": false
}
```

Lanjut ke `./config/webhook.js`

```javascript
{
  // string/null - id grup yang dipake buat notifikasi orderan, log, dan akitivitas website
  "chat_id": null

  // MarkdownV2/Markdown/HTML - format teks yg mo dikirim ke group chat
  "parse_mode": "MarkdownV2",

  // boolean - batesin forward, mention, dan copy url chat
  "protect_content": true,

  // boolean - biar gaada push notification
  "disable_notification": true
}
```

## Run mode dev

Buka terminal dengan 2 tabs atau buka langsung 2 terminal kalo ga punya fitur multi-tab

### 1. Watch build
ext: `.ts` `.json` `.scss` `.ejs` `.html` ngejagain folder `./frontend`
```shell
npm run dev:build
```
### 2. Watch server changes

ext: `.ts` ngejagain folder `./backend`

> [!TIP]
> Posisi udah instal nodemon

```shell
npm run dev:start
```

## Run mode gila

Yakin ga yakin gas aja

### Build dulu

Udah otomatis generate hash di filename hasil bundle biar ga pake cache lama

```shell
npm run build
```

### Server

Batesin max penggunaan cpu dan ram sendiri

#### Via PM2 x NPM (VPS)

Biar dibantu npm asal vm-mu mantap

```shell
pm2 start npm --name "ingetya-app" --max-memory-restart 8G -- start
```

#### Via PM2 mode hemat (Shared VPS)

Cek penggunaan resource manual

```shell
pm2 start ./dist/server.js --name "ingetya-app" --max-memory-restart 4G -- start
```

#### Via NPM (lokal)
```shell
npm run start
```

## TO-DO

- [ ] banyak anjenk