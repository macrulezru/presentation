import { fileURLToPath } from 'node:url'
import express from 'express'
import fs from 'fs/promises'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Добавляем middleware для логирования
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`)
  next()
})

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  next()
})

let productsData = null

async function loadProducts() {
  try {
    const filePath = path.resolve(process.cwd(), 'products.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    productsData = JSON.parse(fileContent)
    console.log(`✅ Продукты загружены: ${productsData.products.length} товаров`)
  } catch (error) {
    console.error('❌ Ошибка загрузки продуктов:', error.message)
    productsData = { products: [] }
  }
}

loadProducts()

app.get('/api/random', (req, res) => {
  const min = parseInt(req.query.min) || 1
  const max = parseInt(req.query.max) || 100

  if (min >= max) {
    return res.status(400).json({
      error: 'Параметр min должен быть меньше max',
    })
  }

  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min

  res.json({
    number: randomNumber,
    range: { min, max },
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/product', (req, res) => {
  if (!productsData || productsData.products.length === 0) {
    return res.status(503).json({
      error: 'Продукты не загружены',
      timestamp: new Date().toISOString(),
    })
  }

  // Получаем параметры из запроса
  const count = parseInt(req.query.count) || 1
  const category = req.query.category
  const minPrice = parseFloat(req.query.minPrice)
  const maxPrice = parseFloat(req.query.maxPrice)

  // Фильтруем продукты по параметрам
  let filteredProducts = [...productsData.products]

  if (category) {
    filteredProducts = filteredProducts.filter(
      product => product.category.toLowerCase() === category.toLowerCase(),
    )
  }

  if (!isNaN(minPrice)) {
    filteredProducts = filteredProducts.filter(product => product.price >= minPrice)
  }

  if (!isNaN(maxPrice)) {
    filteredProducts = filteredProducts.filter(product => product.price <= maxPrice)
  }

  if (filteredProducts.length === 0) {
    return res.status(404).json({
      error: 'Продукты по заданным критериям не найдены',
      filters: { category, minPrice, maxPrice },
      timestamp: new Date().toISOString(),
    })
  }

  // Выбираем случайные продукты
  const getRandomProducts = (products, num) => {
    const shuffled = [...products].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(num, products.length))
  }

  const selectedProducts = getRandomProducts(filteredProducts, count)

  res.json({
    count: selectedProducts.length,
    total: filteredProducts.length,
    filters: {
      category: category || 'любая',
      minPrice: !isNaN(minPrice) ? minPrice : 'не задано',
      maxPrice: !isNaN(maxPrice) ? maxPrice : 'не задано',
    },
    products: selectedProducts,
    timestamp: new Date().toISOString(),
  })
})

// Эндпоинт для получения продукта по ID
app.get('/api/product/:id', (req, res) => {
  if (!productsData || productsData.products.length === 0) {
    return res.status(503).json({
      error: 'Продукты не загружены',
      timestamp: new Date().toISOString(),
    })
  }

  const productId = parseInt(req.params.id)
  const product = productsData.products.find(p => p.id === productId)

  if (!product) {
    return res.status(404).json({
      error: `Продукт с ID ${productId} не найден`,
      timestamp: new Date().toISOString(),
    })
  }

  res.json({
    product,
    timestamp: new Date().toISOString(),
  })
})

// Эндпоинт для получения всех продуктов с пагинацией
app.get('/api/products', (req, res) => {
  if (!productsData || productsData.products.length === 0) {
    return res.status(503).json({
      error: 'Продукты не загружены',
      timestamp: new Date().toISOString(),
    })
  }

  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const category = req.query.category

  // Фильтрация по категории
  let filteredProducts = [...productsData.products]
  if (category) {
    filteredProducts = filteredProducts.filter(
      product => product.category.toLowerCase() === category.toLowerCase(),
    )
  }

  // Пагинация
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  res.json({
    page,
    limit,
    total: filteredProducts.length,
    totalPages: Math.ceil(filteredProducts.length / limit),
    hasNextPage: endIndex < filteredProducts.length,
    hasPrevPage: startIndex > 0,
    category: category || 'все',
    products: paginatedProducts,
    timestamp: new Date().toISOString(),
  })
})

// Эндпоинт для получения всех категорий
app.get('/api/categories', (req, res) => {
  if (!productsData || productsData.products.length === 0) {
    return res.status(503).json({
      error: 'Продукты не загружены',
      timestamp: new Date().toISOString(),
    })
  }

  const categories = [...new Set(productsData.products.map(p => p.category))]
  const categoryStats = categories.map(category => {
    const productsInCategory = productsData.products.filter(p => p.category === category)
    return {
      category,
      count: productsInCategory.length,
      minPrice: Math.min(...productsInCategory.map(p => p.price)),
      maxPrice: Math.max(...productsInCategory.map(p => p.price)),
      avgRating: (
        productsInCategory.reduce((sum, p) => sum + p.rating, 0) /
        productsInCategory.length
      ).toFixed(2),
    }
  })

  res.json({
    categories: categoryStats,
    totalCategories: categories.length,
    timestamp: new Date().toISOString(),
  })
})

app.post('/api/random', express.json(), (req, res) => {
  const { min = 1, max = 100, count = 1 } = req.body

  const numbers = Array.from(
    { length: count },
    () => Math.floor(Math.random() * (max - min + 1)) + min,
  )

  res.json({
    numbers,
    count,
    range: { min, max },
  })
})

export default app

if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`✅ Локальный сервер API запущен на порту ${PORT}`)
    console.log(`📚 Доступные эндпоинты:`)
    console.log(`   GET  /api/random            - случайное число`)
    console.log(`   GET  /api/product           - случайный продукт`)
    console.log(`   GET  /api/product/:id       - продукт по ID`)
    console.log(`   GET  /api/products          - все продукты с пагинацией`)
    console.log(`   GET  /api/categories        - все категории`)
    console.log(`   POST /api/random            - несколько случайных чисел`)
  })
}
