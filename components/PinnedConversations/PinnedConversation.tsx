import { useSelect } from "@data/store/storeHelpers";
import { useGroupNameQuery } from "@queries/useGroupNameQuery";
import { useGroupPhotoQuery } from "@queries/useGroupPhotoQuery";
import { backgroundColor, textSecondaryColor } from "@styles/colors";
import { AvatarSizes } from "@styles/sizes";
import { ConversationWithLastMessagePreview } from "@utils/conversation";
import { showUnreadOnConversation } from "@utils/conversation/showUnreadOnConversation";
import { FC, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import Avatar from "..//Avatar";
import {
  useChatStore,
  useCurrentAccount,
  useProfilesStore,
} from "../../data/store/accountsStore";
import { navigate } from "../../utils/navigation";
import { getPreferredAvatar, getPreferredName } from "../../utils/profile";
import GroupAvatar from "../GroupAvatar";

interface Props {
  conversation: ConversationWithLastMessagePreview;
}

export const PinnedConversation: FC<Props> = ({ conversation }) => {
  const account = useCurrentAccount() as string;
  const profiles = useProfilesStore((s) => s.profiles);
  const { topic, isGroup } = conversation;
  const { data: groupName } = useGroupNameQuery(account, topic, {
    refetchOnMount: false,
  });
  const { data: groupPhoto } = useGroupPhotoQuery(account, topic, {
    refetchOnMount: false,
  });
  const title = isGroup ? groupName : conversation.conversationTitle;
  const socials = profiles[conversation.peerAddress as string]?.socials;
  const avatar = isGroup ? groupPhoto : getPreferredAvatar(socials);
  const setPinnedConversations = useChatStore((s) => s.setPinnedConversations);
  const styles = useStyles();

  const onPress = useCallback(() => {
    navigate("Conversation", {
      topic: conversation.topic,
    });
  }, [conversation.topic]);

  const onLongPress = useCallback(() => {
    setPinnedConversations([conversation]);
  }, [conversation, setPinnedConversations]);
  const { initialLoadDoneOnce, topicsData } = useChatStore(
    useSelect(["initialLoadDoneOnce", "topicsData"])
  );

  const showUnread = useMemo(
    () =>
      showUnreadOnConversation(
        initialLoadDoneOnce,
        conversation.lastMessagePreview,
        topicsData,
        conversation,
        account
      ),
    [account, conversation, initialLoadDoneOnce, topicsData]
  );

  const avatarComponent = isGroup ? (
    <GroupAvatar
      key={conversation.topic}
      uri={avatar}
      size={AvatarSizes.pinnedConversation}
      style={styles.avatar}
      topic={conversation.topic}
      showIndicator={showUnread}
    />
  ) : (
    <Avatar
      key={conversation.topic}
      uri={avatar}
      size={AvatarSizes.pinnedConversation}
      style={styles.avatar}
      name={getPreferredName(socials, conversation.peerAddress || "")}
      showIndicator={showUnread}
    />
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {avatarComponent}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const useStyles = () => {
  const colorScheme = useColorScheme();
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: backgroundColor(colorScheme),
    },
    container: {
      margin: 8,
      padding: 4,
    },
    avatar: { margin: 8 },
    text: {
      color: textSecondaryColor(colorScheme),
      textAlign: "center",
      flexWrap: "wrap",
      maxWidth: 100,
    },
  });
};
