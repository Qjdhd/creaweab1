// ====================================================================
// KOMPONEN: CATEGORY FILTER - Filter video berdasarkan kategori
// ====================================================================
// Fungsi: Menampilkan tombol kategori untuk memfilter video
export function CategoryFilter({ onCategoryChange }) {
  const categories = ['Semua', 'Coding', 'Design', 'Marketing', 'Business', 'Entertainment']

  return (
    <div className="category-filter">
      {categories.map((category, index) => (
        <button
          key={index}
          className="category-btn"
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter
