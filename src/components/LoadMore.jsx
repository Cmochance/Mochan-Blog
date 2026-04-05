export default function LoadMore({ hasMore, loading, onLoadMore }) {
  if (!hasMore) return null;

  return (
    <div className="pagination">
      <button
        className="editor-btn editor-btn-primary pagination-btn"
        onClick={onLoadMore}
        disabled={loading}
      >
        {loading ? '加载中...' : '加载更多'}
      </button>
    </div>
  );
}
