import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Changelog — KeyZen",
  description: "List of recent commits to the KeyZen codebase.",
}

const REPO_OWNER = "shivabhattacharjee"
const REPO_NAME = "KeyZen"
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`

export const revalidate = 1800

type CommitType =
  | "feat"
  | "fix"
  | "perf"
  | "refactor"
  | "docs"
  | "style"
  | "test"
  | "build"
  | "ci"
  | "chore"
  | "revert"
  | "merge"
  | "other"

interface ApiCommit {
  sha: string
  html_url: string
  commit: {
    author: { name: string; date: string } | null
    message: string
  }
  author: { login: string; avatar_url: string } | null
}

interface ParsedCommit {
  sha: string
  shortSha: string
  url: string
  type: CommitType
  scope?: string
  subject: string
  date: string
  iso: string
  authorLogin?: string
  authorName?: string
  coAuthors: string[]
}

const TYPE_META: Record<CommitType, { label: string; className: string }> = {
  feat: {
    label: "feat",
    className: "border-primary/40 text-primary bg-primary/5",
  },
  fix: {
    label: "fix",
    className: "border-destructive/40 text-destructive bg-destructive/5",
  },
  perf: {
    label: "perf",
    className:
      "border-green-500/40 bg-green-500/5 text-green-600 dark:text-green-400",
  },
  refactor: {
    label: "refactor",
    className: "border-border text-muted-foreground bg-muted/40",
  },
  docs: {
    label: "docs",
    className: "border-border text-muted-foreground bg-muted/40",
  },
  style: {
    label: "style",
    className: "border-border text-muted-foreground bg-muted/40",
  },
  test: {
    label: "test",
    className: "border-border text-muted-foreground bg-muted/40",
  },
  build: {
    label: "build",
    className: "border-border text-muted-foreground bg-muted/40",
  },
  ci: {
    label: "ci",
    className: "border-border text-muted-foreground bg-muted/40",
  },
  chore: {
    label: "chore",
    className: "border-border text-muted-foreground bg-muted/40",
  },
  revert: {
    label: "revert",
    className: "border-destructive/40 text-destructive bg-destructive/5",
  },
  merge: {
    label: "merge",
    className: "border-border text-muted-foreground bg-muted/40",
  },
  other: {
    label: "commit",
    className: "border-border text-muted-foreground bg-muted/40",
  },
}

function parseCommit(api: ApiCommit): ParsedCommit {
  const message = api.commit.message ?? ""
  const lines = message.split("\n")
  const firstLine = lines[0] ?? ""

  let type: CommitType = "other"
  let subject = firstLine
  let scope: string | undefined

  if (/^Merge /i.test(firstLine)) {
    type = "merge"
  } else {
    const m = firstLine.match(
      /^(feat|fix|perf|refactor|docs|style|test|build|ci|chore|revert)(?:\(([^)]+)\))?!?:\s*(.+)$/i
    )
    if (m) {
      type = m[1].toLowerCase() as CommitType
      scope = m[2]
      subject = m[3].trim()
    }
  }

  subject = subject.replace(/\s*\(#\d+\)\s*$/, "")

  const coAuthors = lines
    .filter((l) => /^Co-Authored-By:/i.test(l.trim()))
    .map((l) => {
      const name = l.replace(/^Co-Authored-By:\s*/i, "").replace(/<[^>]+>/, "").trim()
      return name
    })
    .filter((n) => n.length > 0 && !/noreply/i.test(n))

  const isoDate = api.commit.author?.date ?? new Date().toISOString()
  const d = new Date(isoDate)
  return {
    sha: api.sha,
    shortSha: api.sha.slice(0, 7),
    url: api.html_url,
    type,
    scope,
    subject,
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    iso: isoDate,
    authorLogin: api.author?.login,
    authorName: api.commit.author?.name,
    coAuthors,
  }
}

async function fetchCommits(): Promise<ParsedCommit[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=60`,
      {
        next: { revalidate },
        headers: { Accept: "application/vnd.github+json" },
      }
    )
    if (!res.ok) return []
    const json = (await res.json()) as ApiCommit[]
    return json.map(parseCommit)
  } catch {
    return []
  }
}

interface MonthGroup {
  key: string
  label: string
  items: ParsedCommit[]
}

function groupByMonth(commits: ParsedCommit[]): MonthGroup[] {
  const groups: MonthGroup[] = []
  const seen = new Map<string, number>()
  for (const c of commits) {
    const d = new Date(c.iso)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    const idx = seen.get(key)
    if (idx === undefined) {
      seen.set(key, groups.length)
      groups.push({ key, label, items: [c] })
    } else {
      groups[idx].items.push(c)
    }
  }
  return groups
}

export default async function ChangelogPage() {
  const commits = await fetchCommits()
  const groups = groupByMonth(commits)

  let rowIndex = 0

  return (
    <main className="relative flex flex-1 flex-col px-6 py-10 md:py-16">
      <div
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden
      />

      <div className="mx-auto w-full max-w-site">
        <Hero />

        {commits.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="relative mt-14">
            <div
              className="pointer-events-none absolute top-4 bottom-4 left-3 w-px bg-gradient-to-b from-primary/50 via-border to-transparent"
              aria-hidden
            />

            <div className="space-y-14">
              {groups.map((group) => (
                <section key={group.key} className="space-y-6">
                  <MonthMarker label={group.label} count={group.items.length} />
                  <ul className="space-y-5">
                    {group.items.map((c) => {
                      const idx = rowIndex++
                      return <CommitRow key={c.sha} commit={c} index={idx} />
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-16 flex items-center justify-between border-t border-border pt-6 text-sm">
          <Link
            href="/"
            className="text-primary underline-offset-4 hover:underline"
          >
            ← Back to typing test
          </Link>
        </footer>
      </div>
    </main>
  )
}

function Hero() {
  return (
    <header className="changelog-hero relative">
      <h1 className="font-(family-name:--font-doto) text-4xl leading-none font-bold text-foreground md:text-5xl">
        CHANGELOG
      </h1>

      <p className="md:text-md mt-3 text-sm leading-relaxed text-muted-foreground">
        A list of changes to the KeyZen codebase . This includes new features,
        bug fixes, performance improvements, and more.
      </p>
    </header>
  )
}

function MonthMarker({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        aria-hidden
        className="-ml-0.5 shrink-0"
      >
        <circle
          cx="14"
          cy="14"
          r="10"
          className="fill-background stroke-primary/60"
          strokeWidth="1"
          strokeDasharray="2 3"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 14 14"
            to="360 14 14"
            dur="18s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="14" cy="14" r="3.5" className="fill-primary">
          <animate
            attributeName="r"
            values="3.5;5;3.5"
            dur="2.2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0.55;1"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      <h2 className="font-(family-name:--font-doto) text-lg text-foreground">
        {label}
      </h2>
      <span className="font-(family-name:--font-mono) text-[11px] text-muted-foreground">
        · {count} commit{count === 1 ? "" : "s"}
      </span>
      <span
        className="ml-2 flex-1 border-t border-dashed border-border"
        aria-hidden
      />
    </div>
  )
}

function CommitRow({ commit, index }: { commit: ParsedCommit; index: number }) {
  const meta = TYPE_META[commit.type]
  return (
    <li
      className="commit-row group relative pl-9"
      style={{ animationDelay: `${Math.min(index, 24) * 55}ms` }}
    >
      <span
        className="absolute top-[0.55rem] left-[7px] block size-2.5 rounded-full border border-primary bg-background shadow-[0_0_0_3px_var(--background)] transition-all duration-300 group-hover:scale-110 group-hover:bg-primary"
        aria-hidden
      />

      <a
        href={commit.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-md px-1 py-1 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className={`inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 font-(family-name:--font-mono) text-[10px] tracking-wider uppercase ${meta.className}`}
          >
            {meta.label}
            {commit.scope && (
              <span className="ml-1 opacity-70">/{commit.scope}</span>
            )}
          </span>
          <p className="flex-1 text-[15px] leading-snug text-foreground">
            {commit.subject}
          </p>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 font-(family-name:--font-mono) text-[11px] text-muted-foreground">
            {(commit.authorLogin ?? commit.authorName) && (
              <>
                <span aria-hidden>·</span>
                <span>{commit.authorLogin ? `@${commit.authorLogin}` : commit.authorName}</span>
              </>
            )}
            {commit.coAuthors.map((name) => (
              <span key={name} className="flex items-center gap-1">
                <span aria-hidden>&amp;</span>
                <span title="co-author">{name}</span>
              </span>
            ))}
          </span>
        </div>
      </a>
    </li>
  )
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-md border border-dashed border-border p-8 text-center">
      <svg
        viewBox="0 0 48 48"
        className="mx-auto mb-3 size-10 text-muted-foreground"
        aria-hidden
      >
        <circle
          cx="24"
          cy="24"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 24 24"
            to="360 24 24"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>
        <path
          d="M18 24h12M24 18v12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
      <p className="font-(family-name:--font-mono) text-sm text-muted-foreground">
        couldn&apos;t reach github right now.
      </p>
      <a
        href={`${REPO_URL}/commits/main`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm text-primary underline-offset-4 hover:underline"
      >
        view commits on github ↗
      </a>
    </div>
  )
}
