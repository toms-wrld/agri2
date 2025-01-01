import { useState, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

const HelpChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatSession, setChatSession] = useState(null)

  // Initialize Gemini API
  useEffect(() => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    })
    
    // Start a chat session
    const session = model.startChat({
      history: [],
      // Add initial context about the calculator
      context: `You are a helpful assistant for an Agricultural Calculator that helps farmers calculate FYM (Farm Yard Manure) usage, fodder requirements, and environmental impact. You can help with understanding calculations, default values, and general guidance about sustainable farming practices.
                the calculator is used to calculate the amount of FYM (Farm Yard Manure) needed for a given area of land, the amount of fodder required for a given number of animals, and the environmental impact of the farming practices used.`
    })
    
    setChatSession(session)
  }, [])

  const handleSend = async () => {
    if (!inputMessage.trim() || !chatSession) return

    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: inputMessage }])
    setIsLoading(true)

    try {
      // Send message to Gemini
      const result = await chatSession.sendMessage(inputMessage)
      const response = await result.response
      const text = response.text()
      
      // Add AI response to UI
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: text
      }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
      setInputMessage('')
    }
  }

  return (
    <div className="help-chat-container">
      <button 
        className={`help-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '×' : '?'}
        <span className="help-tooltip">Need help?</span>
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Agricultural Calculator Help</h3>
            <button 
              className="close-chat"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
          
          <div className="messages-container">
            {messages.length === 0 && (
              <div className="message assistant">
                Hello! I can help you understand the calculator's features and calculations. What would you like to know?
              </div>
            )}
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="message assistant loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HelpChat 