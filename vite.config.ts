import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    {
      name: 'api-proxy',
      configureServer(server) {
        server.middlewares.use('/api/claude', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method not allowed')
            return
          }

          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            try {
              const { content, action } = JSON.parse(body)
              const apiKey = process.env.ANTHROPIC_API_KEY
              
              if (!apiKey || apiKey === 'your_api_key_here') {
                res.statusCode = 400
                res.end(JSON.stringify({ error: '请先配置 ANTHROPIC_API_KEY' }))
                return
              }

              const prompts = {
                refine: `请提炼以下内容的关键点，保持简洁，用中文回复，不要添加任何开场白或结束语，直接输出提炼后的内容：\n\n${content}`,
                search: `请针对以下内容，提供相关的背景信息、作者介绍或延伸阅读建议。用中文回复，保持简洁，不要添加开场白：\n\n${content}`
              }

              const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': apiKey,
                  'anthropic-version': '2023-06-01',
                  'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                  model: 'claude-sonnet-4-20250514',
                  max_tokens: 1024,
                  messages: [{
                    role: 'user',
                    content: prompts[action as keyof typeof prompts] || prompts.refine
                  }]
                })
              })

              const data = await response.json()
              
              if (data.error) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: data.error.message }))
                return
              }

              const result = data.content?.[0]?.text || ''
              res.end(JSON.stringify({ result }))
            } catch (error) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: '请求失败' }))
            }
          })
        })

        server.middlewares.use('/api/stock', async (req, res) => {
          if (req.method !== 'GET') {
            res.statusCode = 405
            res.end('Method not allowed')
            return
          }

          const url = new URL(req.url || '', 'http://localhost')
          const symbol = url.searchParams.get('symbol')

          if (!symbol) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: '请提供股票代码' }))
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
              res.statusCode = 404
              res.end(JSON.stringify({ error: '未找到该股票' }))
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

            res.end(JSON.stringify({
              symbol: symbol.toUpperCase(),
              name: meta.shortName || symbol,
              price: currentPrice,
              currency: meta.currency || 'USD',
              yearChange: yearChange
            }))
          } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: '获取股票数据失败' }))
          }
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    },
  },
})
