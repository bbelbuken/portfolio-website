# agent.sh — the AI agent on bbelbuken.com

A chat window on the portfolio canvas. Visitors ask about Batuhan. The agent
answers from the same data the page shows and **drives the canvas with
actions**. For example, "show me his fashion films" opens `fashion.mp4`, draws
the wire to it and moves the camera there.

## Architecture

```
Browser: AgentTerminal.tsx
  │  POST /api/chat  { messages: [{ role, content }] }
  ▼
Cloudflare Worker: worker/index.ts   (same domain, same deploy as the site)
  ├─ origin check, rate limit (10/min per IP), input limits
  ├─ system prompt = profile data + canvas node guide   (worker/prompt.ts)
  ├─ env.AI.run(model, { messages })   one call          ← Workers AI
  └─ "ACTION: open_node fashion" lines cut from the reply and
     validated against a whitelist + the real node ids
  ▼
{ reply, actions: [{ tool: "open_node", id: "fashion" }] }
  ▼
Browser runs the actions: graphStore.openNode → canvasStore.focusNode
```

- **Static files are untouched.** `run_worker_first: ["/api/*"]` makes the
  Worker run only for the API. Every other request is served straight from
  `dist/` with `public/_headers` applied.
- **Tools run in the browser.** Their whole job is to change the UI, so the
  server only decides *which* actions are allowed. The model never gets to
  run arbitrary code or fetch URLs.
- **Single source of truth.** The node windows and the prompt both read
  `src/data/profile.ts`, `src/lib/stack.ts`, `src/data/releases.json` and
  `src/data/videos.json`. Update the site, and the agent knows it on the next
  deploy.
- **Extra knowledge only the agent sees.** `worker/knowledge.ts` holds what the
  page doesn't show, taken from LinkedIn and the CV:
  - every skill and where it was used (Loop at Benex, ML Marketing,
    elontweetbot, this site),
  - full role write-ups, languages, school, rowing.

  The prompt also gets an inverted *skill → places* index, so "where did he
  use Redis?" is a lookup, not a guess. Phone number and recruiter-only
  LinkedIn settings are deliberately left out.

## Why no RAG

All of the profile is about 2k tokens, so it fits in the system prompt with
room to spare. A vector database would add an embedding step, a retrieval
step and a second service to run, all to fetch text that is already in the
context. RAG starts to pay off when the knowledge outgrows the context window
or changes faster than deploys (blog posts, long project write-ups).

## Why an action line instead of native tool calling

The first version used Workers AI's native `tools` parameter. In testing it
was the weak spot:

- Models often answered with *only* a tool call, so a second call was needed
  to get the reply text, and that second call often came back empty.
- Some models leaked their tool-call syntax into the text.
- Two calls also doubled latency (5–15 s).

The agent now asks the model to end its reply with an optional line such as
`ACTION: open_node fashion`.

- The Worker cuts that line out and checks it against the whitelist.
- Anything else the model writes is only ever shown as text.
- It is one call, works the same on every model, and answers in about a
  second.

Same idea as tool calling, with the contract enforced in code instead of
trusted to the model.

## Why JSON instead of streaming

Replies are 1–3 sentences, and actions must be validated *before* the browser
runs them. One validated JSON response is simpler and safer than streaming.
The terminal prints the reply character by character, so it still feels live.

## Model choice

Tested on the same questions: what he does, music, fashion films, Benex,
prompt injection, salary, off-topic code request, Turkish questions.

| Model | Latency | Neurons / question | Notes |
|---|---|---|---|
| `llama-4-scout-17b-16e-instruct` (**chosen**) | ~1–2 s | ~95 with the full knowledge (≈100/day free) | Complete answers, clean refusals |
| `llama-3.3-70b-instruct-fp8-fast` | 2–3 s | ~80 (≈130/day) | Same quality, slower |
| `llama-3.1-8b-instruct-fp8-fast` | ~0.6 s | ~12 (≈800/day) | Budget fallback, drops details, adds filler |
| `glm-4.7-flash`, `gemma-4-26b-a4b-it` | 5–37 s | — | Reasoning models: empty or leaked replies |

