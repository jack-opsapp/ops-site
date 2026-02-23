/**
 * PostContent — Renders sanitised blog-post HTML with styled prose
 *
 * Server component. Uses isomorphic-dompurify to sanitise the raw HTML
 * from Supabase, then renders it with child-selector styles for headings,
 * paragraphs, links, lists, images, and blockquotes.
 *
 * NOTE: dangerouslySetInnerHTML is used intentionally here:
 * 1. The style tag contains only our own static CSS — no user input.
 * 2. The post content is sanitised with DOMPurify before rendering.
 */

import DOMPurify from 'isomorphic-dompurify';

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  const clean = DOMPurify.sanitize(content);

  return (
    <section className="bg-ops-background-light">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .post-content h2 {
              font-family: var(--font-heading);
              font-weight: 600;
              font-size: 1.5rem;
              line-height: 1.3;
              color: #1A1A1A;
              margin-top: 3rem;
              margin-bottom: 1rem;
            }

            .post-content h3 {
              font-family: var(--font-heading);
              font-weight: 600;
              font-size: 1.25rem;
              line-height: 1.4;
              color: #1A1A1A;
              margin-top: 2rem;
              margin-bottom: 0.75rem;
            }

            .post-content p {
              font-family: var(--font-body);
              font-size: 1rem;
              line-height: 1.75;
              color: rgba(26, 26, 26, 0.8);
              margin-bottom: 1.5rem;
            }

            .post-content a {
              color: #597794;
              text-decoration: underline;
              text-underline-offset: 2px;
            }

            .post-content a:hover {
              opacity: 0.8;
            }

            .post-content blockquote {
              border-left: 2px solid #597794;
              padding-left: 1.5rem;
              font-family: var(--font-caption);
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #999999;
              margin-top: 2rem;
              margin-bottom: 2rem;
            }

            .post-content ul {
              list-style-type: disc;
              padding-left: 1.5rem;
              margin-bottom: 1.5rem;
            }

            .post-content ol {
              list-style-type: decimal;
              padding-left: 1.5rem;
              margin-bottom: 1.5rem;
            }

            .post-content ul li,
            .post-content ol li {
              font-family: var(--font-body);
              font-size: 1rem;
              line-height: 1.75;
              color: rgba(26, 26, 26, 0.8);
              margin-bottom: 0.5rem;
            }

            .post-content img {
              width: 100%;
              border-radius: 3px;
              margin-top: 2rem;
              margin-bottom: 2rem;
            }

            .post-content strong {
              font-weight: 600;
            }

            .post-content hr {
              border: none;
              height: 1px;
              background: rgba(26, 26, 26, 0.1);
              margin-top: 2.5rem;
              margin-bottom: 2.5rem;
            }
          `,
        }}
      />

      <div className="max-w-[680px] mx-auto px-6 pt-12">
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: clean }}
        />
      </div>
    </section>
  );
}
