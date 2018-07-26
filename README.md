browser-bot
===========

Here's how to automate your web-based interactions in a way that is robust and maintainable:

 1. Use a headless Chrome browser (Pupeteer) instead of scraping/curling endpoints.
 2. Interact with the page like you're a human looking at it, rather than by solely relying on CSS selectors which are fragile.
 3. Guide your bot's navigations using a state machine. Instead of brittle procedural operations, that often check for errors and are not robust against simple differences from what it expects. State machines can model the closed loop interaction that humans look like.

## Background
I wrote this because my diabetes was not in good shape - I needed to get my family members to help me out and for the reuslts to be present. So I wrote a script that would login to where my stats are uploaded, take a screenshot, and then send this to my parents on Facebook Messenger. 

Written by [Liam Zededee](https://liamz.co/blog/).