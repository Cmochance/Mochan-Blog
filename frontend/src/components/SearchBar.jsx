import { useEffect, useState } from 'react';

export default function SearchBar({ onSearch, placeholder = '搜索', initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(value.trim());
  };

  const clear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        className="form-input search-input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button className="editor-btn editor-btn-primary search-btn" type="submit">
        搜索
      </button>
      <button
        className="editor-btn editor-btn-secondary search-btn"
        type="button"
        onClick={clear}
      >
        清空
      </button>
    </form>
  );
}
