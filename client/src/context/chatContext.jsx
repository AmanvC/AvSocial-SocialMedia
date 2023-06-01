import { createContext, useState } from "react";

export const ChatContext = createContext(null);

export const ChatContextProvider = ({ children }) => {
  const [allChats, setAllChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <ChatContext.Provider
      value={{ allChats, setAllChats, selectedChat, setSelectedChat }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContextProvider;
