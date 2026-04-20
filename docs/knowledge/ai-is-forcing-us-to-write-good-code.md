# AI Is Forcing Us To Write Good Code - by Steve Krenzel

# AI Is Forcing Us To Write Good Code

### When Best Practices Are Best

[

![Steve Krenzel's avatar](https://substackcdn.com/image/fetch/$s_!YgWQ!,w_36,h_36,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe43bdbf9-1325-4d3d-b2e1-ef4e0495b5e2_1024x1024.jpeg)

](https://substack.com/@stevekrenzel)

[Steve Krenzel](https://substack.com/@stevekrenzel)

Dec 30, 2025

45

2

4

Share

![Header Image](https://substackcdn.com/image/fetch/$s_!M5s0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff0d94e7a-5c6a-4801-a96c-4e2104f96419_2752x1536.jpeg)

For decades, we’ve all known what “good code” looks like. Thorough tests. Clear documentation. Small, well-scoped modules. Static typing. Dev environments you can spin up without a minor religious ritual.

These things were always _optional_, and time pressure usually meant _optional_ got cut.

**Agents need these optional things though.** They aren’t great at making a mess and cleaning it up later. Agents will happily be the Roomba that rolls over dog poop and drags it all over your house.

The only guardrails are the ones you **set and** **enforce**. If the agentic context is lacking and the guardrails aren’t sufficient, you’ll find yourself in a world of pain[1](#footnote-1). But if the guardrails are solid, the LLM can bounce around tirelessly until the only path out is the correct one.

[Our six-person team](https://logic.inc) has made a lot of specific and, sometimes, controversial investments to accommodate our agentic coders. Let’s talk about some of the less obvious ones.

---

## 100% Percent Code Coverage

![Header Image](https://substackcdn.com/image/fetch/$s_!Ml4F!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3bd6926e-35fe-448d-9bbe-9b87f61d0c2f_2752x1536.jpeg)

The most controversial guideline we have is our most valuable: **We require 100% code coverage**[2](#footnote-2).

Everyone is skeptical when they hear this until they live with it for a day. It feels like a secret weapon at times.

Coverage, as we use it, isn’t strictly about bug prevention; it’s about guaranteeing the agent has double-checked the behavior of every line of code it wrote.

The usual misinterpretation is that people think we believe 100% coverage means “no bugs”. Or that we’re chasing a metric, and metrics get gamed. Neither of those are the case here.

Why 100%? At 95% coverage, you’re still making decisions about what’s “important enough” to test. At 99.99%, you don’t know if that uncovered line in _./src/foo.ts_ was there before you started work on the new feature. At 100%, there’s a **phase change** and all of that ambiguity goes away[3](#footnote-3). If a line isn’t covered, it’s because of something you actively just did.  
  
The coverage report becomes a simple todo list of tests you still need to write. It’s also one less degree of freedom we have to give to the agent to reason about.

![](https://substackcdn.com/image/fetch/$s_!7kIE!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ce50397-2e75-4be5-b8c4-071e7d6cd36a_1200x896.png)
At 100% coverage, the leverage you get from the tests experiences a step-function increase.

When a model adds or changes code, we force it to demonstrate how that line behaves. It can’t stop at “this seems right.” It has to back it up with an executable example.

Other nice benefits: Unreachable code gets deleted. Edge cases are made explicit. And code reviews become easier because you see concrete examples of how every aspect of the system is expected to behave or change.

---

## Namespaces Are One Honking Great Idea. Let’s do more of those.[4](#footnote-4)

![Header Image](https://substackcdn.com/image/fetch/$s_!WdHC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc53a3f7e-3b45-4192-9e4e-e08c88d2a6fc_2752x1536.jpeg)

The main mechanism agentic tools use to navigate your codebase is the filesystem**.** They list directories, read filenames, search for strings, and pull files into context.

**You should treat your directory structure and file naming with the same thoughtfulness you’d treat any other interface.**

A file called _./billing/invoices/compute.ts_ communicates much more than _./utils/helpers.ts_, even if the code inside is identical. Help the LLM out and give your files thoughtful organization.

Additionally, **prefer many small well-scoped files.**

It improves how context gets loaded. Agents often summarize or truncate large files when they pull them into their working set. Small files reduce that risk. If a file is short enough to be loaded in full, the model can keep the entire thing active in context.

In practice, it will speed up the agent’s flow and eliminate a whole class of degraded performance.

---

## Fast, Ephemeral, Concurrent Dev Environments

![Header Image](https://substackcdn.com/image/fetch/$s_!ME7a!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd6927228-e121-41b0-8cbe-9b96d8b0a13d_2752x1536.jpeg)

In the old world, you lived in one dev environment. This is where you’d craft your perfect solution, tweak things, run commands, restart servers, and gradually converge on a solution.

With agents, [you do something closer to beekeeping](https://bits.logic.inc/p/engineering-is-becoming-beekeeping), orchestrating across processes without knowing the specifics of what exactly is happening within each of them. So you need to cultivate a good and healthy hive.

#### Fast

You need your automated guardrails to run quickly, because you need to run them often.

The goal is to keep the agent on a short leash: _make a small change,_ _check it, fix it, repeat._

You can run them a few ways: agent hooks, git hooks, or just prompting (i.e. in your _AGENTS.md_), but no matter how you run them, your quality checks need to be cheap enough that running them constantly is not slowing things down.

In our setup, every _npm test_ creates a brand new database, runs migrations, and executes the full suite.

This only works for us because we’ve made each of those stages exceptionally fast. We run tests with high concurrency, strong isolation, and [a caching layer](https://github.com/with-logic/fast-forward) for third-party calls[5](#footnote-5). We have 10,000+ assertions that finish in about a minute. Without caching, it takes 20-30 minutes, which would add hours if you expected an agent to run tests several times per task.

#### Ephemeral

Once you get comfortable with agents, you naturally start running many of them. You’ll spin up and tear down many dev environments multiple times a day. That has to all be fully automated or you’ll avoid doing it.

We have a simple workflow here:

`new-feature <name>`

That command creates a new git worktree, copies in local config that doesn’t live in git (like `.env` files), installs dependencies, and then starts your agent with a prompt to interview you to write a PRD together. If the feature name is descriptive enough, it may even just ask to get right to work, assuming it can figure out the rest of the context on its own.

The important part isn’t our specific scripts. It’s the latency. If it takes minutes and involves a bunch of tinkering and manual configuration, you won’t do it. If it is one command and takes 1-2 seconds, you’ll do it constantly.

In our case, one command gives you a fresh, working environment almost immediately, with an agent ready to start.

#### Concurrent

The final piece is being able to run each environment at the same time. Having a bunch of worktrees doesn’t help if you can only have one of them active at a time.

That means anything that could conflict (e.g. ports, database names, caches, background jobs) needs to be configurable (ideally via environment variables) or otherwise allocated in some conflict-free way.

If you use Docker you get some of this for free, but the general requirement is the same: you need a solid isolation story so you can run several fully functioning dev environments on one machine without cross-talk.

---

## End-To-End Types

![Header Image](https://substackcdn.com/image/fetch/$s_!YIal!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F19ade39f-158a-485b-b6c2-a995a928b8aa_2752x1536.jpeg)

More broadly, automate the enforcement of as many best practices as you can. Remove degrees of freedom from the LLM. If you’re not already using automatic linters and formatters[6](#footnote-6), start there. Make those as strict as possible and configured to automatically apply fixes whenever the LLM finishes a task or is about to commit[7](#footnote-7).

**But you should also be using a typed language**[8](#footnote-8).

Entire categories of illegal states and transitions can be eliminated. And types shrink the search space of possible actions the model can take, while doubling as source-of-truth documentation describing exactly what kind of data flows through each layer.

#### TypeScript

We lean on TypeScript pretty heavily. If something can be reasonably represented cleanly in the type system, we do it.

And we push semantic meaning into the type names. The goal is to make “what is this?” and “where does it go?” answerable at a glance.

When you’re working with agents, good semantic names are an amplifier. If the model sees a type like `UserId`, `WorkspaceSlug`, or `SignedWebhookPayload`, it can immediately understand what kind of thing it is dealing with. It can also search for that thing easily.

Generic names like `T` are fine when you’re writing a small self-contained generic algorithm, but much less helpful when you’re communicating intent inside a real business system.

#### OpenAPI

On the API side, we use OpenAPI and generate well-typed clients, so the frontend and backend agree on shapes.

#### Postgres

On the data side, we use Postgres’ type system as best as we can, and add checks and triggers for invariants that don’t fit into simple column types. Postgres doesn’t have a particularly rich type system, but it has enough there to enforce a surprising amount of correctness. If an agent tries to write invalid data, our database will usually complain clearly and loudly. And we use [Kysely](https://kysely.dev/) to generate well-typed TypeScript clients for us.

All of our other 3rd-party clients either give us good types, or we wrap them to give us good types.

---

Agents are tireless and often brilliant coders, but they’re only as effective as the environment you place them in. Once you realize this, “good code” stops feeling superfluous and starts feeling essential.

Yes, the upfront work feels like a tax, but it’s the same tax we’ve all been dodging for years. So pay it intentionally. Put it on your agentic roadmap, get it funded by eng leadership, and finally ship the codebase you always hoped for.

Subscribe

[1](#footnote-anchor-1)

Often, when teams struggle with agentic coding, it’s AI reflecting and amplifying their codebase’s worst tendencies.

[2](#footnote-anchor-2)

100% coverage is actually the minimum bar we set. We encourage writing tests for as many scenarios as is possible, even if it means the same lines getting exercised multiple times. It gets us closer to 100% path coverage as well, though we don’t enforce (or measure) that.

[3](#footnote-anchor-3)

It’s also remarkably easy to maintain 100% once you hit it. The coverage report enumerates exactly what lines need testing, which the LLM happily handles.

[4](#footnote-anchor-4)

We personally like [Biome](https://biomejs.dev/),

[5](#footnote-anchor-5)

Among other mechanisms, we use githooks for this.

[6](#footnote-anchor-6)

Don’t use Python. Even with type annotations. Just use TypeScript. It makes me a little sad to say, having written Python for 20+ years, but TypeScript’s is just a much better type system.

[7](#footnote-anchor-7)

[https://peps.python.org/pep-0020/#the-zen-of-python](https://peps.python.org/pep-0020/#the-zen-of-python)

[8](#footnote-anchor-8)

When we run tests in CI/CD, after the PR is approved, we run them without caching just to ensure there wasn’t a subtle assumption violated by the cache. It also double-checks that we’re still talking to all of our 3rd-party integrations correctly.

---

#### Subscribe to Bits of Logic

AI, automation, and decision intelligence.

Subscribe

By subscribing, you agree Substack's [Terms of Use](https://substack.com/tos), and acknowledge its [Information Collection Notice](https://substack.com/ccpa#personal-data-collected) and [Privacy Policy](https://substack.com/privacy).

[

![Henning Spjelkavik's avatar](https://substackcdn.com/image/fetch/$s_!SB7R!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc33d3897-601d-4caf-ba78-9ab43df02906_1920x1280.jpeg)

](https://substack.com/profile/6963996-henning-spjelkavik)[

![Gregory Tod's avatar](https://substackcdn.com/image/fetch/$s_!Rg0z!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F369ec74e-6cb3-478c-8065-18e3b78938ef_144x144.png)

](https://substack.com/profile/258707170-gregory-tod)[

![MBFK's avatar](https://substackcdn.com/image/fetch/$s_!JoWN!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd2d4fbca-9235-46b8-abf8-2fae54e4b457_1536x2048.jpeg)

](https://substack.com/profile/116161372-mbfk)[

![Max Olson's avatar](https://substackcdn.com/image/fetch/$s_!Bh-t!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F6b79f4d3-4c66-4fd9-9cad-49d086ca759b_1527x1420.jpeg)

](https://substack.com/profile/4628073-max-olson)[

![Steven Hudson's avatar](https://substackcdn.com/image/fetch/$s_!Kkr5!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F455da81c-5bbb-4435-b56c-361b0aa047b7_350x350.jpeg)

](https://substack.com/profile/291497-steven-hudson)

45 Likes∙

[4 Restacks](https://substack.com/note/p-182812243/restacks?utm_source=substack&utm_content=facepile-restacks)

45

2

4

Share

PreviousNext

## Embedded Content