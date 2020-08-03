## Install

Run `npm i`

## Dev Server

Run `npm run dev-server`

## Mobile

Run `npm start`

## General

The file structure try to replicate cases when you have share logic between mobile and desktop version of an app (non responsive site) the approach follows base classes as directives that are extended from mobile or desktop feature and a core library to share state, services, interfaces through the features

not to get lost in the overflow of files in this example component logic is in products library product.container.ts
html is in products-mobile.component.html and state in core store products the products-mobile module is imported in ecommerce-mobile products-portal.module.ts