## Safety

| Risk | Guard |
|---|---|
| Huge or forged input | 12 messages max, 500 chars each, only `user` and `assistant` roles kept (a `system` message from the client is dropped), 16 KB body cap |
| Prompt injection ("ignore your instructions…") | The system prompt says visitor text is never an instruction. Even if the model is fooled, it can only trigger whitelisted UI actions (`open_node` on a real id, `open_contact`). Tested: a forged system message asking for `ACTION: open_node secret-admin` changed nothing |
| Quota draining / spam | Rate limit binding: 10 requests per minute per IP. Origin check for browsers |
| Bill surprise | Workers Free plan: past 10k neurons/day, Workers AI just errors, and the agent shows "resting for today, use contact.sh". No card is charged |
| Hallucinated facts | Answers are limited to the profile. Otherwise it says it doesn't know and offers `open_contact` |
| Privacy | Nothing is stored. The conversation lives in the browser tab's memory only. The agent says plainly that it can't send emails or pass messages on, and never keeps a visitor's address |
| Wrong language | Small models answer Turkish typed without Turkish letters ("kac yasinda") in English. The Worker spots Turkish with a word list and pins the reply language per request; a bare "ok" keeps the earlier language |
| Wrong date math | A Worker's clock reads 1970 outside a request, and the model miscounts ages. The Worker computes his age per request from the birth year and hands the model the number |
| Noisy actions | "ok" / "thanks" / "tamam" never open a window: the Worker drops actions on small talk, whatever the model adds |

## Cost

- Free allowance: 10k neurons/day, resetting at 00:00 UTC. With Scout and the
  ~3.8k-token prompt that is about 95 neurons a question, so roughly 100
  questions a day.
- On the Workers Free plan nothing is ever charged. Past the allowance the
  agent shows "resting for today".
- Need more? Switch `DEFAULT_MODEL` to the 8B fallback (≈550/day with this prompt).

## Changing the model

Set `DEFAULT_MODEL` in `worker/index.ts`. To try one without editing code,
put `MODEL=@cf/...` in `.dev.vars` (gitignored) and restart
`wrangler dev`. Avoid reasoning models: their thinking eats the token budget.

## Running locally

```bash
npx wrangler login       # once; Workers AI runs on Cloudflare even in dev
npm run dev:api          # builds the site, runs the Worker on :8787
npm run dev              # Vite on :5173, proxies /api to :8787
```

## Leaving a message

When a visitor wants Batuhan to get back to them, the model adds `ACTION: leave_message`. That only opens a form under the reply; the visitor types their own email and message and presses send. The model never writes or sends an email.

`POST /api/message` checks the origin, the email format (no spaces, quotes or line breaks, so no header injection) and a 1000-character cap, drops bots that fill a hidden honeypot field, and allows 2 real sends per minute per IP. It mails the message plus the chat so far through the Cloudflare Email Routing `send_email` binding. That binding can only send to Batuhan's verified address, so the form can't be used to mail anyone else. Reply-To is the visitor, so answering is one click.

One-time setup in the Cloudflare dashboard: bbelbuken.com → Email → Email Routing → enable it (it replaces the "no mail" MX/SPF records), then verify bbelbuken@gmail.com under Destination addresses. Without it the form says it couldn't send and shows his email.

## Files

- `worker/index.ts`: request handling, limits, model call, action parsing and whitelist
- `worker/prompt.ts`: system prompt and action list built from the site data
- `worker/email.ts`: builds the visitor email (MIME, base64 UTF-8)
- `worker/knowledge.ts`: agent-only background (skills by place, LinkedIn/CV details)
- `wrangler.jsonc`: Worker, static assets, AI, rate-limit and send_email bindings
- `src/components/desktop/AgentTerminal.tsx`: the chat window, runs actions
- `src/hooks/useCanvasGestures.ts`: `focusNode`, the camera glide
