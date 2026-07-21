import ArticleCallout from "@/components/academy/ArticleCallout"
import type { AcademyArticle } from "@/lib/academy"

// Renders an article's block list into styled reading content. Heading blocks
// (h3 + callouts) receive ids from `headingIds`, consumed in document order so
// they stay in sync with the table of contents built by articleToc().
export default function ArticleBody({
  article,
  headingIds,
}: {
  article: AcademyArticle
  headingIds: string[]
}) {
  let h = 0
  return (
    <div id="uvod" className="scroll-mt-24">
      {article.body.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="my-4 text-[16px] leading-[1.75] text-slate-600">
                {block.text}
              </p>
            )
          case "ul":
            return (
              <ul key={i} className="my-4 space-y-2 pl-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-2.5 text-[16px] leading-[1.7] text-slate-600">
                    <span
                      aria-hidden
                      className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-steel"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )
          case "h3":
            return (
              <h3
                key={i}
                id={headingIds[h++]}
                className="mt-8 mb-2 scroll-mt-24 text-lg font-semibold text-slate-900"
              >
                {block.text}
              </h3>
            )
          case "callout":
            return (
              <ArticleCallout
                key={i}
                id={headingIds[h++]}
                variant={block.variant}
                heading={block.heading}
              >
                {block.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </ArticleCallout>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
