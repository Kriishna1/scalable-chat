"use client";
import { useState } from "react";
import { useSocket } from "../contexts/SocketProvider";
import classes from "./page.module.css";

export default function Page() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");

  return (
    <div>
      <div>
        <input
          onChange={(e) => setMessage(e.target.value)}
          className={classes["chat-input"]}
          placeholder="Message..."
          suppressHydrationWarning
        />
        <button
          onClick={(e) => sendMessage(message)}
          className={classes["button"]}
          suppressHydrationWarning
        >
          Send
        </button>
      </div>
      <div>
        {messages.map((e, index) => (
          <li key={`${index}-${e}`}>{e}</li>
        ))}
      </div>
    </div>
  );
}