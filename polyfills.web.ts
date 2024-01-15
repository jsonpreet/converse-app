import { Buffer } from "buffer";
import "setimmediate";
import * as Linking from "expo-linking";
import { Alert, AlertButton, AlertOptions } from "react-native";

window.Buffer = window.Buffer || Buffer;

Alert.alert = (
  title: string,
  message?: string | undefined,
  buttons?: AlertButton[] | undefined,
  options?: AlertOptions | undefined
) => {
  const confirmOption = buttons?.find(({ style }) => style !== "cancel");
  const cancelOption = buttons?.find(({ style }) => style === "cancel");

  if (confirmOption && cancelOption) {
    const result = window.confirm([title, message].filter(Boolean).join("\n"));
    if (result) {
      confirmOption?.onPress?.();
    } else {
      cancelOption?.onPress?.();
    }
  } else {
    window.alert([title, message].filter(Boolean).join("\n"));
    (confirmOption || cancelOption)?.onPress?.();
  }
};

(Linking as any).openURL = async (url: string) => {
  window.open(new URL(url, window.location.href).toString());
};
