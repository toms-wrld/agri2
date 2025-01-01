import { useState, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import ReactMarkdown from 'react-markdown'

const HelpChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatSession, setChatSession] = useState(null)

  // Add markdown styling
  const markdownStyles = {
    p: { margin: '0.5rem 0' },
    'ul,ol': { marginLeft: '1.5rem' },
    'h1,h2,h3,h4': { margin: '1rem 0 0.5rem' },
    code: {
      backgroundColor: '#f1f5f9',
      padding: '0.2rem 0.4rem',
      borderRadius: '0.25rem',
      fontSize: '0.9em'
    },
    pre: {
      backgroundColor: '#f1f5f9',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      overflow: 'auto'
    },
    table: {
      borderCollapse: 'collapse',
      width: '100%',
      margin: '1rem 0'
    },
    'th,td': {
      border: '1px solid #e2e8f0',
      padding: '0.5rem'
    }
  }

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
      history: [{
        role: "user",
        parts: [
          {text: "You are a helpful assistant for an Agricultural Calculator that helps farmers calculate FYM (Farm Yard Manure) usage, fodder requirements, and environmental impact. You can help with understanding calculations, default values, and general guidance about sustainable farming practices.\n  the calculator is used to calculate the amount of FYM (Farm Yard Manure) needed for a given area of land, the amount of fodder required for a given number of animals, and the environmental impact of the farming practices used.\n  Agricultural Calculator\n Features\n  1. Farm Yard Manure (FYM) Calculations\n  An interactive web-based calculator designed to help farmers optimize their agricultural practices by calculating Farm Yard Manure (FYM) usage, fodder requirements, and environmental impact assessment. By using the Bajrang Ban and Other Agricultural Practices.\n Land holding and farmer category determination\n  Cropping cycle analysis\n Post-harvest residue (PHR) generation estimation\n                FYM requirement and generation calculations\n                Cost analysis for FYM purchase and composting\n                2. Fodder Calculations\n                Dry fodder requirement estimation\n                Fodder purchase cost optimization\n                Enzyme treatment calculations\n                Revenue projections from increased milk yield\n                Overall gain analysis\n                3. Impact Analytics\n                Overall gain percentage with PHR utilization\n                Revenue impact assessment\n                Direct GHG emissions avoidance calculation\n                Environmental impact analysis\n                CO₂ reduction through improved milk yield\n                Usage\n                Enter your land holding details and farming information\n                Navigate through the sections using the top navigation bar\n\n                Use the \"Change Defaults\" buttons to customize calculations\n                Access the help chat for instant assistance\n                View impact analytics to understand environmental benefits\n                Contributing\n                Contributions are welcome! Please feel free to submit a Pull Request.    \n                Credits:Development Team,Divyajyoti Biswal and Sarthak Chavhan.Project Guide,Dr. Sachin Mandavgane\n                Department\n                Chemical Engineering, VNIT (Visvesvaraya National Institute of Technology)\n                For any queries regarding the calculator, please contact:\n Professor Sachin Mandavgane , Dept of Chemical Engineering , VNIT Nagpur,\n Email: sam@che.vnit.ac.in \n  Mobile :+91 9823246329 ,\n  answer in short only unless mentioned to answer in detail "},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Okay, I understand! I'm here to help you navigate the Agricultural Calculator. I can assist you with understanding the different calculations, the default values used, and how to interpret the results. I can also provide general information about sustainable farming practices related to FYM, fodder, and environmental impact.\n\nLet's break down the calculator's features and how I can help:\n\n**1. Farm Yard Manure (FYM) Calculations:**\n\n*   **Land holding and farmer category determination:** This section likely takes your land area and maybe your farmer category (small, medium, large) into account. I can explain why these factors are important for FYM requirements.\n*   **Cropping cycle analysis:**  Understanding your cropping cycle is crucial. I can help you see how different crops affect FYM needs and how to plan accordingly.\n*   **Post-harvest residue (PHR) generation estimation:** I can explain why PHR is valuable and how this calculator estimates it. I can also discuss how PHR can be used to reduce the need for external FYM purchases.\n*   **FYM requirement and generation calculations:** This is where the core calculation happens. I can help you interpret the results, explain the units used, and why specific default values (if any) are chosen.\n*   **Cost analysis for FYM purchase and composting:** If you're purchasing FYM, or considering composting, this section is useful. I can help explain how these costs are calculated.\n\n**2. Fodder Calculations:**\n\n*   **Dry fodder requirement estimation:** I can explain how the calculator estimates the amount of dry fodder needed for your animals based on their type and number.\n*   **Fodder purchase cost optimization:**  I can help you understand how the tool might suggest ways to optimize your fodder purchases based on the calculated requirement.\n*   **Enzyme treatment calculations:**  I can explain what enzyme treatment of fodder entails and how it can potentially increase nutrient availability for your animals.\n*   **Revenue projections from increased milk yield:**  I can help you understand how increased fodder quality and/or enzyme treatment can lead to higher milk yields, and the revenue impact.\n*   **Overall gain analysis:** This is the final analysis, where you can see the net financial gain from optimized fodder management. I can help you make sense of this.\n\n**3. Impact Analytics:**\n\n*   **Overall gain percentage with PHR utilization:** I can explain how using PHR increases the financial gain.\n*   **Revenue impact assessment:**  This ties together the financial gains from both FYM and fodder optimization. I can help you interpret the overall revenue changes.\n*   **Direct GHG emissions avoidance calculation:** I can help explain how the tool calculates the reduction in greenhouse gas emissions due to sustainable practices like FYM usage instead of chemical fertilizers.\n*   **Environmental impact analysis:** This likely provides a summary of the overall environmental benefits. I can explain how the calculator assesses the environmental impact.\n*   **CO₂ reduction through improved milk yield:** I can explain how better animal nutrition and increased milk yield can reduce the carbon footprint.\n\n**How can I help you today?**\n\nTo give you the best assistance, please tell me:\n\n*   **What specific part of the calculator are you working with?**  (e.g., FYM calculations, fodder calculations, etc.)\n*   **What information are you trying to calculate or understand?** (e.g., \"How much FYM do I need?\", \"How does enzyme treatment of fodder work?\", \"What do these environmental impact numbers mean?\")\n*   **Are there any specific results or inputs you're unsure about?**\n*   **Do you want to know more about a specific default value?**\n*   **Do you have questions about the underlying principles of any of the calculations?**\n\nI'm ready to help you make the most of this Agricultural Calculator! Just ask.\n"},
        ],
        role: "user",
        parts: [
            {text: "Answer in short only unless mentioned to answer in detail, and based on the context provided as much as possible , don't create assumptions or anything if not sure about the context"}
        ],
        role: "model",
        parts: [
            {text: "Great! I'll try to maintain the context and answer in short only unless mentioned to answer in detail"}
        ],
      },],
      // Add initial context about the calculator
      context: `You are a helpful assistant for an Agricultural Calculator that helps farmers calculate FYM (Farm Yard Manure) usage, fodder requirements, and environmental impact. You can help with understanding calculations, default values, and general guidance about sustainable farming practices.
                the calculator is used to calculate the amount of FYM (Farm Yard Manure) needed for a given area of land, the amount of fodder required for a given number of animals, and the environmental impact of the farming practices used.
                Agricultural Calculator
                Features
                1. Farm Yard Manure (FYM) Calculations
                An interactive web-based calculator designed to help farmers optimize their agricultural practices by calculating Farm Yard Manure (FYM) usage, fodder requirements, and environmental impact assessment. By using the Bajrang Ban (which is a product created by the project team, contact us for more information) and Other Agricultural Practices.
                Land holding and farmer category determination
                Cropping cycle analysis
                Post-harvest residue (PHR) generation estimation
                FYM requirement and generation calculations
                Cost analysis for FYM purchase and composting
                2. Fodder Calculations
                Dry fodder requirement estimation
                Fodder purchase cost optimization
                Enzyme treatment calculations
                Revenue projections from increased milk yield
                Overall gain analysis
                3. Impact Analytics
                Overall gain percentage with PHR utilization
                Revenue impact assessment
                Direct GHG emissions avoidance calculation
                Environmental impact analysis
                CO₂ reduction through improved milk yield
                Usage
                Enter your land holding details and farming information
                Navigate through the sections using the top navigation bar

                Use the "Change Defaults" buttons to customize calculations
                Access the help chat for instant assistance
                View impact analytics to understand environmental benefits
                Contributing
                Contributions are welcome! Please feel free to submit a Pull Request.    
                Credits:Development Team,Divyajyoti Biswal and Sarthak Chavhan.Project Guide,Dr. Sachin Mandavgane
                Department
                Chemical Engineering, VNIT (Visvesvaraya National Institute of Technology)
                For any queries regarding the calculator, please contact:
                Email: sam@che.vnit.ac.in (this is email of the dr sachin mandavgane ,professor at
                Department of Chemical Engineering, VNIT`
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
                <ReactMarkdown>
                  Hello! I can help you understand the calculator's features and calculations. What would you like to know?
                </ReactMarkdown>
              </div>
            )}
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p style={markdownStyles.p}>{children}</p>,
                      ul: ({ children }) => <ul style={markdownStyles['ul,ol']}>{children}</ul>,
                      ol: ({ children }) => <ol style={markdownStyles['ul,ol']}>{children}</ol>,
                      h1: ({ children }) => <h1 style={markdownStyles['h1,h2,h3,h4']}>{children}</h1>,
                      h2: ({ children }) => <h2 style={markdownStyles['h1,h2,h3,h4']}>{children}</h2>,
                      h3: ({ children }) => <h3 style={markdownStyles['h1,h2,h3,h4']}>{children}</h3>,
                      code: ({ children }) => <code style={markdownStyles.code}>{children}</code>,
                      pre: ({ children }) => <pre style={markdownStyles.pre}>{children}</pre>,
                      table: ({ children }) => <table style={markdownStyles.table}>{children}</table>,
                      th: ({ children }) => <th style={markdownStyles['th,td']}>{children}</th>,
                      td: ({ children }) => <td style={markdownStyles['th,td']}>{children}</td>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
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