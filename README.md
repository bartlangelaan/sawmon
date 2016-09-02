# SAWMON
Servers and websites monitoring

## What is this?
This is a work-in-progress tool that can monitor servers and websites. It's very pluggable, fast and useful.

## When is it done?

Never. But this is on the roadmap:

- [ ] Set up structure with plugins, mongodb etc.
    - [X] Add ping event
    - [X] Add refresh event
    - [X] Add schema (for the DB)
    - [ ] Add display schema (for the UI)
    - [ ] Make sure plugins can be added from outside this module
- [X] Find websites based on an Apache virtual hosts folder
- Provide default plugins
    - Websites:
        - [X] Check if websites are active, based on their IP adress and the servers'
        - [X] Check if the websites are online (200 response)
        - [X] Check what the response time is
        - [X] Integrate with Google Pagespeed
        - [ ] Allow log-viewing..
    - Servers
        - [ ] Check used space, CPU usage etc
        - [ ] Check if online
- [ ] Provide nice UI
- [ ] Make it easy to setup (one-click deploy to Heroku)