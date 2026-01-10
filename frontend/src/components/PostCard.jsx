import { formatDate } from '../lib/date.js';

export default function PostCard({ post, index = 0, onClick, actions }) {
  return (
    <article
      className="post-card"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <time className="post-date">{formatDate(post.date)}</time>
      <h3 className="post-title">{post.title}</h3>
      <p className="post-excerpt">{post.excerpt}</p>
      {post.tags && post.tags.length > 0 ? (
        <div className="post-tags">
          {post.tags.map((tag) => (
            <span className="post-tag" key={`${post.slug}-${tag}`}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {actions}
    </article>
  );
}
