export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { symbol } = req.query

  if (!symbol) {
    res.status(400).json({ error: '请提供股票代码' })
    return
  }

  try {
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)
    const period1 = Math.floor(yearStart.getTime() / 1000)
    const period2 = Math.floor(now.getTime() / 1000)

    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${period1}&period2=${period2}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )

    const data = await response.json()
    
    const result = data.chart?.result?.[0]
    if (!result) {
      res.status(404).json({ error: '未找到该股票' })
      return
    }

    const meta = result.meta || {}
    const closes = result.indicators?.quote?.[0]?.close || []
    
    const currentPrice = meta.regularMarketPrice || closes[closes.length - 1]
    
    let yearStartPrice = null
    for (let i = 0; i < closes.length; i++) {
      if (closes[i] !== null) {
        yearStartPrice = closes[i]
        break
      }
    }
    
    let yearChange = 0
    if (yearStartPrice && currentPrice) {
      yearChange = ((currentPrice - yearStartPrice) / yearStartPrice) * 100
    }

    res.status(200).json({
      symbol: (symbol as string).toUpperCase(),
      name: meta.shortName || symbol,
      price: currentPrice,
      currency: meta.currency || 'USD',
      yearChange: yearChange
    })
  } catch (error) {
    res.status(500).json({ error: '获取股票数据失败' })
  }
}
