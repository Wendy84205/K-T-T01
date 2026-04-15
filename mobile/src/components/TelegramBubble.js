import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CheckCheck } from 'lucide-react-native';

const Tail = ({ isMine, color }) => (
  <View style={[
    styles.tailContainer,
    isMine ? styles.tailRight : styles.tailLeft
  ]}>
    <Svg width="14" height="18" viewBox="0 0 14 18" fill="none">
      <Path
        d={isMine 
          ? "M0 18H14V0C14 0 12 18 0 18Z"
          : "M14 18H0V0C0 0 2 18 14 18Z"
        }
        fill={color}
      />
    </Svg>
  </View>
);

export default function TelegramBubble({ 
  content, 
  isMine, 
  time, 
  showTail, 
  isConsecutive, 
  status 
}) {
  // Dark Theme: indigo tint cho tin nhắn mình, surface cho người khác
  const bubbleColor = isMine ? '#2D2B55' : '#1E293B';

  return (
    <View style={[
      styles.rowContainer,
      { justifyContent: isMine ? 'flex-end' : 'flex-start' }
    ]}>
      <View style={[
        styles.container,
        isConsecutive ? styles.consecutiveMargin : styles.normalMargin
      ]}>
        <View style={[
          styles.bubble,
          { backgroundColor: bubbleColor },
          isMine ? styles.bubbleRight : styles.bubbleLeft,
          showTail && (isMine ? styles.noBottomRightRadius : styles.noBottomLeftRadius)
        ]}>
          <Text style={styles.text}>{content}</Text>
          
          <View style={styles.footer}>
            <Text style={[styles.time, isMine && { color: '#A5B4FC' }]}>{time}</Text>
            {isMine && status !== 'pending' && (
              <CheckCheck 
                size={15} 
                color="#A5B4FC" 
                strokeWidth={2} 
                style={{ marginLeft: 2 }} 
              />
            )}
          </View>

          {showTail && <Tail isMine={isMine} color={bubbleColor} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  container: {
    maxWidth: '85%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  normalMargin: {
    marginTop: 6,
  },
  consecutiveMargin: {
    marginTop: 2,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 5,
    borderRadius: 15,
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleRight: {
    borderBottomRightRadius: 15,
    marginRight: 8,
  },
  bubbleLeft: {
    borderBottomLeftRadius: 15,
    marginLeft: 8,
  },
  noBottomRightRadius: {
    borderBottomRightRadius: 4,
  },
  noBottomLeftRadius: {
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    color: '#F8FAFC', // tl-text
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginTop: -2,
    marginLeft: 16,
  },
  time: {
    fontSize: 11,
    color: '#94A3B8', // tl-muted
  },
  tailContainer: {
    position: 'absolute',
    bottom: 0,
    width: 14,
    height: 18,
  },
  tailRight: {
    right: 0, 
    transform: [{ translateX: 6 }],
  },
  tailLeft: {
    left: 0,
    transform: [{ translateX: -6 }],
  },
});
