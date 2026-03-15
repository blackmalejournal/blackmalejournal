interface ArticleBodyProps {
  body: string;
}

export function ArticleBody({ body }: ArticleBodyProps) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-article space-y-6">
      {paragraphs.map((para, i) => {
        if (para.startsWith('## ')) {
          return (
            <h2 key={i} className="mt-10 font-display text-2xl text-bmj-white">
              {para.slice(3)}
            </h2>
          );
        }
        if (para.startsWith('# ')) {
          return (
            <h2 key={i} className="mt-12 font-display text-3xl text-bmj-white">
              {para.slice(2)}
            </h2>
          );
        }
        if (para.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-4 border-bmj-red bg-bmj-amber/10 px-6 py-4 font-body text-lg italic text-bmj-amber"
            >
              {para.slice(2)}
            </blockquote>
          );
        }
        return (
          <p key={i} className="font-body text-lg leading-[1.8] text-bmj-cream/90">
            {para}
          </p>
        );
      })}
    </div>
  );
}
