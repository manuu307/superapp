"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

export function withProtectedRoute(Component: React.ComponentType) {
  return function Protected(props: any) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
