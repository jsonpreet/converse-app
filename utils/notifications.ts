import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { saveMessages } from "../data";
import { XmtpConversation } from "../data/store/chatStore";
import { buildUserInviteTopic } from "../vendor/xmtp-js/src/utils";
import api from "./api";
import { saveExpoPushToken } from "./keychain";
import {
  emptySavedNotificationsMessages,
  loadSavedNotificationsMessages,
} from "./sharedData/sharedData";

let expoPushToken: string | null;

export type NotificationPermissionStatus =
  | "granted"
  | "undetermined"
  | "denied";

let lastSubscribedTopics: string[] = [];

export const subscribeToNotifications = async (
  address: string,
  conversations: XmtpConversation[],
  blockedPeerAddresses: { [peerAddress: string]: boolean }
): Promise<void> => {
  const topics = [
    ...conversations
      .filter(
        (c) =>
          c.peerAddress &&
          !c.pending &&
          !blockedPeerAddresses[c.peerAddress.toLowerCase()]
      )
      .map((c) => c.topic),
    buildUserInviteTopic(address || ""),
  ];
  const [expoTokenQuery, nativeTokenQuery] = await Promise.all([
    Notifications.getExpoPushTokenAsync(),
    Notifications.getDevicePushTokenAsync(),
  ]);
  expoPushToken = expoTokenQuery.data;
  saveExpoPushToken(expoPushToken);

  // Let's check if we need to make the query i.e
  // the topics are not exactly the same
  const shouldMakeQuery =
    lastSubscribedTopics.length !== topics.length ||
    topics.some((t) => !lastSubscribedTopics.includes(t));
  if (!shouldMakeQuery) return;
  lastSubscribedTopics = topics;
  try {
    await api.post("/api/subscribe", {
      expoToken: expoPushToken,
      nativeToken: nativeTokenQuery.data,
      nativeTokenType: nativeTokenQuery.type,
      topics,
    });
  } catch (e: any) {
    console.log("Could not subscribe to notifications");
    console.log(e?.message);
  }
};

export const subscribeToNewTopic = async (topic: string): Promise<void> => {
  await Notifications.setNotificationChannelAsync("default", {
    name: "Converse Notifications",
    importance: Notifications.AndroidImportance.MAX,
    showBadge: false,
  });
  const expoTokenQuery = await Notifications.getExpoPushTokenAsync();
  expoPushToken = expoTokenQuery.data;
  try {
    await api.post("/api/subscribe/append", {
      expoToken: expoPushToken,
      topic,
    });
  } catch (e: any) {
    console.log("Could not subscribe to new topic");
    console.log(e?.message);
  }
};

export const disablePushNotifications = async (): Promise<void> => {
  if (expoPushToken) {
    try {
      await api.delete(`/api/device/${encodeURIComponent(expoPushToken)}`);
    } catch (e: any) {
      console.log("Could not unsubscribe from notifications");
      console.error(e);
    }
    expoPushToken = null;
  }
};

export const getNotificationsPermissionStatus = async (): Promise<
  NotificationPermissionStatus | undefined
> => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Converse Notifications",
      importance: Notifications.AndroidImportance.MAX,
      showBadge: false,
    });
  }
  const { status } = await Notifications.getPermissionsAsync();
  return status;
};

export const requestPushNotificationsPermissions = async (): Promise<
  NotificationPermissionStatus | undefined
> => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Converse Notifications",
      importance: Notifications.AndroidImportance.MAX,
      showBadge: false,
    });
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus;
};

let loadingSavedNotifications = false;

const waitForLoadingSavedNotifications = async () => {
  if (!loadingSavedNotifications) return;
  await new Promise((r) => setTimeout(r, 100));
  await waitForLoadingSavedNotifications();
};

export const loadSavedNotificationMessagesToContext = async () => {
  if (loadingSavedNotifications) {
    await waitForLoadingSavedNotifications();
    return;
  }
  loadingSavedNotifications = true;
  try {
    const messages = await loadSavedNotificationsMessages();
    await emptySavedNotificationsMessages();
    messages.sort((m1: any, m2: any) => m1.sent - m2.sent);
    await Promise.all(
      messages.map((message: any) =>
        saveMessages(
          [
            {
              id: message.id,
              senderAddress: message.senderAddress,
              sent: message.sent,
              content: message.content,
              status: "sent",
              sentViaConverse: !!message.sentViaConverse,
              contentType: message.contentType || "xmtp.org/text:1.0",
            },
          ],
          message.topic
        )
      )
    );

    loadingSavedNotifications = false;
  } catch (e) {
    console.log(
      "An error occured while loading saved notifications messages",
      e
    );
    emptySavedNotificationsMessages();
    loadingSavedNotifications = false;
  }
};
