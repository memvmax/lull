export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { content, action } = req.body
    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      res.status(400).json({ error: '请先配置 ANTHROPIC_API_KEY' })
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
      res.status(400).json({ error: data.error.message })
      return
    }

    const result = data.content?.[0]?.text || ''
    res.status(200).json({ result })
  } catch (error) {
    res.status(500).json({ error: '请求失败' })
  }
}
