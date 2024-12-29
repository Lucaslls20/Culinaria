import React, { useState } from "react";
import { Snackbar } from "react-native-paper";

export const HandleLogout = ({ visible, message, color, onDismiss }: any) => {
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={3000}
      style={{ backgroundColor: color }}
    >
      {message}
    </Snackbar>
  );
};
