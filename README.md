# SoshalThing Vue

[![CI@main](https://github.com/misabiko/SoshalThing/actions/workflows/ci.yml/badge.svg?branch=main "CI@main")](https://github.com/misabiko/SoshalThing/actions/workflows/ci.yml)
[![CI@develop](https://github.com/misabiko/SoshalThing/actions/workflows/ci.yml/badge.svg?branch=develop "CI@develop")](https://github.com/misabiko/SoshalThing/actions/workflows/ci.yml)

At the time of writing, the active version of SoshalThing is on Rust using Yew: https://github.com/misabiko/SoshalThingYew

---

Load feeds from various services in a Tweetdeck-style timeline app.

Most tasks are hosted on the [SoshalThingVue3 project](https://github.com/misabiko/SoshalThing/projects/4).

SoshalThing is being rewritten from scratch with Vue.js 3, so the [vue2 branch](https://github.com/misabiko/SoshalThing/tree/vue2) still has a few more features.

Build with
`npm run serve`
or
`npm run build && npm run server`

# FavViewer

A userscript version of SoshalThing to inject timelines into webpages and profit of its features.

Run the `gulp` command to build FavViewer, and then load `dist/favviewer.user.js` on a userscript manager (only tested on [Violentmonkey](https://violentmonkey.github.io/) with Google Chrome)
