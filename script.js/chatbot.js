const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-mess");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closechatbot = document.querySelector("#close-chatbot");
const API_KEY = "AIzaSyDjENE1IQArBver9f5MEtCQRG12AmXQkBs";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
const userData = {
    message: null
}

const history = [];

const initialInputHeight = messageInput.scrollHeight;

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}
const generateBotResponse = async() => {
    history.push({
        role: "user",
        parts: [{text: userData.message}]
    });
    const requestOptions = { 
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify({
            contents:history,
    })
  }
    
    const thinkingMessageDiv = chatBody.querySelector(".messages.thinking");
    try{
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        
        if(!response.ok) throw new Error(data.error.message);

        const rawResponseText = data.candidates[0].content.parts[0].text;
        let apiResponseText = rawResponseText.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        apiResponseText = apiResponseText.replace(/\n/g, "<br>"); 
        history.push({
        role: "model",
        parts: [{text: apiResponseText}]
    });
        
        thinkingMessageDiv.classList.remove("thinking");
        thinkingMessageDiv.querySelector(".message-text").innerHTML = apiResponseText;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        thinkingMessageDiv.classList.remove("thinking");
        thinkingMessageDiv.querySelector(".message-text").innerHTML = 
            "Xin lỗi, đã xảy ra lỗi khi tạo phản hồi.";
    } finally {
        chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"}); 
    }
}


const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    const messageContent = `<div class="message-text"></div>`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"}); 

    setTimeout(() => {
    const messageContent = ` <svg class="bot-avt" xmls="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 5.92 2 10.5C2 13.39 4.03 15.91 7 17.11V22L11.11 19.56C11.74 19.78 12.36 19.89 13 19.89C18.52 19.89 23 16.97 23 12.39C23 7.81 18.52 4.89 13 4.89C12.36 4.89 11.74 5 11.11 5.22C10.48 3.34 9.3 2 8 2H12Z" fill="#0b72a8"/>
            </svg>
            <div class="message-text"> 
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>`;
    const incomingMessageDiv = createMessageElement(messageContent, "messages", "thinking");
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"}); 
    generateBotResponse();
 }, 600);
} 

messageInput.addEventListener("keydown", (e) => {
    const userMessage = messageInput.value.trim();
    if (e.key === "Enter" && userMessage !== "") {
        handleOutgoingMessage(e);
    }
});

messageInput.addEventListener("input", () => { 
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "30px";
});
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e)); 
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("chatbot-open"));
closechatbot.addEventListener("click", () => document.body.classList.remove("chatbot-open"));