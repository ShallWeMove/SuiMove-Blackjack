import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SideBar() {
  useEffect(() => {
    const ws = new WebSocket("ws://localhost/ws");

    ws.onmessage = (event) => {
      toast(event.data.digest, { autoClose: 10000 });
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return (
    <ToastContainer
      position="bottom-right"
      newestOnTop
      pauseOnFocusLoss={false}
    />
  );
}
