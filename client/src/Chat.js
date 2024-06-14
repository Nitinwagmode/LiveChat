import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import Picker from "@emoji-mart/react";
import data from '@emoji-mart/data';
import { FaRegSmile, FaPaperclip, FaPaperPlane, FaEllipsisV } from 'react-icons/fa';
import "./Chat.css";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const sendMessage = async (messageData) => {
    await socket.emit("send_message", messageData);
    setMessageList((list) => [...list, messageData]);
    setCurrentMessage("");
  };

  const handleEmojiClick = (emojiObject) => {
    setCurrentMessage(currentMessage + emojiObject.native);
    setShowEmojiPicker(false);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const messageData = {
          room: room,
          author: username,
          message: "",
          file: reader.result,
          fileType: file.type,
          time: new Date(Date.now()).toLocaleTimeString(),
        };
        sendMessage(messageData);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", receiveMessageHandler);

    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, [socket]);

  const sendMessageHandler = () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).toLocaleTimeString(),
      };
      sendMessage(messageData);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
        <FaEllipsisV className="more-options" />
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => {
            return (
              <div key={index} className="message" id={username === messageContent.author ? "you" : "other"}>
                <img className="avatar" src={`https://i.pravatar.cc/150?u=${messageContent.author}`} alt="avatar" />
                <div>
                  <div className="message-content">
                    {messageContent.message && <p>{messageContent.message}</p>}
                    {messageContent.file && (
                      messageContent.fileType.startsWith('image/') ? (
                        <img src={messageContent.file} alt="file" />
                      ) : (
                        <video controls src={messageContent.file} />
                      )
                    )}
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <FaRegSmile onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
        {showEmojiPicker && (
          <Picker data={data} onEmojiSelect={handleEmojiClick} />
        )}
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessageHandler();
          }}
        />
        <input
          type="file"
          style={{ display: "none" }}
          id="file-input"
          onChange={handleFileChange}
        />
        <label htmlFor="file-input">
          <FaPaperclip />
        </label>
        <button onClick={sendMessageHandler}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

export default Chat;
