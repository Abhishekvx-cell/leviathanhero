# Leviathan — Superhero Help Portal

An original superhero site built for the TechAscent machine test (WHITEMATRIX).
Plain HTML, CSS and JavaScript — no build step, no dependencies, no backend.

```
index.html
css/style.css
js/config.js      ← the only file you need to edit
js/main.js        gate, water ambience, reveals, depth rail, wave ring
js/chatbot.js     the conversation + email delivery
assets/           hero portrait, avatar, favicon
```

## 1. Set your email (required)

Open `js/config.js` and replace the placeholder:

```js
heroEmail: "yourname@gmail.com",
```

That's the address that receives every grievance submitted through the chat.

### How delivery works

Default transport is **FormSubmit** — no account, no server, works from any static host.

1. Deploy the site (step 2).
2. Send one test message through the chatbot.
3. FormSubmit emails you a one-time activation link. Click it.
4. From then on every submission arrives in your inbox automatically, formatted as a table
   with the visitor's name, age, location, email, urgency, request and submission time.

Prefer EmailJS? Set `transport: "emailjs"` in `js/config.js` and fill in your public key,
service id and template id.

Until an email is configured the chat still runs end to end and prints the message it
would have sent to the browser console. Every submission is also kept in `localStorage`
under `leviathan:calls` as a backup.

## 2. Host it

Any static host works. Pick one:

- **Netlify** — drag the whole folder onto https://app.netlify.com/drop. Live in seconds.
- **Vercel** — `vercel deploy` in this folder, or import the repo.
- **GitHub Pages** — push the folder to a repo, then Settings → Pages → deploy from `main` / root.

There is nothing to build. Open `index.html` locally to preview (a local server is nicer:
`python3 -m http.server`).

## 3. What's in the experience

- **Entry gate** that floods and dissolves into the site.
- **Hero** built around the portrait as a faded circular presence behind the type, framed
  by two generated wave rings that turn against each other.
- **Ambient ocean** — rising bubbles on canvas, drifting caustics, light shafts, and a
  depth rail on the left that reads out how deep you've scrolled (0m at the surface,
  361m at the wreck where the Aqua Core was found).
- **Origin told as a dive log** rather than a block of text.
- **Powers, mission and personality** sections.
- **The chatbot** — Leviathan opens the conversation a few seconds after you enter,
  asks for name, age, location and email one question at a time, validates each answer
  in character, asks how urgent it is, then "So… tell me. How can I help you?".
  It reads the whole thing back as a card, asks for confirmation, sends the email and
  returns a reference number. Escape closes it; "Start over" resets it.
- Respects `prefers-reduced-motion`, keyboard focus is visible, responsive to 360px.

## 4. Changing the character

All copy lives in `index.html`. The chatbot's script — every question, every reply, every
validation message — is the `script` array near the top of `js/chatbot.js`. Colours and
type are CSS custom properties at the top of `css/style.css`.

## Submission checklist

Email `hr@whitematrix.co.in` with subject `TechAscent Machine Test – [Your Name]`:

- Your name
- College / branch
- Hosted website link
- GitHub repository link
