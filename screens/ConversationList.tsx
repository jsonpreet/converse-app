import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ColorSchemeName,
  FlatList,
  Platform,
  PlatformColor,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Text,
} from "react-native";
import { FAB } from "react-native-paper";

import ActivityIndicator from "../components/ActivityIndicator/ActivityIndicator";
import ConversationListItem from "../components/ConversationListItem";
import DebugButton from "../components/DebugButton";
import InitialLoad from "../components/InitialLoad";
import Picto from "../components/Picto/Picto";
import SettingsButton from "../components/SettingsButton";
import Welcome from "../components/Welcome";
import config from "../config";
import { AppContext } from "../data/store/context";
import { XmtpConversation } from "../data/store/xmtpReducer";
import {
  backgroundColor,
  textPrimaryColor,
  textSecondaryColor,
} from "../utils/colors";
import { lastValueInMap } from "../utils/map";
import { conversationName } from "../utils/str";
import { NavigationParamList } from "./Main";

function NewConversationButton({
  navigation,
}: NativeStackScreenProps<NavigationParamList, "Messages">) {
  const debugRef = useRef();
  const { state } = useContext(AppContext);
  const shouldShowDebug =
    config.debugMenu ||
    config.debugAddresses.includes(state.xmtp.address || "");
  const onPress = useCallback(() => {
    navigation.navigate("NewConversation", {});
  }, [navigation]);
  const onLongPress = useCallback(() => {
    if (!shouldShowDebug || !debugRef.current) {
      return;
    }
    (debugRef.current as any).showDebugMenu();
  }, [shouldShowDebug]);
  if (Platform.OS === "ios") {
    return (
      <TouchableOpacity
        activeOpacity={0.2}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        {shouldShowDebug && <DebugButton ref={debugRef} />}
        <Picto
          picto="square.and.pencil"
          weight="medium"
          color={PlatformColor("systemBlue")}
          size={16}
          style={{ width: 32, height: 32 }}
        />
      </TouchableOpacity>
    );
  } else {
    return (
      <FAB
        icon={(props) => (
          <>
            {shouldShowDebug && <DebugButton ref={debugRef} />}
            <Picto
              picto="square.and.pencil"
              weight="medium"
              color={props.color}
              size={24}
            />
          </>
        )}
        animated={false}
        style={{
          position: "absolute",
          margin: 0,
          right: 16,
          bottom: 20,
        }}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    );
  }
}

function ShareProfileButton({
  navigation,
}: NativeStackScreenProps<NavigationParamList, "Messages">) {
  const colorScheme = useColorScheme();
  return (
    <TouchableOpacity
      activeOpacity={0.2}
      onPress={() => {
        navigation.navigate("ShareProfile");
      }}
    >
      <Picto
        picto="qrcode"
        weight="medium"
        color={
          Platform.OS === "ios"
            ? PlatformColor("systemBlue")
            : textSecondaryColor(colorScheme)
        }
        size={Platform.OS === "ios" ? 16 : 24}
        style={{
          width: Platform.OS === "android" ? undefined : 32,
          height: Platform.OS === "android" ? undefined : 32,
          marginRight: Platform.OS === "android" ? 0 : 20,
        }}
      />
    </TouchableOpacity>
  );
}

type FlatListItem = XmtpConversation | { topic: string };

export default function ConversationList({
  navigation,
  route,
}: NativeStackScreenProps<NavigationParamList, "Messages">) {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);
  const { state } = useContext(AppContext);
  const [flatListItems, setFlatListItems] = useState<FlatListItem[]>([]);
  useEffect(() => {
    const conversations = Object.values(state.xmtp.conversations).filter(
      (a) => a?.peerAddress
    );
    conversations.sort((a, b) => {
      const aDate =
        a.lazyMessages.length > 0
          ? a.lazyMessages[0].sent
          : (a.messages?.size > 0
              ? lastValueInMap(a.messages)?.sent
              : a.createdAt) || a.createdAt;
      const bDate =
        b.lazyMessages.length > 0
          ? b.lazyMessages[0].sent
          : (b.messages?.size > 0
              ? lastValueInMap(b.messages)?.sent
              : b.createdAt) || b.createdAt;
      return bDate - aDate;
    });
    setFlatListItems([...conversations, { topic: "welcome" }]);
  }, [state.xmtp.conversations, state.xmtp.lastUpdateAt]);
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (state.xmtp.address ? <SettingsButton /> : null),
      headerRight: () => (
        <>
          <ShareProfileButton navigation={navigation} route={route} />
          {Platform.OS === "ios" && (
            <NewConversationButton navigation={navigation} route={route} />
          )}
        </>
      ),
    });
  }, [navigation, route, state.xmtp.address]);
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        if (!state.xmtp.initialLoadDone || state.xmtp.loading) {
          return <ActivityIndicator />;
        } else {
          return Platform.OS === "android" ? (
            <Text style={styles.androidTitle}>Converse</Text>
          ) : undefined;
        }
      },
    });
  }, [
    navigation,
    state.xmtp.initialLoadDone,
    state.xmtp.loading,
    styles.androidTitle,
  ]);
  const keyExtractor = useCallback((item: FlatListItem) => {
    return item.topic;
  }, []);
  const renderItem = useCallback(
    ({ item }: { item: FlatListItem }) => {
      if (item.topic === "welcome") {
        return <Welcome ctaOnly navigation={navigation} route={route} />;
      }

      const conversation = item as XmtpConversation;

      return (
        <ConversationListItem
          navigation={navigation}
          conversation={conversation}
          colorScheme={colorScheme}
          conversationTopic={conversation.topic}
          conversationTime={
            conversation.messages?.size > 0
              ? lastValueInMap(conversation.messages)?.sent
              : conversation.createdAt
          }
          conversationName={conversationName(conversation)}
          lastMessagePreview={
            state.xmtp.blockedPeerAddresses[
              conversation.peerAddress.toLowerCase()
            ]
              ? "This user is blocked"
              : conversation.lazyMessages.length > 0
              ? conversation.lazyMessages[0].content
              : conversation.messages?.size > 0
              ? lastValueInMap(conversation.messages)?.content
              : ""
          }
        />
      );
    },
    [colorScheme, navigation, route, state.xmtp.blockedPeerAddresses]
  );

  if (!state.xmtp.initialLoadDoneOnce && flatListItems.length <= 1) {
    return <InitialLoad />;
  }

  if (flatListItems.length === 1) {
    return <Welcome ctaOnly={false} navigation={navigation} route={route} />;
  }

  return (
    <>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        style={styles.conversationList}
        data={flatListItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={20}
      />
      {Platform.OS === "android" && (
        <NewConversationButton navigation={navigation} route={route} />
      )}
    </>
  );
}

const getStyles = (colorScheme: ColorSchemeName) =>
  StyleSheet.create({
    conversationList: {
      flex: 1,
      backgroundColor: backgroundColor(colorScheme),
    },
    androidTitle: {
      color: textPrimaryColor(colorScheme),
      fontSize: 22,
      lineHeight: 26,
    },
  });
