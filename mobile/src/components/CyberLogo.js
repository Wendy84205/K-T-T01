import React from 'react';
import { View, Text } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

/**
 * CyberLogo — Logo thương hiệu CyberSecure
 * Tương tự logo trên web: gradient indigo + icon Shield + text
 * 
 * Props:
 *  - size: 'sm' | 'md' | 'lg' (default: 'md')
 *  - showText: boolean (default: true)
 *  - horizontal: boolean (default: false) — icon và text nằm ngang
 */
export default function CyberLogo({ size = 'md', showText = true, horizontal = false }) {
  const config = {
    sm: { icon: 28, box: 44, radius: 12, title: 16, sub: 8 },
    md: { icon: 36, box: 56, radius: 16, title: 22, sub: 10 },
    lg: { icon: 48, box: 72, radius: 20, title: 28, sub: 12 },
  }[size] || { icon: 36, box: 56, radius: 16, title: 22, sub: 10 };

  const IconBox = (
    <View
      style={{
        width: config.box,
        height: config.box,
        borderRadius: config.radius,
        // Gradient indigo giong web: #6366f1 → #818cf8
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
        // Glow effect
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {/* Inner gradient using overlay View */}
      <View
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '50%',
          borderTopLeftRadius: config.radius,
          borderTopRightRadius: config.radius,
          backgroundColor: 'rgba(255,255,255,0.12)',
        }}
      />
      <ShieldCheck size={config.icon} color="#ffffff" strokeWidth={2} />
    </View>
  );

  const TextBlock = showText && (
    <View style={horizontal ? { marginLeft: 12 } : { alignItems: 'center', marginTop: 12 }}>
      <Text
        style={{
          fontSize: config.title,
          fontWeight: '900',
          color: '#F8FAFC',
          letterSpacing: -0.5,
          lineHeight: config.title * 1.2,
        }}
      >
        CyberSecure
      </Text>
      <Text
        style={{
          fontSize: config.sub,
          fontWeight: '700',
          color: '#6366F1',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          marginTop: 2,
        }}
      >
        Enterprise Platform
      </Text>
    </View>
  );

  return horizontal ? (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {IconBox}
      {TextBlock}
    </View>
  ) : (
    <View style={{ alignItems: 'center' }}>
      {IconBox}
      {TextBlock}
    </View>
  );
}
