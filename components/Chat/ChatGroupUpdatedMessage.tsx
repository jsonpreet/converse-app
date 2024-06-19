import { GroupUpdatedContent } from "@xmtp/react-native-sdk";
import { useMemo } from "react";
import { StyleSheet, Text, useColorScheme } from "react-native";

import {
  currentAccount,
  getInboxIdStore,
  getProfilesStore,
} from "../../data/store/accountsStore";
import { textSecondaryColor } from "../../utils/colors";
import { getPreferredName } from "../../utils/profile";
import { MessageToDisplay } from "./Message/Message";

export default function ChatGroupUpdatedMessage({
  message,
}: {
  message: MessageToDisplay;
}) {
  const styles = useStyles();
  const membersActions = useMemo(() => {
    const content = JSON.parse(message.content) as GroupUpdatedContent;
    const textMessages: string[] = [];
    const profiles = getProfilesStore(currentAccount()).getState().profiles;
    const byInboxId = getInboxIdStore(currentAccount()).getState().byInboxId;
    content.membersAdded.forEach((m) => {
      // TODO: Feat: handle multiple members
      const firstAddress = byInboxId[m.inboxId]?.[0];
      const readableName = getPreferredName(
        profiles[firstAddress]?.socials,
        firstAddress
      );
      textMessages.push(`${readableName} joined the conversation`);
    });
    content.membersRemoved.forEach((m) => {
      // TODO: Feat: handle multiple members
      const firstAddress = byInboxId[m.inboxId]?.[0];
      const readableName = getPreferredName(
        profiles[firstAddress]?.socials,
        firstAddress
      );
      textMessages.push(`${readableName} left the conversation`);
    });
    return textMessages;
  }, [message.content]);
  return (
    <>
      {membersActions.map((a) => (
        <Text key={a} style={styles.groupChange}>
          {a}
        </Text>
      ))}
    </>
  );
}

const useStyles = () => {
  const colorScheme = useColorScheme();
  return StyleSheet.create({
    groupChange: {
      color: textSecondaryColor(colorScheme),
      fontSize: 11,
      textAlign: "center",
      width: "100%",
      marginTop: 5,
      marginBottom: 9,
    },
  });
};
