# About

This is the instruction for developers only.
The facilitators who mark this project don't need to do anything under the frontend folder.

## Instructions for Developer(Only),

```bash
## under frontend directory
npm install
```

## Configuration

Below is the configuration already done!!!

You don't need to do the following steps!!!

Just write JavaScript, HTML, Css code!!!

Don't use npm to install external JavaScript libraries!!! using \<script\> tag instead.

But the following components will check your code correctness, styles at the commit stage.

```bash
npm init -y

npm init @eslint/config@latest

npm install --save-dev prettier eslint-plugin-prettier

npx eslint yourfile.js

npm install --save-dev husky

npx husky init
```

[eslint](https://eslint.org/docs/latest/use/getting-started)

[husky](https://typicode.github.io/husky/get-started.html)
