"use client";
import React from "react";
import { SocketProvider } from "./SocketProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <SocketProvider>{children}</SocketProvider>;
};