"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

export function withProtectedRoute<P extends object>(Component: React.ComponentType<P>) {
  return function Protected(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
